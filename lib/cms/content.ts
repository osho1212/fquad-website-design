// lib/cms/content.ts
// Server-side reader for CMS content. Everything the public site renders goes
// through here so that a single code path handles: merging saved values over
// schema defaults, and turning `media:<id>` references into real URLs.
//
// Server components only — it touches Prisma.

import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { getPageDef, mergeSection } from './schema';
import {
  MEDIA_FIELD_TYPES,
  MEDIA_LIST_FIELD_TYPES,
  isMediaRef,
  mediaIdFromRef,
  type FieldDef,
} from './types';

export type SectionContent = Record<string, any>;
export type PageContentMap = Record<string, SectionContent>;

/** Best available URL for a media record, preferring the given variant. */
function variantUrl(
  media: { path: string; variants: { label: string; path: string }[] } | undefined,
  preferred: string[]
): string {
  if (!media) return '';
  for (const label of preferred) {
    const hit = media.variants.find((v) => v.label === label);
    if (hit) return hit.path;
  }
  return media.path;
}

/**
 * Visit every media reference a section holds, handing the visitor the
 * container and key so it can both read and rewrite in place. Recurses
 * through `list` rows, so a media field nested any number of levels deep is
 * reached without the caller knowing the shape.
 */
function walkMedia(
  fields: FieldDef[],
  data: Record<string, any> | undefined,
  visit: (container: any, key: string | number) => void
): void {
  if (!data || typeof data !== 'object') return;

  for (const field of fields) {
    const value = data[field.key];

    if (MEDIA_FIELD_TYPES.includes(field.type)) {
      visit(data, field.key);
    } else if (MEDIA_LIST_FIELD_TYPES.includes(field.type) && Array.isArray(value)) {
      value.forEach((_, index) => visit(value, index));
    } else if (field.type === 'list' && Array.isArray(value)) {
      for (const row of value) {
        walkMedia(field.fields ?? [], row, visit);
      }
    }
  }
}

/** Every media id referenced anywhere in a page's content. */
function collectMediaRefs(page: string, content: PageContentMap): Set<string> {
  const ids = new Set<string>();
  const def = getPageDef(page);
  if (!def) return ids;

  for (const section of def.sections) {
    walkMedia(section.fields, content[section.key], (container, key) => {
      const value = container[key];
      if (isMediaRef(value)) ids.add(mediaIdFromRef(value));
    });
  }

  return ids;
}

/** Rewrite every media reference in place, from `media:<id>` to a servable URL. */
function resolveMedia(page: string, content: PageContentMap, urls: Map<string, string>): void {
  const def = getPageDef(page);
  if (!def) return;

  for (const section of def.sections) {
    walkMedia(section.fields, content[section.key], (container, key) => {
      const value = container[key];
      if (!isMediaRef(value)) return;
      // A reference whose media row was deleted resolves to '' rather than
      // leaking `media:abc123` into a src attribute.
      container[key] = urls.get(mediaIdFromRef(value)) ?? '';
    });
  }
}

/**
 * All sections of a page, defaults merged with saved values and media
 * resolved. Cached per request, so several sections of one page cost one query.
 */
export const getPage = cache(async (page: string): Promise<PageContentMap> => {
  const def = getPageDef(page);
  if (!def) return {};

  let rows: { section: string; data: string }[] = [];
  try {
    rows = await prisma.pageContent.findMany({
      where: { page },
      select: { section: true, data: true },
    });
  } catch {
    // A missing or unreachable database must not take the site down — the
    // schema defaults are a complete, valid copy of the site as shipped.
    rows = [];
  }

  const saved = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    try {
      saved.set(row.section, JSON.parse(row.data));
    } catch {
      // Ignore a corrupt row; that section falls back to its defaults.
    }
  }

  const content: PageContentMap = {};
  for (const section of def.sections) {
    content[section.key] = mergeSection(section, saved.get(section.key));
  }

  const ids = collectMediaRefs(page, content);
  if (ids.size > 0) {
    try {
      const media = await prisma.media.findMany({
        where: { id: { in: Array.from(ids) } },
        include: { variants: true },
      });
      const urls = new Map<string, string>();
      for (const item of media) {
        urls.set(
          item.id,
          variantUrl(item, item.type === 'VIDEO' ? ['compressed'] : ['full', 'medium'])
        );
      }
      resolveMedia(page, content, urls);
    } catch {
      resolveMedia(page, content, new Map());
    }
  }

  return content;
});

export { defaultsFor, fill, toLines } from './schema';
