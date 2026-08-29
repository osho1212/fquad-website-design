// lib/cms/types.ts
// Type vocabulary for the schema-driven CMS.
//
// Every editable thing on the public site is declared once, here-shaped, in
// lib/cms/pages/*. That single declaration drives three things at once:
//
//   1. the admin form UI               (app/admin/(dashboard)/cms/*)
//   2. the stored JSON shape           (PageContent.data)
//   3. the values the site renders     (lib/cms/content.ts merges DB over defaults)
//
// Nothing is hardcoded in two places: a section's `defaults` ARE the copy that
// currently ships, so an untouched database renders the site exactly as before.

/** Simple scalar/among-scalars field kinds. */
export type FieldType =
  /** One-line string. */
  | 'text'
  /** Multi-line string. */
  | 'textarea'
  /** string[] — one entry per line. */
  | 'lines'
  /** string[] — one entry per blank-line-separated block. Renders as <p>s. */
  | 'paragraphs'
  /** Numeric value. */
  | 'number'
  /** Absolute or relative URL. */
  | 'url'
  /** Media reference — a path like `/assets/x.jpg` or `media:<id>`. */
  | 'image'
  /** Media reference restricted to video. */
  | 'video'
  /** string[] of media references — an ordered gallery. */
  | 'images'
  /** Boolean switch. */
  | 'toggle'
  /** Hex colour. */
  | 'color'
  /** { label, href }[] — a repeater of links. */
  | 'links'
  /** Repeater of objects; requires `fields`. */
  | 'list';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  /** Shown under the input — say where this appears on the page. */
  help?: string;
  placeholder?: string;
  /** `list` only: the sub-fields of each row. */
  fields?: FieldDef[];
  /** `list` only: singular noun for the add button, e.g. "Stat". */
  itemLabel?: string;
  /** `list` only: which sub-field to show as the collapsed row title. */
  itemTitleKey?: string;
  /** `list` only: hard caps so layout-critical lists can't be over-filled. */
  min?: number;
  max?: number;
  /** Render at half width so short fields pair up on one row. */
  half?: boolean;
}

export interface SectionDef {
  /** Stored as PageContent.section. Never rename without a migration. */
  key: string;
  label: string;
  /** One line telling the editor exactly where on the page this shows. */
  description?: string;
  fields: FieldDef[];
  /** The copy currently shipping. Merged under any DB overrides. */
  defaults: Record<string, unknown>;
}

export interface PageDef {
  /** Stored as PageContent.page. */
  key: string;
  label: string;
  /** Sidebar / index grouping, e.g. "Homepage", "Pages", "Global". */
  group: string;
  /** Live URL, so the editor can open what they're editing. Null = not a page. */
  path: string | null;
  description?: string;
  /** Emoji-free short glyph used on the index cards. */
  icon?: string;
  sections: SectionDef[];
}

/** A media reference is a plain path, or `media:<id>` pointing at the library. */
export const MEDIA_PREFIX = 'media:';

export function isMediaRef(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(MEDIA_PREFIX);
}

export function mediaIdFromRef(value: string): string {
  return value.slice(MEDIA_PREFIX.length);
}

export function toMediaRef(id: string): string {
  return `${MEDIA_PREFIX}${id}`;
}

/** Field types holding a single media reference. */
export const MEDIA_FIELD_TYPES: FieldType[] = ['image', 'video'];

/** Field types holding an array of media references. */
export const MEDIA_LIST_FIELD_TYPES: FieldType[] = ['images'];

/** The empty value a field should fall back to when nothing is set. */
export function emptyValueFor(field: FieldDef): unknown {
  switch (field.type) {
    case 'lines':
    case 'paragraphs':
    case 'links':
    case 'list':
    case 'images':
      return [];
    case 'number':
      return 0;
    case 'toggle':
      return false;
    default:
      return '';
  }
}
