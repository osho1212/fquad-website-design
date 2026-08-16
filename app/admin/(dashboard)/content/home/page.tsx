'use client';

import { useEffect, useState } from 'react';
import MediaPicker, { thumbFor, type MediaItem } from '../../components/MediaPicker';

interface HeroData {
  eyebrow: string;
  title: string;
  subtitle: string;
  mediaId: string | null;
  mediaType: 'image' | 'video';
}

interface StatsData {
  items: { number: string; label: string }[];
}

interface PortfolioIntroData {
  eyebrow: string;
  title: string;
  lead: string;
}

interface ServicesData {
  eyebrow: string;
  title: string;
  lead: string;
  items: { icon: string; name: string; description: string }[];
}

interface ProcessData {
  eyebrow: string;
  title: string;
  steps: { number: string; name: string; description: string }[];
}

interface TestimonialData {
  quote: string;
  attribution: string;
  mediaId: string | null;
}

interface CtaData {
  heading: string;
  text: string;
}

interface HomeContent {
  hero: HeroData;
  stats: StatsData;
  portfolio_intro: PortfolioIntroData;
  services: ServicesData;
  process: ProcessData;
  testimonial: TestimonialData;
  cta: CtaData;
}

// The API returns only whatever sections exist in the DB — on a fresh/empty
// database it returns {}. Merging over these defaults guarantees every
// section and field is always present, so the render code below never has
// to guard against a missing nested object.
const DEFAULT_CONTENT: HomeContent = {
  hero: { eyebrow: '', title: '', subtitle: '', mediaId: null, mediaType: 'image' },
  stats: { items: [] },
  portfolio_intro: { eyebrow: '', title: '', lead: '' },
  services: { eyebrow: '', title: '', lead: '', items: [] },
  process: { eyebrow: '', title: '', steps: [] },
  testimonial: { quote: '', attribution: '', mediaId: null },
  cta: { heading: '', text: '' },
};

