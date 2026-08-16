'use client';

import { useEffect, useState } from 'react';
import MediaPicker, { thumbFor, type MediaItem } from '../components/MediaPicker';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  linkedIn: string | null;
  mediaId: string | null;
  media: MediaItem | null;
  featured: boolean;
  order: number;
  createdAt: string;
}

interface NewMemberForm {
  name: string;
  role: string;
  bio: string;
  linkedIn: string;
  featured: boolean;
  media: MediaItem | null;
}

const emptyForm: NewMemberForm = {
  name: '',
  role: '',
  bio: '',
  linkedIn: '',
  featured: false,
  media: null,
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<NewMemberForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/team');
    const data = await res.json();
    setMembers(data.members || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function update<K extends keyof NewMemberForm>(key: K, val: NewMemberForm[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleCreate() {
    setError('');

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!form.role.trim()) {
      setError('Role is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          role: form.role.trim(),
          bio: form.bio.trim() || null,
          linkedIn: form.linkedIn.trim() || null,
          mediaId: form.media?.id || null,
          featured: form.featured,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add team member.');
      } else {
        setMembers((prev) => [...prev, data.member]);
        setForm(emptyForm);
      }
    } catch {
      setError('Failed to add team member — check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleFeatured(member: TeamMember) {
    const featured = !member.featured;
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, featured } : m)));
    await fetch(`/api/admin/team/${member.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured }),
    });
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Team</h1>
      <p style={{ color: '#7A7870', fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
        Add and manage the people shown on the Team page.
      </p>

      <div
        style={{
          background: '#fff',
          border: '0.5px solid #DEDBD4',
          borderRadius: 4,
          padding: 20,
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Add New Member</h2>

        {error && (
          <p
            style={{
              color: '#B3434A',
              fontSize: 14,
              marginBottom: 16,
              background: '#F8F8F6',
              padding: 12,
              borderRadius: 2,
              border: '1px solid #B3434A',
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="NAME">
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              style={inputStyle}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="ROLE">
            <input
              type="text"
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
              style={inputStyle}
              placeholder="Principal Architect"
            />
          </Field>
        </div>

        <Field label="BIO">
          <textarea
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            style={{ ...inputStyle, minHeight: 90, resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="A short bio…"
          />
        </Field>

        <Field label="LINKEDIN URL">
          <input
            type="url"
            value={form.linkedIn}
            onChange={(e) => update('linkedIn', e.target.value)}
            style={inputStyle}
            placeholder="https://linkedin.com/in/…"
          />
        </Field>

        <Field label="PHOTO">
          {form.media ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 72, height: 72, borderRadius: 2, overflow: 'hidden', background: '#0D0D0D' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbFor(form.media)}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <button onClick={() => setPickerOpen(true)} style={smallButtonStyle}>
                CHANGE
              </button>
              <button onClick={() => update('media', null)} style={{ ...smallButtonStyle, color: '#B3434A' }}>
                REMOVE
              </button>
            </div>
          ) : (
            <button onClick={() => setPickerOpen(true)} style={smallButtonStyle}>
              CHOOSE PHOTO
            </button>
          )}
        </Field>

        <label style={{ ...checkboxLabelStyle, margin: '20px 0' }}>
          <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} />
          Featured
        </label>

        <div>
          <button onClick={handleCreate} disabled={saving} style={primaryButtonStyle}>
            {saving ? 'ADDING…' : 'ADD MEMBER'}
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#9C9890' }}>Loading…</p>
      ) : members.length === 0 ? (
        <p style={{ color: '#9C9890' }}>No team members yet — add one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {members.map((member) => (
            <div
              key={member.id}
              style={{
                background: '#fff',
                border: '0.5px solid #DEDBD4',
                borderRadius: 4,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 2, overflow: 'hidden', background: '#0D0D0D', flexShrink: 0 }}>
                {member.media ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbFor(member.media)}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : null}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{member.name}</span>
                  {member.featured && (
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        fontWeight: 700,
                        color: '#8B6F47',
                        border: '1px solid #C4A97D',
                        borderRadius: 2,
                        padding: '3px 7px',
                      }}
                    >
                      FEATURED
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#9C9890', marginTop: 2 }}>{member.role}</div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => toggleFeatured(member)} style={smallButtonStyle}>
                  {member.featured ? 'UNFEATURE' : 'FEATURE'}
                </button>
                <button
                  onClick={() => handleDelete(member.id, member.name)}
                  style={{ ...smallButtonStyle, color: '#B3434A' }}
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(item) => update('media', item)}
        accept="image"
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
