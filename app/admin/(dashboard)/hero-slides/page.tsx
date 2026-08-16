'use client';

import { useEffect, useState } from 'react';
import MediaPicker, { thumbFor, type MediaItem } from '../components/MediaPicker';

interface HeroSlide {
  id: string;
  mediaId: string;
  media: MediaItem;
  order: number;
  active: boolean;
  createdAt: string;
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMedia, setNewMedia] = useState<MediaItem | null>(null);
  const [newOrder, setNewOrder] = useState('0');
  const [newActive, setNewActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/hero-slides');
    const data = await res.json();
    setSlides(data.slides || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    setError('');
    if (!newMedia) {
      setError('Please choose an image or video.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId: newMedia.id,
          order: newOrder ? Number(newOrder) : 0,
          active: newActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add slide.');
      } else {
        setSlides((prev) => [...prev, data.slide]);
        setNewMedia(null);
        setNewOrder('0');
        setNewActive(true);
      }
    } catch {
      setError('Failed to add slide — check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(slide: HeroSlide) {
    const active = !slide.active;
    setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, active } : s)));
    await fetch(`/api/admin/hero-slides/${slide.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this hero slide? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/hero-slides/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSlides((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert('Delete failed.');
    }
  }

  const sorted = [...slides].sort((a, b) => a.order - b.order);

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Hero Slides</h1>
      <p style={{ color: '#7A7870', fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
        Images and videos shown in rotation in the homepage hero. Lower order numbers appear first.
      </p>

      <div style={{ background: '#fff', border: '0.5px solid #DEDBD4', borderRadius: 4, padding: 20, marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Add New Slide</h2>

        {error && (
          <p style={{ color: '#B3434A', fontSize: 14, marginBottom: 16, background: '#F8F8F6', padding: 12, borderRadius: 2, border: '1px solid #B3434A' }}>
            {error}
          </p>
        )}

        <Field label="MEDIA">
          {newMedia ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 100, height: 75, borderRadius: 2, overflow: 'hidden', background: '#0D0D0D' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbFor(newMedia)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <button onClick={() => setPickerOpen(true)} style={smallButtonStyle}>CHANGE</button>
              <button onClick={() => setNewMedia(null)} style={{ ...smallButtonStyle, color: '#B3434A' }}>REMOVE</button>
            </div>
          ) : (
            <button onClick={() => setPickerOpen(true)} style={smallButtonStyle}>CHOOSE IMAGE OR VIDEO</button>
          )}
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="ORDER">
            <input
              type="number"
              value={newOrder}
              onChange={(e) => setNewOrder(e.target.value)}
              style={inputStyle}
              placeholder="0"
            />
          </Field>
          <Field label="STATUS">
            <label style={checkboxLabelStyle}>
              <input type="checkbox" checked={newActive} onChange={(e) => setNewActive(e.target.checked)} />
              Active
            </label>
          </Field>
        </div>

        <div>
          <button onClick={handleAdd} disabled={saving} style={primaryButtonStyle}>
            {saving ? 'ADDING…' : '+ ADD SLIDE'}
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#9C9890' }}>Loading…</p>
      ) : sorted.length === 0 ? (
        <p style={{ color: '#9C9890' }}>No hero slides yet — add one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map((slide) => (
            <div
              key={slide.id}
              style={{ background: '#fff', border: '0.5px solid #DEDBD4', borderRadius: 4, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <div style={{ width: 80, height: 60, borderRadius: 2, overflow: 'hidden', background: '#0D0D0D', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbFor(slide.media)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: '#0D0D0D' }}>Order: {slide.order}</div>
                <div style={{ fontSize: 12, color: '#9C9890', marginTop: 2 }}>{slide.media.type}</div>
              </div>

              <button
                onClick={() => toggleActive(slide)}
                style={{
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  padding: '6px 12px',
                  borderRadius: 2,
                  border: `1px solid ${slide.active ? '#3F7A4E' : '#9C9890'}`,
                  background: slide.active ? '#3F7A4E' : 'transparent',
                  color: slide.active ? '#F8F8F6' : '#9C9890',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {slide.active ? 'ACTIVE' : 'INACTIVE'}
              </button>

              <button onClick={() => handleDelete(slide.id)} style={{ ...smallButtonStyle, color: '#B3434A', flexShrink: 0 }}>
                DELETE
              </button>
            </div>
          ))}
        </div>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(item) => setNewMedia(item)}
        accept="all"
        background
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, letterSpacing: '0.12em', color: '#7A7870', fontWeight: 600, marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid #DEDBD4',
  borderRadius: 2,
  fontSize: 15,
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

const primaryButtonStyle: React.CSSProperties = {
  padding: '13px 28px',
  background: '#0D0D0D',
  color: '#F8F8F6',
  border: 'none',
  borderRadius: 2,
  fontSize: 12,
  letterSpacing: '0.14em',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  color: '#0D0D0D',
  cursor: 'pointer',
};
