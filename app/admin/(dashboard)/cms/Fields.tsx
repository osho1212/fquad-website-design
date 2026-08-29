'use client';

// Renders one schema field. Every input type the CMS supports lives here, so
// adding a field kind means touching this file and lib/cms/types.ts only.

import { useEffect, useState } from 'react';
import type { FieldDef } from '@/lib/cms/schema';
import { emptyValueFor, isMediaRef, mediaIdFromRef, toMediaRef } from '@/lib/cms/schema';
import MediaPicker, { thumbFor, type MediaItem } from '../components/MediaPicker';
import * as ui from './ui';

interface FieldProps {
  field: FieldDef;
  value: any;
  onChange: (value: any) => void;
  /** id -> media record, for previewing `media:<id>` values. */
  mediaMap: Record<string, MediaItem>;
  onMediaLoaded: (item: MediaItem) => void;
}

export function Field({ field, value, onChange, mediaMap, onMediaLoaded }: FieldProps) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={ui.label}>{field.label}</label>
      <FieldInput
        field={field}
        value={value}
        onChange={onChange}
        mediaMap={mediaMap}
        onMediaLoaded={onMediaLoaded}
      />
      {field.help && <div style={ui.help}>{field.help}</div>}
    </div>
  );
}

function FieldInput({ field, value, onChange, mediaMap, onMediaLoaded }: FieldProps) {
  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          style={ui.textarea}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'lines':
      return (
        <TextListInput
          items={toArray(value)}
          separator="\n"
          minHeight={110}
          placeholder={field.placeholder}
          onChange={onChange}
          parse={splitLines}
        />
      );

    case 'paragraphs':
      return (
        <TextListInput
          items={toArray(value)}
          separator={'\n\n'}
          minHeight={150}
          placeholder={field.placeholder}
          onChange={onChange}
          parse={splitParagraphs}
        />
      );

    case 'number':
      return (
        <input
          style={ui.input}
          type="number"
          value={value === '' || value === null || value === undefined ? '' : Number(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      );

    case 'toggle':
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span style={{ color: ui.COLORS.muted }}>{value ? 'On' : 'Off'}</span>
        </label>
      );

    case 'color':
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(String(value)) ? String(value) : '#cccccc'}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: 40, height: 36, padding: 2, border: `1px solid ${ui.COLORS.line}`, borderRadius: 2, background: '#fff', cursor: 'pointer' }}
          />
          <input style={ui.input} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} placeholder="#B5B5B5" />
        </div>
      );

    case 'image':
    case 'video':
      return (
        <MediaField
          value={String(value ?? '')}
          accept={field.type === 'video' ? 'all' : 'image'}
          mediaMap={mediaMap}
          onMediaLoaded={onMediaLoaded}
          onChange={onChange}
        />
      );

    case 'images':
      return (
        <ImagesField
          value={toArray(value)}
          mediaMap={mediaMap}
          onMediaLoaded={onMediaLoaded}
          onChange={onChange}
        />
      );

    case 'links':
      return <LinksField value={toArray(value)} onChange={onChange} />;

    case 'list':
      return (
        <ListField
          field={field}
          value={toArray(value)}
          onChange={onChange}
          mediaMap={mediaMap}
          onMediaLoaded={onMediaLoaded}
        />
      );

    default:
      return (
        <input
          style={ui.input}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

/* ── Text-backed lists ──────────────────────────────────────────────── */

/**
 * `lines` and `paragraphs` are stored as string[] but edited as free text.
 * Parsing on every keystroke would delete the blank line the editor just
 * typed, so the textarea keeps its own draft and only re-seeds from props
 * when the parsed value actually differs from what the draft produces.
 */
function TextListInput({
  items,
  separator,
  minHeight,
  placeholder,
  onChange,
  parse,
}: {
  items: string[];
  separator: string;
  minHeight: number;
  placeholder?: string;
  onChange: (value: string[]) => void;
  parse: (text: string) => string[];
}) {
  const joined = items.join(separator);
  const [draft, setDraft] = useState(joined);

  // Re-seed only when the value changed from outside this textarea — a reset,
  // or a switch to another section — never from the editor's own typing.
  useEffect(() => {
    if (parse(draft).join(separator) !== joined) {
      setDraft(joined);
    }
    // Only react to the incoming value; `draft` is intentionally omitted so
    // typing never fights the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);

  return (
    <textarea
      style={{ ...ui.textarea, minHeight }}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => {
        setDraft(e.target.value);
        onChange(parse(e.target.value));
      }}
    />
  );
}

/* ── Media ──────────────────────────────────────────────────────────── */

function MediaField({
  value,
  accept,
  mediaMap,
  onMediaLoaded,
  onChange,
}: {
  value: string;
  accept: 'image' | 'all';
  mediaMap: Record<string, MediaItem>;
  onMediaLoaded: (item: MediaItem) => void;
  onChange: (value: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const preview = previewUrl(value, mediaMap);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 120,
            height: 80,
            flexShrink: 0,
            borderRadius: 2,
            overflow: 'hidden',
            background: '#0D0D0D',
            border: `1px solid ${ui.COLORS.line}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 9, letterSpacing: '0.12em', color: '#6b6b6b' }}>NONE</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setPickerOpen(true)} style={ui.buttonBase}>
              {value ? 'REPLACE' : 'CHOOSE MEDIA'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                style={{ ...ui.buttonBase, color: ui.COLORS.danger }}
              >
                CLEAR
              </button>
            )}
          </div>
          <input
            style={{ ...ui.input, fontSize: 12.5 }}
            value={value}
            placeholder="/assets/images/example.jpg"
            onChange={(e) => onChange(e.target.value)}
          />
          <div style={ui.help}>
            Pick from the media library, or type a path to a file already in
            /public.
          </div>
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        accept={accept}
        onSelect={(item) => {
          onMediaLoaded(item);
          onChange(toMediaRef(item.id));
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

function previewUrl(value: string, mediaMap: Record<string, MediaItem>): string {
  if (!value) return '';
  if (!isMediaRef(value)) return value;
  const item = mediaMap[mediaIdFromRef(value)];
  return item ? thumbFor(item) : '';
}

/* ── Image gallery ──────────────────────────────────────────────────── */

/** An ordered set of media references — a project gallery, a slideshow. */
function ImagesField({
  value,
  mediaMap,
  onMediaLoaded,
  onChange,
}: {
  value: string[];
  mediaMap: Record<string, MediaItem>;
  onMediaLoaded: (item: MediaItem) => void;
  onChange: (value: string[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
          gap: 8,
          marginBottom: 10,
        }}
      >
        {value.map((ref, i) => {
          const preview = previewUrl(ref, mediaMap);
          return (
            <div
              key={`${ref}-${i}`}
              style={{
                border: `1px solid ${ui.COLORS.line}`,
                borderRadius: 3,
                overflow: 'hidden',
                background: '#0D0D0D',
              }}
            >
              <div style={{ aspectRatio: '4 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 9, color: '#6b6b6b', letterSpacing: '0.1em' }}>MISSING</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 2, background: '#fff', padding: 3 }}>
                <RowControls
                  index={i}
                  count={value.length}
                  onMove={(from, to) => onChange(move(value, from, to))}
                  onRemove={() => onChange(value.filter((_, j) => j !== i))}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" onClick={() => setPickerOpen(true)} style={ui.buttonBase}>
        + ADD IMAGE(S)
      </button>
      <div style={ui.help}>The first image is used as the cover wherever one is needed.</div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        accept="image"
        multiple={true}
        onSelectMultiple={(items) => {
          items.forEach(onMediaLoaded);
          onChange([...value, ...items.map((it) => toMediaRef(it.id))]);
          setPickerOpen(false);
        }}
        onSelect={(item) => {
          onMediaLoaded(item);
          onChange([...value, toMediaRef(item.id)]);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

/* ── Links repeater ─────────────────────────────────────────────────── */

function LinksField({
  value,
  onChange,
}: {
  value: { label?: string; href?: string }[];
  onChange: (value: unknown) => void;
}) {
  function set(index: number, patch: Record<string, string>) {
    const next = value.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  }

  return (
    <div>
      {value.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input
            style={{ ...ui.input, flex: '1 1 40%' }}
            value={row.label ?? ''}
            placeholder="Label"
            onChange={(e) => set(i, { label: e.target.value })}
          />
          <input
            style={{ ...ui.input, flex: '1 1 60%', fontSize: 13 }}
            value={row.href ?? ''}
            placeholder="/path or https://…"
            onChange={(e) => set(i, { href: e.target.value })}
          />
          <RowControls
            index={i}
            count={value.length}
            onMove={(from, to) => onChange(move(value, from, to))}
            onRemove={() => onChange(value.filter((_, j) => j !== i))}
          />
        </div>
      ))}
      <button
        type="button"
        style={{ ...ui.buttonBase, marginTop: 4 }}
        onClick={() => onChange([...value, { label: '', href: '' }])}
      >
        + ADD LINK
      </button>
    </div>
  );
}

/* ── Object list repeater ───────────────────────────────────────────── */

function ListField({
  field,
  value,
  onChange,
  mediaMap,
  onMediaLoaded,
}: {
  field: FieldDef;
  value: Record<string, any>[];
  onChange: (value: unknown) => void;
  mediaMap: Record<string, MediaItem>;
  onMediaLoaded: (item: MediaItem) => void;
}) {
  const [open, setOpen] = useState<number | null>(0);
  const subFields = field.fields ?? [];
  const atMax = field.max !== undefined && value.length >= field.max;
  const atMin = field.min !== undefined && value.length <= field.min;

  function setRow(index: number, key: string, next: unknown) {
    onChange(value.map((row, i) => (i === index ? { ...row, [key]: next } : row)));
  }

  function blankRow(): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    for (const sub of subFields) {
      row[sub.key] = emptyValueFor(sub);
    }
    return row;
  }

  return (
    <div>
      {value.map((row, i) => {
        const isOpen = open === i;
        const title =
          (field.itemTitleKey && row[field.itemTitleKey]) ||
          row[subFields[0]?.key] ||
          `${field.itemLabel ?? 'Item'} ${i + 1}`;

        return (
          <div
            key={i}
            style={{
              border: `1px solid ${ui.COLORS.line}`,
              borderRadius: 3,
              marginBottom: 8,
              background: isOpen ? '#FCFCFA' : '#fff',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderBottom: isOpen ? `1px solid ${ui.COLORS.line}` : 'none',
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  flex: 1,
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: ui.COLORS.ink,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <span style={{ color: ui.COLORS.faint, fontSize: 11 }}>{isOpen ? '▾' : '▸'}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {String(title)}
                </span>
              </button>
              <RowControls
                index={i}
                count={value.length}
                disableRemove={atMin}
                onMove={(from, to) => {
                  onChange(move(value, from, to));
                  setOpen(to);
                }}
                onRemove={() => {
                  onChange(value.filter((_, j) => j !== i));
                  setOpen(null);
                }}
              />
            </div>

            {isOpen && (
              <div style={{ padding: '14px 12px 2px' }}>
                <FieldGrid
                  fields={subFields}
                  values={row}
                  onChange={(key, next) => setRow(i, key, next)}
                  mediaMap={mediaMap}
                  onMediaLoaded={onMediaLoaded}
                />
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        disabled={atMax}
        style={{ ...ui.buttonBase, marginTop: 4, opacity: atMax ? 0.4 : 1, cursor: atMax ? 'default' : 'pointer' }}
        onClick={() => {
          onChange([...value, blankRow()]);
          setOpen(value.length);
        }}
      >
        + ADD {(field.itemLabel ?? 'ITEM').toUpperCase()}
      </button>
      {atMax && <div style={ui.help}>The layout fits at most {field.max}.</div>}
    </div>
  );
}

function RowControls({
  index,
  count,
  onMove,
  onRemove,
  disableRemove,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
  disableRemove?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
      <button
        type="button"
        aria-label="Move up"
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
        style={{ ...ui.ghostButton, opacity: index === 0 ? 0.3 : 1 }}
      >
        ↑
      </button>
      <button
        type="button"
        aria-label="Move down"
        disabled={index === count - 1}
        onClick={() => onMove(index, index + 1)}
        style={{ ...ui.ghostButton, opacity: index === count - 1 ? 0.3 : 1 }}
      >
        ↓
      </button>
      <button
        type="button"
        aria-label="Remove"
        disabled={disableRemove}
        onClick={onRemove}
        style={{ ...ui.ghostButton, color: ui.COLORS.danger, opacity: disableRemove ? 0.3 : 1 }}
      >
        ✕
      </button>
    </div>
  );
}

/* ── Layout ─────────────────────────────────────────────────────────── */

/**
 * Lays fields out, pairing consecutive `half` fields onto one row. A `half`
 * field with no `half` neighbour simply takes the full width.
 */
export function FieldGrid({
  fields,
  values,
  onChange,
  mediaMap,
  onMediaLoaded,
}: {
  fields: FieldDef[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  mediaMap: Record<string, MediaItem>;
  onMediaLoaded: (item: MediaItem) => void;
}) {
  const rows: FieldDef[][] = [];
  for (const field of fields) {
    const last = rows[rows.length - 1];
    if (field.half && last && last.length === 1 && last[0].half) {
      last.push(field);
    } else {
      rows.push([field]);
    }
  }

  return (
    <>
      {rows.map((row, i) => (
        <div
          key={i}
          style={
            row.length === 2
              ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }
              : undefined
          }
        >
          {row.map((field) => (
            <Field
              key={field.key}
              field={field}
              value={values?.[field.key]}
              onChange={(next) => onChange(field.key, next)}
              mediaMap={mediaMap}
              onMediaLoaded={onMediaLoaded}
            />
          ))}
        </div>
      ))}
    </>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function toArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function splitLines(text: string): string[] {
  return text.split('\n').map((line) => line.trim()).filter(Boolean);
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((para) => para.trim()).filter(Boolean);
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
