'use client';

import { useEffect, useState } from 'react';
import MediaPicker, { thumbFor, type MediaItem } from '../components/MediaPicker';
import LocationPicker from '../components/LocationPicker';

interface Settings {
  siteName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  instagramUrl: string;
  mapLat: number | null;
  mapLng: number | null;
  metaTitle: string;
  metaDescription: string;
  logoDarkId: string | null;
  logoLightId: string | null;
  ogImageId: string | null;
  logoDark: MediaItem | null;
  logoLight: MediaItem | null;
  ogImage: MediaItem | null;
}

const empty: Settings = {
  siteName: 'F.QUAD',
  email: '',
  phone: '',
  whatsapp: '',
  address: '',
  instagramUrl: '',
  mapLat: null,
  mapLng: null,
  metaTitle: '',
  metaDescription: '',
  logoDarkId: null,
  logoLightId: null,
  ogImageId: null,
  logoDark: null,
  logoLight: null,
  ogImage: null,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pickerFor, setPickerFor] = useState<'logoDark' | 'logoLight' | 'ogImage' | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings({
            siteName: data.settings.siteName || 'F.QUAD',
            email: data.settings.email || '',
            phone: data.settings.phone || '',
            whatsapp: data.settings.whatsapp || '',
            address: data.settings.address || '',
            instagramUrl: data.settings.instagramUrl || '',
            mapLat: data.settings.mapLat,
            mapLng: data.settings.mapLng,
            metaTitle: data.settings.metaTitle || '',
            metaDescription: data.settings.metaDescription || '',
            logoDarkId: data.settings.logoDarkId,
            logoLightId: data.settings.logoLightId,
            ogImageId: data.settings.ogImageId,
            logoDark: data.settings.logoDark,
            logoLight: data.settings.logoLight,
            ogImage: data.settings.ogImage,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleMediaSelected(item: MediaItem) {
    if (pickerFor === 'logoDark') {
      update('logoDarkId', item.id);
      update('logoDark', item);
    } else if (pickerFor === 'logoLight') {
      update('logoLightId', item.id);
      update('logoLight', item);
    } else if (pickerFor === 'ogImage') {
      update('ogImageId', item.id);
      update('ogImage', item);
    }
    setPickerFor(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: settings.siteName,
          email: settings.email || null,
          phone: settings.phone || null,
          whatsapp: settings.whatsapp || null,
          address: settings.address || null,
          instagramUrl: settings.instagramUrl || null,
          mapLat: settings.mapLat,
          mapLng: settings.mapLng,
          metaTitle: settings.metaTitle || null,
          metaDescription: settings.metaDescription || null,
          logoDarkId: settings.logoDarkId,
          logoLightId: settings.logoLightId,
          ogImageId: settings.ogImageId,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p style={{ color: '#9C9890' }}>Loading…</p>;
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Settings</h1>
      <p style={{ color: '#7A7870', fontSize: 15, marginBottom: 32, lineHeight: 1.7 }}>
        Site-wide contact info, social links, branding, and SEO defaults — used across
        every page.
      </p>

      <SectionBlock title="Contact Info">
        <Field label="EMAIL">
          <input style={inputStyle} value={settings.email} onChange={(e) => update('email', e.target.value)} placeholder="admin@fquad.com" />
        </Field>
        <Field label="PHONE">
          <input style={inputStyle} value={settings.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98765 43210" />
        </Field>
        <Field label="WHATSAPP NUMBER">
          <input style={inputStyle} value={settings.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="+91 98765 43210" />
        </Field>
        <Field label="ADDRESS">
          <input style={inputStyle} value={settings.address} onChange={(e) => update('address', e.target.value)} placeholder="Hyderabad, Telangana, India" />
        </Field>
        <Field label="INSTAGRAM URL">
          <input style={inputStyle} value={settings.instagramUrl} onChange={(e) => update('instagramUrl', e.target.value)} placeholder="https://instagram.com/fquadstudio" />
        </Field>
      </SectionBlock>

      <SectionBlock title="Studio Location">
        <LocationPicker
          lat={settings.mapLat}
          lng={settings.mapLng}
          onChange={(lat, lng, address) => {
            update('mapLat', lat);
            update('mapLng', lng);
            if (address) update('address', address);
          }}
        />
      </SectionBlock>

      <SectionBlock title="Branding">
        <Field label="SITE NAME">
          <input style={inputStyle} value={settings.siteName} onChange={(e) => update('siteName', e.target.value)} />
        </Field>
        <Field label="LOGO — DARK (for light backgrounds)">
          <MediaSlot item={settings.logoDark} onChoose={() => setPickerFor('logoDark')} />
        </Field>
        <Field label="LOGO — LIGHT (for dark/transparent backgrounds)">
          <MediaSlot item={settings.logoLight} onChoose={() => setPickerFor('logoLight')} />
        </Field>
      </SectionBlock>

      <SectionBlock title="SEO Defaults">
        <Field label="META TITLE">
          <input style={inputStyle} value={settings.metaTitle} onChange={(e) => update('metaTitle', e.target.value)} placeholder="F.QUAD — Architecture & Interior Design Studio" />
        </Field>
        <Field label="META DESCRIPTION">
          <textarea style={{ ...inputStyle, minHeight: 70 }} value={settings.metaDescription} onChange={(e) => update('metaDescription', e.target.value)} />
        </Field>
        <Field label="SOCIAL SHARE IMAGE">
          <MediaSlot item={settings.ogImage} onChoose={() => setPickerFor('ogImage')} />
        </Field>
      </SectionBlock>

      <button onClick={handleSave} disabled={saving} style={saveButtonStyle}>
        {saving ? 'SAVING…' : saved ? 'SAVED ✓' : 'SAVE ALL CHANGES'}
      </button>

      <MediaPicker open={pickerFor !== null} onClose={() => setPickerFor(null)} onSelect={handleMediaSelected} accept="image" />
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #DEDBD4', borderRadius: 4, padding: 20, marginBottom: 20 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{title}</h2>
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

function MediaSlot({ item, onChoose }: { item: MediaItem | null; onChoose: () => void }) {
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