'use client';

import { useEffect, useState } from 'react';

interface Testimonial {
  id: string;
  clientName: string;
  projectName: string | null;
  quote: string;
  mediaId: string | null;
  featured: boolean;
  order: number;
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [quote, setQuote] = useState('');
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/testimonials');
    const data = await res.json();
    setTestimonials(data.testimonials || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim() || !quote.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          projectName: projectName.trim() || undefined,
          quote: quote.trim(),
          featured,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add testimonial.');
      } else {
        setClientName('');
        setProjectName('');
        setQuote('');
        setFeatured(false);
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleFeatured(t: Testimonial) {
    const res = await fetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !t.featured }),
    });
    if (res.ok) {
      setTestimonials((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, featured: !t.featured } : item))
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Testimonials</h1>
      <p style={{ color: '#7A7870', fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
        Client quotes shown across the site. Mark the strongest ones as featured to
        highlight them.
      </p>

      <form
        onSubmit={handleAdd}
        style={{
          background: '#fff',
          border: '0.5px solid #DEDBD4',
          borderRadius: 4,
          padding: 20,
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Client name"
            required
            style={{
              flex: '1 1 240px',
              padding: '11px 14px',
              border: '1px solid #DEDBD4',
              borderRadius: 2,
              fontSize: 15,
              fontFamily: 'inherit',
            }}
          />
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name (optional)"
            style={{
              flex: '1 1 240px',
              padding: '11px 14px',
              border: '1px solid #DEDBD4',
              borderRadius: 2,
              fontSize: 15,
              fontFamily: 'inherit',
            }}
          />
        </div>

        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Quote"
          required
          rows={4}
          style={{
            padding: '11px 14px',
            border: '1px solid #DEDBD4',
            borderRadius: 2,
            fontSize: 15,
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#4A4844' }}>
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Featured
        </label>

        {error && <p style={{ color: '#B3434A', fontSize: 14, margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{
            alignSelf: 'flex-start',
            padding: '11px 20px',
            background: '#0D0D0D',
            color: '#F8F8F6',
            border: 'none',
            borderRadius: 2,
            fontSize: 12,
            letterSpacing: '0.1em',
            fontWeight: 600,
            cursor: saving ? 'default' : 'pointer',
          }}
        >
          {saving ? 'ADDING…' : '+ ADD TESTIMONIAL'}
        </button>
      </form>

      {loading ? (
        <p style={{ color: '#9C9890' }}>Loading…</p>
      ) : testimonials.length === 0 ? (
        <p style={{ color: '#9C9890' }}>No testimonials yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {testimonials.map((t) => {
            const preview = t.quote.length > 100 ? `${t.quote.slice(0, 100)}…` : t.quote;
            return (
              <div
                key={t.id}
                style={{
                  background: '#fff',
                  border: '0.5px solid #DEDBD4',
                  borderRadius: 4,
                  padding: 20,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{t.clientName}</div>
                    {t.projectName && (
                      <div style={{ fontSize: 13, color: '#9C9890', marginTop: 2 }}>{t.projectName}</div>
                    )}
                  </div>
                  {t.featured && (
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        fontWeight: 700,
                        color: '#8B6F47',
                        border: '1px solid #C4A97D',
                        borderRadius: 2,
                        padding: '4px 8px',
                      }}
                    >
                      FEATURED
                    </span>
                  )}
                </div>

                <p style={{ fontSize: 14, color: '#4A4844', lineHeight: 1.6, marginBottom: 16 }}>
                  “{preview}”
                </p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleFeatured(t)}
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      padding: '6px 12px',
                      border: '1px solid #DEDBD4',
                      borderRadius: 2,
                      background: 'transparent',
                      color: '#0D0D0D',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                    }}
                  >
                    {t.featured ? 'UNMARK FEATURED' : 'MARK FEATURED'}
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      padding: '6px 12px',
                      border: '1px solid #DEDBD4',
                      borderRadius: 2,
                      background: 'transparent',
                      color: '#B3434A',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      marginLeft: 'auto',
                    }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
