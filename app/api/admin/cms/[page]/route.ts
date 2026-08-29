import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getPageDef, getSectionDef, mergeSection } from '@/lib/cms/schema';

/**
 * Returns the page's content with schema defaults already merged in, plus the
 * list of sections that have a saved row, so the editor can show which
 * sections have been customised and offer "reset to default" only on those.
 */
export async function GET(_req: NextRequest, { params }: { params: { page: string } }) {
  const def = getPageDef(params.page);
  if (!def) {
    return NextResponse.json({ error: 'Unknown page' }, { status: 404 });
  }

  const rows = await prisma.pageContent.findMany({
    where: { page: params.page },
    select: { section: true, data: true, updatedAt: true },
  });

  const saved = new Map<string, Record<string, unknown>>();
  const updatedAt: Record<string, string> = {};
  for (const row of rows) {
    try {
      saved.set(row.section, JSON.parse(row.data));
      updatedAt[row.section] = row.updatedAt.toISOString();
    } catch {
      // Corrupt JSON — treat the section as never saved.
    }
  }

  const content: Record<string, Record<string, unknown>> = {};
  for (const section of def.sections) {
    content[section.key] = mergeSection(section, saved.get(section.key));
  }

  return NextResponse.json({
    content,
    customised: Array.from(saved.keys()),
    updatedAt,
  });
}

/** Save one section. The body is `{ section, data }`. */
export async function PATCH(req: NextRequest, { params }: { params: { page: string } }) {
  const pageDef = getPageDef(params.page);
  if (!pageDef) {
    return NextResponse.json({ error: 'Unknown page' }, { status: 404 });
  }

  let body: { section?: string; data?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { section, data } = body;
  if (typeof section !== 'string' || !section) {
    return NextResponse.json({ error: 'section is required' }, { status: 400 });
  }

  const sectionDef = getSectionDef(params.page, section);
  if (!sectionDef) {
    return NextResponse.json({ error: 'Unknown section' }, { status: 404 });
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return NextResponse.json({ error: 'data must be an object' }, { status: 400 });
  }

  // Persist only keys the schema declares, so a stale client can't write
  // arbitrary JSON into the row.
  const clean: Record<string, unknown> = {};
  for (const field of sectionDef.fields) {
    if (Object.prototype.hasOwnProperty.call(data, field.key)) {
      clean[field.key] = (data as Record<string, unknown>)[field.key];
    }
  }

  const updated = await prisma.pageContent.upsert({
    where: { page_section: { page: params.page, section } },
    update: { data: JSON.stringify(clean) },
    create: { page: params.page, section, data: JSON.stringify(clean) },
  });

  revalidateFor(pageDef.path);

  return NextResponse.json({
    section: updated.section,
    data: mergeSection(sectionDef, clean),
    updatedAt: updated.updatedAt.toISOString(),
  });
}

/** Drop a section's saved row so it falls back to the schema defaults. */
export async function DELETE(req: NextRequest, { params }: { params: { page: string } }) {
  const pageDef = getPageDef(params.page);
  if (!pageDef) {
    return NextResponse.json({ error: 'Unknown page' }, { status: 404 });
  }

  const section = req.nextUrl.searchParams.get('section');
  const sectionDef = section ? getSectionDef(params.page, section) : undefined;
  if (!section || !sectionDef) {
    return NextResponse.json({ error: 'Unknown section' }, { status: 404 });
  }

  await prisma.pageContent
    .delete({ where: { page_section: { page: params.page, section } } })
    .catch(() => null); // already at defaults

  revalidateFor(pageDef.path);

  return NextResponse.json({ section, data: mergeSection(sectionDef, null) });
}

/**
 * Content is read on the server, so a save has to invalidate the rendered
 * page. Global chrome (navbar, footer) appears everywhere, so those saves
 * revalidate the whole tree.
 */
function revalidateFor(path: string | null) {
  revalidatePath('/', 'layout');
  if (path && path !== '/') {
    revalidatePath(path);
  }
}
