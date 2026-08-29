// prisma/prune-legacy-content.ts
//
// Removes PageContent rows the current CMS schema cannot read.
//
// Before the schema-driven CMS, page content was written by hand-built
// editors (and by the seed script) using a different section vocabulary —
// `home/portfolio_intro`, `home/stats` shaped as `{ number, label }`, and so
// on. Those rows are not just unused: where a key name happens to collide
// with the new schema, they override the shipped copy with stale values.
//
// A row is dropped when the schema no longer declares its section, when it
// carries top-level keys the section does not declare, or when a list field
// holds rows with unknown sub-keys — each of which means the stored JSON
// belongs to a vocabulary the current site no longer speaks.
//
// Run with:  npx tsx prisma/prune-legacy-content.ts        (dry run)
//            npx tsx prisma/prune-legacy-content.ts --apply
//
// Rows that the schema reads cleanly are always left alone.

import { PrismaClient } from '@prisma/client';
import { getSectionDef } from '../lib/cms/schema';
import type { FieldDef } from '../lib/cms/types';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

function valueMatches(field: FieldDef, value: unknown): boolean {
  if (value === null || value === undefined) return true;

  switch (field.type) {
    case 'lines':
    case 'paragraphs':
    case 'images':
      return Array.isArray(value) && value.every((v) => typeof v === 'string');

    case 'links':
      return (
        Array.isArray(value) &&
        value.every(
          (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).every((k) => k === 'label' || k === 'href')
        )
      );

    case 'list': {
      if (!Array.isArray(value)) return false;
      const known = new Set((field.fields ?? []).map((f) => f.key));
      return value.every(
        (row) =>
          row && typeof row === 'object' && !Array.isArray(row) && Object.keys(row).every((k) => known.has(k))
      );
    }

    case 'number':
      return typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value)));

    case 'toggle':
      return typeof value === 'boolean';

    default:
      return typeof value === 'string';
  }
}

async function main() {
  const rows = await prisma.pageContent.findMany();
  const doomed: { page: string; section: string; reason: string }[] = [];

  for (const row of rows) {
    const def = getSectionDef(row.page, row.section);
    if (!def) {
      doomed.push({ page: row.page, section: row.section, reason: 'section no longer exists' });
      continue;
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(row.data);
    } catch {
      doomed.push({ page: row.page, section: row.section, reason: 'unreadable JSON' });
      continue;
    }

    const known = new Map(def.fields.map((f) => [f.key, f]));
    const unknownKeys = Object.keys(data).filter((key) => !known.has(key));
    if (unknownKeys.length > 0) {
      doomed.push({
        page: row.page,
        section: row.section,
        reason: `unknown field(s): ${unknownKeys.join(', ')}`,
      });
      continue;
    }

    const mismatched = Object.entries(data)
      .filter(([key, value]) => !valueMatches(known.get(key)!, value))
      .map(([key]) => key);
    if (mismatched.length > 0) {
      doomed.push({
        page: row.page,
        section: row.section,
        reason: `wrong shape for: ${mismatched.join(', ')}`,
      });
    }
  }

  if (doomed.length === 0) {
    console.log(`All ${rows.length} content row(s) match the current schema. Nothing to prune.`);
    return;
  }

  console.log(`${doomed.length} of ${rows.length} content row(s) are legacy:\n`);
  for (const row of doomed) {
    console.log(`  ${row.page}/${row.section} — ${row.reason}`);
  }

  if (!apply) {
    console.log('\nDry run. Re-run with --apply to delete them.');
    return;
  }

  for (const row of doomed) {
    await prisma.pageContent.delete({
      where: { page_section: { page: row.page, section: row.section } },
    });
  }
  console.log(`\nDeleted ${doomed.length} row(s). Those sections now render their schema defaults.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
