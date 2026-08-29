// lib/cms/schema.ts
// The registry every part of the CMS reads from. Adding an editable section
// anywhere on the site means adding it to one of lib/cms/pages/* — the admin
// UI, the API and the public site all pick it up with no further wiring.

import type { PageDef, SectionDef } from './types';
import { globalPage } from './pages/global';
import { homePage } from './pages/home';
import { studioPage } from './pages/studio';
import { servicesPage } from './pages/services';
import { aboutPage } from './pages/about';
import { contactPage } from './pages/contact';
import {
  pastProjectsPage,
  teamPage,
  awardsPage,
  testimonialsPage,
  blogPage,
} from './pages/listings';

export * from './types';

/** Order here is the order shown in the admin. */
export const CMS_PAGES: PageDef[] = [
  homePage,
  globalPage,
  studioPage,
  aboutPage,
  servicesPage,
  contactPage,
  pastProjectsPage,
  teamPage,
  awardsPage,
  testimonialsPage,
  blogPage,
];

/** Index grouping, in display order. */
const CMS_GROUPS = ['Homepage', 'Global', 'Pages'] as const;

export function getPageDef(page: string): PageDef | undefined {
  return CMS_PAGES.find((p) => p.key === page);
}

export function getSectionDef(page: string, section: string): SectionDef | undefined {
  return getPageDef(page)?.sections.find((s) => s.key === section);
}

export function pagesByGroup(): { group: string; pages: PageDef[] }[] {
  return CMS_GROUPS.map((group) => ({
    group,
    pages: CMS_PAGES.filter((p) => p.group === group),
  })).filter((g) => g.pages.length > 0);
}

/**
 * Defaults for one section, deep-cloned so callers can't mutate the registry.
 * structuredClone is available in every runtime this app targets (Node 18+
 * and all supported browsers).
 */
export function sectionDefaults(section: SectionDef): Record<string, unknown> {
  return structuredClone(section.defaults) as Record<string, unknown>;
}

/**
 * Merge saved values over a section's defaults, one key at a time.
 *
 * Only top-level keys the schema declares survive, so a field removed from the
 * schema stops rendering without needing the stored JSON cleaned up first. A
 * key the editor has never touched falls back to its default, which is why an
 * empty database renders the site exactly as it shipped.
 */
export function mergeSection(
  section: SectionDef,
  saved: Record<string, unknown> | undefined | null
): Record<string, unknown> {
  const merged = sectionDefaults(section);
  if (!saved || typeof saved !== 'object') return merged;
  for (const field of section.fields) {
    if (Object.prototype.hasOwnProperty.call(saved, field.key)) {
      merged[field.key] = saved[field.key];
    }
  }
  return merged;
}

/**
 * Defaults for one section, by key. Safe in client components — it never
 * touches the database. Sections use it as the fallback shape so they render
 * correctly even when no content prop is passed.
 */
export function defaultsFor(page: string, section: string): Record<string, any> {
  const def = getSectionDef(page, section);
  return def ? (sectionDefaults(def) as Record<string, any>) : {};
}

/** Replace {token} placeholders in a copy string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return String(template ?? '').replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match
  );
}

/** Split a stored multi-line heading into lines, for rendering with <br />. */
export function toLines(value: unknown): string[] {
  return String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Props helper for section components. The server already merges defaults in,
 * so this only matters when a section is rendered without a content prop —
 * it keeps every section renderable in isolation.
 */
export function withDefaults(
  page: string,
  section: string,
  content?: Record<string, any> | null
): Record<string, any> {
  return { ...defaultsFor(page, section), ...(content ?? {}) };
}
