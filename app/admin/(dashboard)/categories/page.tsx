'use client';

import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  _count: { projects: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/categories');
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    setError('');
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add category.');
      } else {
        setNewName('');
        await load();
      }
    } finally {
      setAdding(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
  }

  async function saveEdit() {
    if (!editingId || !editName.trim()) return;
    setError('');
    const res = await fetch(`/api/admin/categories/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    });
    if (res.ok) {
      setEditingId(null);
      await load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to rename category.');
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' });
    if (res.ok) {
      await load();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Delete failed.');
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Categories</h1>
      <p style={{ color: '#7A7870', fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
        These power the filter buttons on the Projects page and the category dropdown
        when creating a project. Add as many as you need — showrooms, cafés, anything
        beyond the defaults.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="e.g. Jewellery Showroom"
          style={{
            flex: 1,
            padding: '11px 14px',
            border: '1px solid #DEDBD4',
            borderRadius: 2,
            fontSize: 15,
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleAdd}
          disabled={adding}
          style={{
            padding: '11px 20px',
            background: '#0D0D0D',
            color: '#F8F8F6',
            border: 'none',
            borderRadius: 2,
            fontSize: 12,
            letterSpacing: '0.1em',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {adding ? 'ADDING…' : '+ ADD'}
        </button>
      </div>

      {error && <p style={{ color: '#B3434A', fontSize: 14, marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p style={{ color: '#9C9890' }}>Loading…</p>
      ) : (
        <div style={{ background: '#fff', border: '0.5px solid #DEDBD4', borderRadius: 4, overflow: 'hidden' }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderBottom: '0.5px solid #DEDBD4',
              }}
            >
              {editingId === cat.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    autoFocus
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      border: '1px solid #C4A97D',
                      borderRadius: 2,
                      fontSize: 14,
                      fontFamily: 'inherit',
                    }}
                  />
                  <button onClick={saveEdit} style={linkButtonStyle}>SAVE</button>
                  <button onClick={() => setEditingId(null)} style={{ ...linkButtonStyle, color: '#9C9890' }}>CANCEL</button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{cat.name}</span>
                    <span style={{ fontSize: 12, color: '#9C9890', marginLeft: 8 }}>
                      {cat._count.projects} project{cat._count.projects === 1 ? '' : 's'}
                    </span>
                  </div>
                  <button onClick={() => startEdit(cat)} style={linkButtonStyle}>RENAME</button>
                  <button onClick={() => handleDelete(cat)} style={{ ...linkButtonStyle, color: '#B3434A' }}>DELETE</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const linkButtonStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.08em',
  fontWeight: 600,
  color: '#0D0D0D',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  padding: '4px 6px',
};