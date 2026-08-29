'use client';

// The section editor: a rail of the page's sections on the left, the selected
// section's form on the right. Edits stay in memory until saved, so switching
// sections never loses work; the rail marks what is unsaved.

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { PageDef } from '@/lib/cms/schema';
import { sectionDefaults } from '@/lib/cms/schema';
import type { MediaItem } from '../../components/MediaPicker';
import { FieldGrid } from '../Fields';
import * as ui from '../ui';

type SectionData = Record<string, any>;

export default function PageEditor({ def }: { def: PageDef }) {
  const [content, setContent] = useState<Record<string, SectionData> | null>(null);
  const [saved, setSaved] = useState<Record<string, SectionData>>({});
  const [customised, setCustomised] = useState<string[]>([]);
  const [active, setActive] = useState(def.sections[0]?.key ?? '');
  const [mediaMap, setMediaMap] = useState<Record<string, MediaItem>>({});
  const [busy, setBusy] = useState<'saving' | 'resetting' | null>(null);
  const [flash, setFlash] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch(`/api/admin/cms/${def.key}`);
      if (!res.ok) throw new Error('Could not load this page.');
      const data = await res.json();
      setContent(data.content);
      setSaved(structuredClone(data.content));
      setCustomised(data.customised ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load this page.');
      // Fall back to the schema defaults so the editor is still usable.
      const fallback: Record<string, SectionData> = {};
      for (const section of def.sections) fallback[section.key] = sectionDefaults(section);
      setContent(fallback);
      setSaved(structuredClone(fallback));
    }
  }, [def]);

  useEffect(() => {
    load();
  }, [load]);

  // The media library is fetched once so every `media:<id>` in this page can
  // show a thumbnail without a request per field.
  useEffect(() => {
    fetch('/api/admin/media')
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, MediaItem> = {};
        for (const item of data.media ?? []) map[item.id] = item;
        setMediaMap(map);
      })
      .catch(() => undefined);
  }, []);

  const dirty = useMemo(() => {
    if (!content) return new Set<string>();
    const out = new Set<string>();
    for (const section of def.sections) {
      if (JSON.stringify(content[section.key]) !== JSON.stringify(saved[section.key])) {
        out.add(section.key);
      }
    }
    return out;
  }, [content, saved, def]);

  useEffect(() => {
    if (dirty.size === 0) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const section = def.sections.find((s) => s.key === active);

  function updateField(key: string, value: unknown) {
    setContent((prev) =>
      prev ? { ...prev, [active]: { ...prev[active], [key]: value } } : prev
    );
  }

  async function save() {
    if (!content || !section) return;
    setBusy('saving');
    setError('');
    try {
      const res = await fetch(`/api/admin/cms/${def.key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: active, data: content[active] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      setContent((prev) => (prev ? { ...prev, [active]: data.data } : prev));
      setSaved((prev) => ({ ...prev, [active]: structuredClone(data.data) }));
      setCustomised((prev) => (prev.includes(active) ? prev : [...prev, active]));
      show('Saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    if (!section) return;
    if (!confirm(`Reset “${section.label}” to the original site copy? Saved changes to this section are removed.`)) {
      return;
    }
    setBusy('resetting');
    setError('');
    try {
      const res = await fetch(`/api/admin/cms/${def.key}?section=${encodeURIComponent(active)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed.');
      setContent((prev) => (prev ? { ...prev, [active]: data.data } : prev));
      setSaved((prev) => ({ ...prev, [active]: structuredClone(data.data) }));
      setCustomised((prev) => prev.filter((key) => key !== active));
      show('Reset to defaults');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed.');
    } finally {
      setBusy(null);
    }
  }

  function show(message: string) {
    setFlash(message);
    setTimeout(() => setFlash(''), 2200);
  }

  function discard() {
    setContent((prev) => (prev ? { ...prev, [active]: structuredClone(saved[active]) } : prev));
  }

  if (!content || !section) {
    return <p style={{ color: ui.COLORS.faint }}>Loading…</p>;
  }

  return (
    <div>
      <Header def={def} dirtyCount={dirty.size} />

      {error && (
        <div style={{ background: '#FBEDEE', border: `1px solid ${ui.COLORS.danger}`, color: ui.COLORS.danger, padding: '10px 14px', borderRadius: 3, fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(190px, 220px) 1fr', gap: 24, alignItems: 'start' }}>
        <nav style={{ ...ui.card, padding: 6, position: 'sticky', top: 24 }}>
          {def.sections.map((item) => {
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActive(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 10px',
                  border: 'none',
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  background: isActive ? ui.COLORS.ink : 'transparent',
                  color: isActive ? ui.COLORS.paper : ui.COLORS.ink,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
                {dirty.has(item.key) && (
                  <span
                    title="Unsaved changes"
                    style={{ width: 6, height: 6, borderRadius: '50%', background: ui.COLORS.accent, flexShrink: 0 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <section style={{ ...ui.card, padding: 24, maxWidth: 760 }}>
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${ui.COLORS.line}` }}>
            <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>{section.label}</h2>
            {section.description && (
              <p style={{ margin: '6px 0 0', fontSize: 13.5, color: ui.COLORS.muted, lineHeight: 1.6 }}>
                {section.description}
              </p>
            )}
            {!customised.includes(section.key) && (
              <p style={{ margin: '8px 0 0', fontSize: 12, color: ui.COLORS.faint }}>
                Showing the original site copy — nothing has been edited here yet.
              </p>
            )}
          </div>

          <FieldGrid
            fields={section.fields}
            values={content[active]}
            onChange={updateField}
            mediaMap={mediaMap}
            onMediaLoaded={(item) => setMediaMap((prev) => ({ ...prev, [item.id]: item }))}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 8,
              paddingTop: 18,
              borderTop: `1px solid ${ui.COLORS.line}`,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={save}
              disabled={busy !== null || !dirty.has(active)}
              style={{
                ...ui.primaryButton,
                opacity: busy !== null || !dirty.has(active) ? 0.45 : 1,
                cursor: busy !== null || !dirty.has(active) ? 'default' : 'pointer',
              }}
            >
              {busy === 'saving' ? 'SAVING…' : 'SAVE SECTION'}
            </button>

            {dirty.has(active) && (
              <button type="button" onClick={discard} style={ui.buttonBase} disabled={busy !== null}>
                DISCARD
              </button>
            )}

            {customised.includes(active) && (
              <button
                type="button"
                onClick={reset}
                disabled={busy !== null}
                style={{ ...ui.buttonBase, color: ui.COLORS.danger, borderColor: ui.COLORS.line }}
              >
                {busy === 'resetting' ? 'RESETTING…' : 'RESET TO DEFAULT'}
              </button>
            )}

            {flash && (
              <span style={{ fontSize: 12, color: ui.COLORS.accent, letterSpacing: '0.08em', fontWeight: 600 }}>
                {flash} ✓
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Header({ def, dirtyCount }: { def: PageDef; dirtyCount: number }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <Link
        href="/admin/cms"
        style={{ fontSize: 11, letterSpacing: '0.12em', color: ui.COLORS.muted, textDecoration: 'none', fontWeight: 600 }}
      >
        ← ALL PAGES
      </Link>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 26, margin: 0 }}>{def.label}</h1>
        {def.path && (
          <a
            href={def.path}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11.5, letterSpacing: '0.1em', color: ui.COLORS.accent, textDecoration: 'none', fontWeight: 600 }}
          >
            VIEW LIVE ↗
          </a>
        )}
        {dirtyCount > 0 && (
          <span style={{ fontSize: 11.5, color: ui.COLORS.accent, letterSpacing: '0.06em' }}>
            {dirtyCount} unsaved {dirtyCount === 1 ? 'section' : 'sections'}
          </span>
        )}
      </div>
      {def.description && (
        <p style={{ color: ui.COLORS.muted, fontSize: 14, marginTop: 8, maxWidth: 620, lineHeight: 1.65 }}>
          {def.description}
        </p>
      )}
    </div>
  );
}
