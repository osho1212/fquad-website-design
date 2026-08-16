'use client';

import { useEffect, useState } from 'react';

interface Award {
  id: string;
  year: number;
  title: string;
  body: string;
  order: number;
  createdAt: string;
}

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [newYear, setNewYear] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/awards');
    const data = await res.json();
    setAwards(data.awards || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    setError('');
    if (!newYear.trim() || !Number.isInteger(Number(newYear))) {
      setError('A valid year is required.');
      return;
    }
    if (!newTitle.trim()) {
      setError('Title is required.');
      return;
    }
    if (!newBody.trim()) {
      setError('Body is required.');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/admin/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: Number(newYear),
          title: newTitle.trim(),
          body: newBody.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add award.');
      } else {
        setNewYear('');
        setNewTitle('');
        setNewBody('');
        await load();
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleEdit(award: Award) {
    const year = prompt('Year:', String(award.year));
    if (year === null) return;
    const title = prompt('Title:', award.title);
    if (title === null) return;
    const body = prompt('Description:', award.body);
    if (body === null) return;

    if (!year.trim() || !Number.isInteger(Number(year))) {
      alert('A valid year is required.');
      return;
    }
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }
    if (!body.trim()) {
      alert('Body is required.');
      return;
    }

    const res = await fetch(`/api/admin/awards/${award.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: Number(year), title: title.trim(), body: body.trim() }),
    });
    if (res.ok) {
      await load();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Failed to update award.');
    }
  }

  async function handleDelete(award: Award) {
    if (!confirm(`Delete "${award.title}" (${award.year})? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/awards/${award.id}`, { method: 'DELETE' });
    if (res.ok) {
      setAwards((prev) => prev.filter((a) => a.id !== award.id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Delete failed.');
    }
  }

  const sorted = [...awards].sort((a, b) => b.year - a.year || a.order - b.order);

  function preview(text: string) {
    return text.length > 120 ? `${text.slice(0, 120).trimEnd()}…` : text;
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Awards</h1>
      <p style={{ color: '#7A7870', fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
        Recognition and press mentions shown on the site. Newest years appear first.
      </p>

      <div
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
            type="number"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            placeholder="Year"
            style={{ ...inputStyle, width: 120 }}
          />
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Award title"
            style={{ ...inputStyle, flex: 1, minWidth: 200 }}
          />
        </div>
        <textarea
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder="Description"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        {error && <p style={{ color: '#B3434A', fontSize: 14, margin: 0 }}>{error}</p>}
        <button
          onClick={handleAdd}
          disabled={adding}
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
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {adding ? 'ADDING…' : '+ ADD AWARD'}
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#9C9890' }}>Loading…</p>
      ) : sorted.length === 0 ? (
        <p style={{ color: '#9C9890' }}>No awards yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map((award) => (
            <div
              key={award.id}
              style={{
                background: '#fff',
                border: '0.5px solid #DEDBD4',
                borderRadius: 4,
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
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
                  {award.year}
                </span>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{award.title}</span>
              </div>

              <p style={{ fontSize: 14, color: '#4A4844', lineHeight: 1.6, marginBottom: 16 }}>
                {preview(award.body)}
              </p>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleEdit(award)} style={actionButtonStyle}>
                  EDIT
                </button>
                <button onClick={() => handleDelete(award)} style={{ ...actionButtonStyle, color: '#B3434A' }}>
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '11px 14px',
  border: '1px solid #DEDBD4',
  borderRadius: 2,
  fontSize: 15,
  fontFamily: 'inherit',
};

const actionButtonStyle: React.CSSProperties = {
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
};
