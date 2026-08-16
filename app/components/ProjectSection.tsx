'use client';

import { useState } from 'react';
import ProjectCarousel from './ProjectCarousel';

interface Props {
  projects: any[];
  idToSlug: Record<string, string>;
  sectionType: 'architecture' | 'interiors';
}

export default function ProjectSection({ projects, idToSlug, sectionType }: Props) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.subCategory === filter);

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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '0 var(--margin-desktop) 40px', position: 'relative', zIndex: 1 }}>
        {['all', 'residential', 'commercial'].map((f) => (
          <button key={f} style={filterBtnStyle(filter === f)} onClick={() => setFilter(f)}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>
      <ProjectCarousel
        projects={filtered}
        showInteriorBtn={sectionType === 'architecture'}
        showArchBtn={sectionType === 'interiors'}
        idToSlug={idToSlug}
      />
    </>
  );
}