export default function HomeContentPage() {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [mediaMap, setMediaMap] = useState<Record<string, MediaItem>>({});
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [pickerFor, setPickerFor] = useState<'hero' | 'testimonial' | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/content/home');
    const data = await res.json();
    const fetched = data?.content ?? {};
    setContent({
      hero: { ...DEFAULT_CONTENT.hero, ...fetched.hero },
      stats: { ...DEFAULT_CONTENT.stats, ...fetched.stats, items: fetched.stats?.items ?? [] },
      portfolio_intro: { ...DEFAULT_CONTENT.portfolio_intro, ...fetched.portfolio_intro },
      services: { ...DEFAULT_CONTENT.services, ...fetched.services, items: fetched.services?.items ?? [] },
      process: { ...DEFAULT_CONTENT.process, ...fetched.process, steps: fetched.process?.steps ?? [] },
      testimonial: { ...DEFAULT_CONTENT.testimonial, ...fetched.testimonial },
      cta: { ...DEFAULT_CONTENT.cta, ...fetched.cta },
    });

    const ids = [fetched?.hero?.mediaId, fetched?.testimonial?.mediaId].filter(Boolean);
    if (ids.length) {
      const mediaRes = await fetch('/api/admin/media');
      const mediaData = await mediaRes.json();
      const map: Record<string, MediaItem> = {};
      for (const m of mediaData.media || []) {
        if (ids.includes(m.id)) map[m.id] = m;
      }
      setMediaMap(map);
    }
    setLoading(false);
  }

  async function saveSection(section: keyof HomeContent, data: any) {
    setSavingSection(section);
    setSavedSection(null);
    try {
      await fetch('/api/admin/content/home', {
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

  function update<K extends keyof HomeContent>(section: K, value: HomeContent[K]) {
    setContent((prev) => (prev ? { ...prev, [section]: value } : prev));
  }

  function handleMediaSelected(item: MediaItem) {
    setMediaMap((prev) => ({ ...prev, [item.id]: item }));
    if (pickerFor === 'hero' && content) {
      update('hero', { ...content.hero, mediaId: item.id, mediaType: item.type === 'VIDEO' ? 'video' : 'image' });
    } else if (pickerFor === 'testimonial' && content) {
      update('testimonial', { ...content.testimonial, mediaId: item.id });
    }
    setPickerFor(null);
  }

  if (loading) {
    return <p style={{ color: '#9C9890' }}>Loading…</p>;
  }

  if (!content || Object.keys(content).length === 0) {
    return <p style={{ padding: 40, color: '#9C9890' }}>Loading content... If this persists, check database connection.</p>;
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Home Page Content</h1>
      <p style={{ color: '#7A7870', fontSize: 15, marginBottom: 32, lineHeight: 1.7 }}>
        Each section saves independently — edit a block and click its Save button.
      </p>

      {/* HERO */}
      <Section title="Hero" saving={savingSection === 'hero'} saved={savedSection === 'hero'} onSave={() => saveSection('hero', content.hero)}>
        <Field label="EYEBROW">
          <input style={inputStyle} value={content?.hero?.eyebrow ?? ''} onChange={(e) => update('hero', { ...content.hero, eyebrow: e.target.value })} />
        </Field>
        <Field label="TITLE">
          <input style={inputStyle} value={content?.hero?.title ?? ''} onChange={(e) => update('hero', { ...content.hero, title: e.target.value })} />
        </Field>
        <Field label="SUBTITLE">
          <input style={inputStyle} value={content?.hero?.subtitle ?? ''} onChange={(e) => update('hero', { ...content.hero, subtitle: e.target.value })} />
        </Field>
        <Field label="BACKGROUND MEDIA">
          <MediaSlot item={content?.hero?.mediaId ? mediaMap[content.hero.mediaId] : null} onChoose={() => setPickerFor('hero')} />
        </Field>
      </Section>

      {/* STATS */}
      <Section title="Stats" saving={savingSection === 'stats'} saved={savedSection === 'stats'} onSave={() => saveSection('stats', content.stats)}>
        {(content?.stats?.items ?? []).map((stat, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 10 }}>
            <input
              style={inputStyle}
              value={stat.number}
              placeholder="12+"
              onChange={(e) => {
                const items = [...(content?.stats?.items ?? [])];
                items[i] = { ...items[i], number: e.target.value };
                update('stats', { items });
              }}
            />
            <input
              style={inputStyle}
              value={stat.label}
              placeholder="YEARS"
              onChange={(e) => {
                const items = [...(content?.stats?.items ?? [])];
                items[i] = { ...items[i], label: e.target.value };
                update('stats', { items });
              }}
            />
          </div>
        ))}
      </Section>

      {/* PORTFOLIO INTRO */}
      <Section title="Portfolio Intro" saving={savingSection === 'portfolio_intro'} saved={savedSection === 'portfolio_intro'} onSave={() => saveSection('portfolio_intro', content.portfolio_intro)}>
        <Field label="EYEBROW">
          <input style={inputStyle} value={content?.portfolio_intro?.eyebrow ?? ''} onChange={(e) => update('portfolio_intro', { ...content.portfolio_intro, eyebrow: e.target.value })} />
        </Field>
        <Field label="TITLE">
          <input style={inputStyle} value={content?.portfolio_intro?.title ?? ''} onChange={(e) => update('portfolio_intro', { ...content.portfolio_intro, title: e.target.value })} />
        </Field>
        <Field label="LEAD TEXT">
          <textarea style={{ ...inputStyle, minHeight: 70 }} value={content?.portfolio_intro?.lead ?? ''} onChange={(e) => update('portfolio_intro', { ...content.portfolio_intro, lead: e.target.value })} />
        </Field>
      </Section>

      {/* SERVICES */}
      <Section title="Services" saving={savingSection === 'services'} saved={savedSection === 'services'} onSave={() => saveSection('services', content.services)}>
        <Field label="EYEBROW">
          <input style={inputStyle} value={content?.services?.eyebrow ?? ''} onChange={(e) => update('services', { ...content.services, eyebrow: e.target.value })} />
        </Field>
        <Field label="TITLE">
          <input style={inputStyle} value={content?.services?.title ?? ''} onChange={(e) => update('services', { ...content.services, title: e.target.value })} />
        </Field>
        <Field label="LEAD TEXT">
          <textarea style={{ ...inputStyle, minHeight: 60 }} value={content?.services?.lead ?? ''} onChange={(e) => update('services', { ...content.services, lead: e.target.value })} />
        </Field>
        {(content?.services?.items ?? []).map((item, i) => (
          <div key={i} style={{ border: '1px solid #DEDBD4', borderRadius: 2, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8, marginBottom: 8 }}>
              <input
                style={inputStyle}
                value={item.icon}
                placeholder="◧"
                onChange={(e) => {
                  const items = [...(content?.services?.items ?? [])];
                  items[i] = { ...items[i], icon: e.target.value };
                  update('services', { ...content.services, items });
                }}
              />
              <input
                style={inputStyle}
                value={item.name}
                placeholder="Architecture"
                onChange={(e) => {
                  const items = [...(content?.services?.items ?? [])];
                  items[i] = { ...items[i], name: e.target.value };
                  update('services', { ...content.services, items });
                }}
              />
            </div>
            <textarea
              style={{ ...inputStyle, minHeight: 50 }}
              value={item.description}
              onChange={(e) => {
                const items = [...(content?.services?.items ?? [])];
                items[i] = { ...items[i], description: e.target.value };
                update('services', { ...content.services, items });
              }}
            />
          </div>
        ))}
      </Section>

      {/* PROCESS */}
      <Section title="Process" saving={savingSection === 'process'} saved={savedSection === 'process'} onSave={() => saveSection('process', content.process)}>
        <Field label="EYEBROW">
          <input style={inputStyle} value={content?.process?.eyebrow ?? ''} onChange={(e) => update('process', { ...content.process, eyebrow: e.target.value })} />
        </Field>
        <Field label="TITLE">
          <input style={inputStyle} value={content?.process?.title ?? ''} onChange={(e) => update('process', { ...content.process, title: e.target.value })} />
        </Field>
        {(content?.process?.steps ?? []).map((step, i) => (
          <div key={i} style={{ border: '1px solid #DEDBD4', borderRadius: 2, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8, marginBottom: 8 }}>
              <input
                style={inputStyle}
                value={step.number}
                onChange={(e) => {
                  const steps = [...(content?.process?.steps ?? [])];
                  steps[i] = { ...steps[i], number: e.target.value };
                  update('process', { ...content.process, steps });
                }}
              />
              <input
                style={inputStyle}
                value={step.name}
                onChange={(e) => {
                  const steps = [...(content?.process?.steps ?? [])];
                  steps[i] = { ...steps[i], name: e.target.value };
                  update('process', { ...content.process, steps });
                }}
              />
            </div>
            <textarea
              style={{ ...inputStyle, minHeight: 50 }}
              value={step.description}
              onChange={(e) => {
                const steps = [...(content?.process?.steps ?? [])];
                steps[i] = { ...steps[i], description: e.target.value };
                update('process', { ...content.process, steps });
              }}
            />
          </div>
        ))}
      </Section>

      {/* TESTIMONIAL */}
      <Section title="Testimonial" saving={savingSection === 'testimonial'} saved={savedSection === 'testimonial'} onSave={() => saveSection('testimonial', content.testimonial)}>
        <Field label="QUOTE">
          <textarea style={{ ...inputStyle, minHeight: 80 }} value={content?.testimonial?.quote ?? ''} onChange={(e) => update('testimonial', { ...content.testimonial, quote: e.target.value })} />
        </Field>
        <Field label="ATTRIBUTION">
          <input style={inputStyle} value={content?.testimonial?.attribution ?? ''} onChange={(e) => update('testimonial', { ...content.testimonial, attribution: e.target.value })} />
        </Field>
        <Field label="IMAGE">
          <MediaSlot item={content?.testimonial?.mediaId ? mediaMap[content.testimonial.mediaId] : null} onChoose={() => setPickerFor('testimonial')} />
        </Field>
      </Section>

      {/* CTA */}
      <Section title="Call to Action" saving={savingSection === 'cta'} saved={savedSection === 'cta'} onSave={() => saveSection('cta', content.cta)}>
        <Field label="HEADING">
          <input style={inputStyle} value={content?.cta?.heading ?? ''} onChange={(e) => update('cta', { ...content.cta, heading: e.target.value })} />
        </Field>
        <Field label="TEXT">
          <input style={inputStyle} value={content?.cta?.text ?? ''} onChange={(e) => update('cta', { ...content.cta, text: e.target.value })} />
        </Field>
      </Section>

      <MediaPicker open={pickerFor !== null} onClose={() => setPickerFor(null)} onSelect={handleMediaSelected} accept="all" />
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

function MediaSlot({ item, onChoose }: { item: MediaItem | null | undefined; onChoose: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {item && (
        <div style={{ width: 100, height: 75, borderRadius: 2, overflow: 'hidden', background: '#0D0D0D' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbFor(item)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <button onClick={onChoose} style={smallButtonStyle}>
        {item ? 'CHANGE' : 'CHOOSE MEDIA'}
      </button>
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