'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { thumbFor, type MediaItem } from '../components/MediaPicker';

interface Category {
  id: string;
  name: string;
}

interface ProjectListItem {
  id: string;
  title: string;
  location: string | null;
  year: number | null;
  featured: boolean;
  published: boolean;
  order: number;
  category: Category;
  mainCategory: { slug: string } | null;
  subCategory: string | null;
  coverMedia: MediaItem | null;
}

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/projects');
    const data = await res.json();
    setProjects(data.projects || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert('Delete failed.');
    }
  }

  function handleDragStart(id: string) {
    setDragId(id);
  }

  function handleDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;

    setProjects((prev) => {
      const dragIndex = prev.findIndex((p) => p.id === dragId);
      const overIndex = prev.findIndex((p) => p.id === overId);
      if (dragIndex === -1 || overIndex === -1) return prev;

      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(overIndex, 0, moved);
      return next;
    });
  }

  async function handleDragEnd() {
    if (!dragId) return;
    setDragId(null);
    setSavingOrder(true);
    try {
      await fetch('/api/admin/projects/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: projects.map((p) => p.id) }),
      });
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Projects</h1>
          <p style={{ color: '#7A7870', fontSize: 15, maxWidth: 520, lineHeight: 1.7 }}>
            Drag rows to reorder — this controls the order projects appear on the Projects
            page. Featured projects also appear in "Selected works" on the homepage.
            {savingOrder && <span style={{ color: '#8B6F47' }}> Saving order…</span>}
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          style={{
            padding: '12px 24px',
            background: '#0D0D0D',
            color: '#F8F8F6',
            borderRadius: 2,
            fontSize: 12,
            letterSpacing: '0.14em',
            fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          + NEW PROJECT
        </Link>
      </div>

      {loading ? (
        <p style={{ color: '#9C9890' }}>Loading…</p>
      ) : projects.length === 0 ? (
        <p style={{ color: '#9C9890' }}>No projects yet — create your first one above.</p>
      ) : (
        <div style={{ background: '#fff', border: '0.5px solid #DEDBD4', borderRadius: 4, overflow: 'hidden' }}>
          {projects.map((project) => (
            <div
              key={project.id}
              draggable
              onDragStart={() => handleDragStart(project.id)}
              onDragOver={(e) => handleDragOver(e, project.id)}
              onDragEnd={handleDragEnd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 20px',
                borderBottom: '0.5px solid #DEDBD4',
                background: dragId === project.id ? '#F0EEE8' : '#fff',
                cursor: 'grab',
              }}
            >
              <span style={{ color: '#DEDBD4', fontSize: 18, lineHeight: 1 }}>⠿</span>

              <div style={{ width: 56, height: 42, background: '#0D0D0D', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                {project.coverMedia && thumbFor(project.coverMedia) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbFor(project.coverMedia)}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{project.title}</div>
                <div style={{ fontSize: 13, color: '#9C9890' }}>
                  {project.location ? project.location : ''}
                  {project.year ? ` · ${project.year}` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {project.mainCategory?.slug === 'architecture' && <Badge color="#0D0D0D">ARCH</Badge>}
                {project.mainCategory?.slug === 'interiors' && <Badge color="#0D0D0D">INT</Badge>}
                {project.subCategory === 'residential' && <Badge color="#7A7870">RES</Badge>}
                {project.subCategory === 'commercial' && <Badge color="#7A7870">COM</Badge>}
                {project.featured && <Badge color="#8B6F47">FEATURED</Badge>}
                {!project.published && <Badge color="#B3434A">DRAFT</Badge>}
              </div>

              <Link
                href={`/admin/projects/${project.id}`}
                style={{
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  color: '#0D0D0D',
                  border: '1px solid #DEDBD4',
                  borderRadius: 2,
                  padding: '8px 14px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                EDIT
              </Link>
              <button
                onClick={() => handleDelete(project.id, project.title)}
                style={{
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  color: '#B3434A',
                  background: 'none',
                  border: '1px solid #DEDBD4',
                  borderRadius: 2,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                DELETE
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        letterSpacing: '0.08em',
        fontWeight: 700,
        color,
        border: `1px solid ${color}`,
        borderRadius: 2,
        padding: '3px 7px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}