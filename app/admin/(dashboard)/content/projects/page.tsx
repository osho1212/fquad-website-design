'use client';

import { useEffect, useState } from 'react';
import MediaPicker, { thumbFor, type MediaItem } from '../../components/MediaPicker';

interface BannerData {
  eyebrow: string;
  title: string;
  subtitle: string;
  mediaId: string | null;
  mediaType: 'image' | 'video';
}

interface CtaData {
  heading: string;
  text: string;
}

interface ProjectsContent {
  banner: BannerData;
  cta: CtaData;
}

export default function ProjectsContentPage() {
  const [content, setContent] = useState<ProjectsContent | null>(null);
  const [mediaMap, setMediaMap] = useState<Record<string, MediaItem>>({});
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/content/projects');
    const data = await res.json();
    setContent(data.content);

    const mediaId = data.content?.banner?.mediaId;
    if (mediaId) {
      const mediaRes = await fetch('/api/admin/media');
      const mediaData = await mediaRes.json();
      const found = (mediaData.media || []).find((m: MediaItem) => m.id === mediaId);
      if (found) setMediaMap({ [mediaId]: found });
    }
    setLoading(false);
  }

  async function saveSection(section: keyof ProjectsContent, data: any) {
    setSavingSection(section);
    setSavedSection(null);
    try {
      await fetch('/api/admin/content/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data }),
      });
      setSavedSection(section);
      setTimeout(() => setSavedSection(null), 2000);
    } finally {
      setSavingSection(null);
    }
  }

  function update<K extends keyof ProjectsContent>(section: K, value: ProjectsContent[K]) {
    setContent((prev) => (prev ? { ...prev, [section]: value } : prev));
  }

  function handleMediaSelected(item: MediaItem) {
    setMediaMap((prev) => ({ ...prev, [item.id]: item }));
    if (content) {
      update('banner', { ...content.banner, mediaId: item.id, mediaType: item.type === 'VIDEO' ? 'video' : 'image' });
    }
    setPickerOpen(false);
  }

  if (loading || !content) {
    return <p style={{ color: '#9C9890' }}>Loading…</p>;
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Projects Page Content</h1>
      <p style={{ color: '#7A7870', fontSize: 15, marginBottom: 32, lineHeight: 1.7 }}>
        Banner and CTA strip for the Projects page. Project entries themselves are
        managed under Projects in the sidebar.
      </p>

      <Section title="Banner" saving={savingSection === 'banner'} saved={savedSection === 'banner'} onSave={() => saveSection('banner', content.banner)}>
        <Field label="EYEBROW">
          <input style={inputStyle} value={content.banner.eyebrow} onChange={(e) => update('banner', { ...content.banner, eyebrow: e.target.value })} />
        </Field>
        <Field label="TITLE">
          <input style={inputStyle} value={content.banner.title} onChange={(e) => update('banner', { ...content.banner, title: e.target.value })} />
        </Field>
        <Field label="SUBTITLE">
          <input style={inputStyle} value={content.banner.subtitle} onChange={(e) => update('banner', { ...content.banner, subtitle: e.target.value })} />
        </Field>
        <Field label="BACKGROUND MEDIA">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {content.banner.mediaId && mediaMap[content.banner.mediaId] && (
              <div style={{ width: 100, height: 75, borderRadius: 2, overflow: 'hidden', background: '#0D0D0D' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbFor(mediaMap[content.banner.mediaId])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <button onClick={() => setPickerOpen(true)} style={smallButtonStyle}>
              {content.banner.mediaId ? 'CHANGE' : 'CHOOSE MEDIA'}
            </button>
          </div>
        </Field>
      </Section>

      <Section title="Call to Action" saving={savingSection === 'cta'} saved={savedSection === 'cta'} onSave={() => saveSection('cta', content.cta)}>
        <Field label="HEADING">
          <input style={inputStyle} value={content.cta.heading} onChange={(e) => update('cta', { ...content.cta, heading: e.target.value })} />
        </Field>
        <Field label="TEXT">
          <input style={inputStyle} value={content.cta.text} onChange={(e) => update('cta', { ...content.cta, text: e.target.value })} />
        </Field>
      </Section>

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleMediaSelected} accept="all" />
    </div>
  );
}

function Section({
  title,
  children,
  saving,
  saved,
  onSave,
}: {
  title: string;
  children: React.ReactNode;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #DEDBD4', borderRadius: 4, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h2>
        <button onClick={onSave} disabled={saving} style={saveButtonStyle}>
          {saving ? 'SAVING…' : saved ? 'SAVED ✓' : 'SAVE'}
        </button>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', color: '#7A7870', fontWeight: 600, marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #DEDBD4',
  borderRadius: 2,
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#0D0D0D',
  outline: 'none',
};

const smallButtonStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.1em',
  color: '#0D0D0D',
  background: 'none',
  border: '1px solid #DEDBD4',
  borderRadius: 2,
  padding: '9px 16px',
  cursor: 'pointer',
  fontWeight: 600,
  fontFamily: 'inherit',
};

const saveButtonStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.1em',
  color: '#F8F8F6',
  background: '#0D0D0D',
  border: 'none',
  borderRadius: 2,
  padding: '8px 16px',
  cursor: 'pointer',
  fontWeight: 600,
  fontFamily: 'inherit',
};