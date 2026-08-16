'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mediaUrl } from '@/lib/public-content';

export default function ProjectsGrid({ projects, categories }: { projects: any[]; categories: any[] }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.category?.slug === activeFilter);

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 11,
    letterSpacing: '0.12em',
    padding: '10px 20px',
    borderRadius: 2,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    background: active ? '#2C2C2C' : 'transparent',
    color: active ? '#FAFAF8' : '#6B6560',
    border: `0.5px solid ${active ? '#2C2C2C' : '#E2DDD8'}`,
  });

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '32px 48px', borderBottom: '0.5px solid #E2DDD8' }}>
        <button style={filterBtnStyle(activeFilter === 'all')} onClick={() => setActiveFilter('all')}>ALL</button>
        {categories.map((cat) => (
          <button key={cat.id} style={filterBtnStyle(activeFilter === cat.slug)} onClick={() => setActiveFilter(cat.slug)}>
            {cat.name.toUpperCase()}
          </button>
        ))}
      </div>

      <section className="projects-section">
        <div className="projects-grid" style={{ gap: 24 }}>
          {filtered.map((project) => {
            const img = mediaUrl(project.coverMedia, 'medium');
            return (
              <Link href={`/projects/${project.slug}`} className="project-card" key={project.id}>
                <div className="project-image">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="project-texture" />
                  )}
                  <div
                    className="project-tag"
                    style={{ fontSize: 10, color: '#FAFAF8', background: 'rgba(42,42,42,0.7)', padding: '4px 10px' }}
                  >
                    {project.category?.name?.toUpperCase() || ''}
                  </div>
                </div>
                <div className="project-name">{project.title}</div>
                <div className="project-loc">
                  {project.location || ''}
                  {project.year ? ` — ${project.year}` : ''}
                </div>
              </Link>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p style={{ color: '#9C9488', textAlign: 'center', padding: '60px 0' }}>
            Projects coming soon.
          </p>
        )}
      </section>
    </>
  );
}
