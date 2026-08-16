'use client';

import { useEffect, useState } from 'react';
import MediaPicker, { thumbFor, type MediaItem } from '../components/MediaPicker';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  mediaId: string | null;
  media: MediaItem | null;
  published: boolean;
  publishedAt: string | null;
  order: number;
  createdAt: string;
}

interface NewPostForm {
  title: string;
  excerpt: string;
  body: string;
  coverMedia: MediaItem | null;
}

const emptyForm: NewPostForm = {
  title: '',
  excerpt: '',
  body: '',
  coverMedia: null,
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<NewPostForm>(emptyForm);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/blog');
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function update<K extends keyof NewPostForm>(key: K, val: NewPostForm[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleCreate() {
    setError('');

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!form.body.trim()) {
      setError('Body is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          excerpt: form.excerpt.trim() || null,
          body: form.body,
          mediaId: form.coverMedia?.id || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Save failed.');
      } else {
        setPosts((prev) => [...prev, data.post]);
        setForm(emptyForm);
      }
    } catch {
      setError('Save failed — check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(post: BlogPost) {
    const nextPublished = !post.published;
    const res = await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: nextPublished }),
    });
    if (res.ok) {
      const data = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === post.id ? data.post : p)));
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Blog</h1>

      {error && (
        <p
          style={{
            color: '#B3434A',
            fontSize: 14,
            marginBottom: 16,
            background: '#fff',
            padding: 12,
            borderRadius: 2,
            border: '1px solid #B3434A',
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          background: '#fff',
          border: '0.5px solid #DEDBD4',
          borderRadius: 4,
          padding: 20,
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>New Post</h2>

        <Field label="TITLE">
          <input
            type="text"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            style={inputStyle}
            placeholder="How we designed the Pebble House"
          />
        </Field>

        <Field label="EXCERPT">
          <textarea
            value={form.excerpt}
            onChange={(e) => update('excerpt', e.target.value)}
            style={{ ...inputStyle, minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="A short preview shown on the blog listing…"
          />
        </Field>

        <Field label="BODY">
          <textarea
            value={form.body}
            onChange={(e) => update('body', e.target.value)}
            style={{ ...inputStyle, minHeight: 200, resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Write the full post…"
          />
        </Field>

        <Field label="COVER IMAGE">
          {form.coverMedia ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 100, height: 75, borderRadius: 2, overflow: 'hidden', background: '#0D0D0D' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbFor(form.coverMedia)}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <button onClick={() => setPickerOpen(true)} style={smallButtonStyle}>
                CHANGE
              </button>
              <button onClick={() => update('coverMedia', null)} style={{ ...smallButtonStyle, color: '#B3434A' }}>
                REMOVE
              </button>
            </div>
          ) : (
            <button onClick={() => setPickerOpen(true)} style={smallButtonStyle}>
              CHOOSE COVER IMAGE
            </button>
          )}
        </Field>

        <div style={{ marginTop: 24 }}>
          <button onClick={handleCreate} disabled={saving} style={primaryButtonStyle}>
            {saving ? 'SAVING…' : 'CREATE POST'}
          </button>
        </div>
      </div>

      <h2 style={{ fontSize: 16, marginBottom: 16 }}>All Posts</h2>

      {loading ? (
        <p style={{ color: '#9C9890' }}>Loading…</p>
      ) : posts.length === 0 ? (
        <p style={{ color: '#9C9890' }}>No posts yet — add one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                background: '#fff',
                border: '0.5px solid #DEDBD4',
                borderRadius: 4,
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {post.media && (
                    <div style={{ width: 72, height: 54, borderRadius: 2, overflow: 'hidden', background: '#0D0D0D', flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbFor(post.media)}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{post.title}</div>
                    <div style={{ fontSize: 13, color: '#9C9890', marginTop: 2 }}>
                      {new Date(post.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    color: post.published ? '#2F7A3D' : '#7A7870',
                    background: post.published ? '#E4F2E4' : '#F0EEE8',
                    borderRadius: 2,
                    padding: '4px 8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {post.published ? 'PUBLISHED' : 'DRAFT'}
                </span>
              </div>

              {post.excerpt && (
                <p style={{ fontSize: 14, color: '#4A4844', lineHeight: 1.6, marginBottom: 16 }}>{post.excerpt}</p>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => handleTogglePublish(post)} style={smallButtonStyle}>
                  {post.published ? 'UNPUBLISH' : 'PUBLISH'}
                </button>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  style={{ ...smallButtonStyle, color: '#B3434A', marginLeft: 'auto' }}
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
        onSelect={(item) => update('coverMedia', item)}
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
