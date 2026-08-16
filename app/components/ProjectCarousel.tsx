'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Props {
  projects: any[];
  showBadge?: boolean;
  badgeText?: string;
  showInteriorBtn?: boolean;
  showArchBtn?: boolean;
  idToSlug?: Record<string, string>;
}

// Two rendering modes live in this one file (both call sites are named
// ProjectCarousel): the homepage's simple thumbnail slider (showBadge/badgeText,
// unchanged) and the projects page's richer per-card carousel (showInteriorBtn/
// showArchBtn), selected by which props are passed in.
export default function ProjectCarousel({ projects, showBadge, badgeText = 'UPCOMING', showInteriorBtn, showArchBtn, idToSlug = {} }: Props) {
  if (showInteriorBtn !== undefined || showArchBtn !== undefined) {
    return <RichProjectCarousel projects={projects} showInteriorBtn={showInteriorBtn} showArchBtn={showArchBtn} idToSlug={idToSlug} />;
  }
  return <SimpleProjectCarousel projects={projects} showBadge={showBadge} badgeText={badgeText} />;
}

function SimpleProjectCarousel({ projects, showBadge, badgeText }: { projects: any[]; showBadge?: boolean; badgeText: string }) {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = projects.length;
  const visible = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;
  const max = Math.max(0, count - visible);

  useEffect(() => {
    if (count <= visible || paused) return;
    const t = setInterval(() => setCur((i) => (i >= max ? 0 : i + 1)), 2000);
    return () => clearInterval(t);
  }, [count, visible, max, paused]);

  if (!count) return <p style={{ color: '#9C9488', padding: '48px var(--margin-desktop)', fontSize: 14 }}>No projects to display.</p>;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} style={{ position: 'relative', overflow: 'hidden', padding: '0 var(--margin-desktop)' }}>
      <div style={{ display: 'flex', gap: 24, transform: `translateX(calc(-${cur * (100 / visible)}% - ${cur * 24 / visible}px))`, transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' }}>
        {projects.map((p: any) => {
          const img = p.coverMedia?.variants?.find((v: any) => v.label === 'medium')?.path || p.coverMedia?.path;
          return (
            <Link key={p.id} href={`/projects/${p.slug}`} style={{ flex: `0 0 calc(${100 / visible}% - ${24 * (visible - 1) / visible}px)`, textDecoration: 'none', display: 'block' }}>
              <div style={{ position: 'relative', aspectRatio: '4/3', background: '#1E1E1E', borderRadius: 2, overflow: 'hidden' }}>
                {img && <img src={img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                {showBadge && (
                  <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 10, letterSpacing: '0.1em', color: '#FAFAF8', background: 'rgba(42,42,42,0.8)', padding: '4px 10px', borderRadius: 2, border: '0.5px solid rgba(248,248,246,0.3)' }}>
                    {badgeText}
                  </span>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#E2DDD8', transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.4s ease' }} className="card-line" />
              </div>
              <div style={{ marginTop: 16, fontSize: 18, color: '#2C2C2C', lineHeight: 1.3 }}>{p.title}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#9C9488', letterSpacing: '0.08em' }}>
                {[p.category?.name, p.location, p.year].filter(Boolean).join(' · ')}
              </div>
            </Link>
          );
        })}
      </div>
      {count > visible && (
        <>
          <button
            onClick={() => setCur((i) => Math.max(0, i - 1))}
            style={{ position: 'absolute', left: 8, top: '35%', width: 36, height: 36, borderRadius: '50%', border: '0.5px solid #E2DDD8', background: 'rgba(248,248,246,0.9)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ‹
          </button>
          <button
            onClick={() => setCur((i) => Math.min(max, i + 1))}
            style={{ position: 'absolute', right: 8, top: '35%', width: 36, height: 36, borderRadius: '50%', border: '0.5px solid #E2DDD8', background: 'rgba(248,248,246,0.9)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ›
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            {Array.from({ length: max + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCur(i)}
                style={{ width: i === cur ? 20 : 8, height: 2, background: i === cur ? '#2C2C2C' : '#E2DDD8', border: 'none', borderRadius: 1, cursor: 'pointer', padding: 0, transition: 'all 0.3s' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RichProjectCarousel({
  projects,
  showInteriorBtn,
  showArchBtn,
  idToSlug,
}: {
  projects: any[];
  showInteriorBtn?: boolean;
  showArchBtn?: boolean;
  idToSlug: Record<string, string>;
}) {
  const [cur, setCur] = useState(0);
  const [visible, setVisible] = useState(3);

  useEffect(() => {
    function updateVisible() {
      const w = window.innerWidth;
      setVisible(w < 640 ? 1 : w < 1024 ? 2 : 3);
    }
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  const count = projects.length;
  const max = Math.max(0, count - visible);

  useEffect(() => {
    if (cur > max) setCur(max);
  }, [max, cur]);

  if (count === 0) {
    return <p style={{ color: '#9C9488', textAlign: 'center', padding: '60px var(--margin-desktop)' }}>No projects yet.</p>;
  }

  return (
    <div style={{ position: 'relative', padding: '0 44px' }}>
      <div style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            gap: 24,
            transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
            transform: `translateX(calc(-${cur * (100 / visible)}% - ${(cur * 24) / visible}px))`,
          }}
        >
          {projects.map((project) => (
            <div key={project.id} style={{ flex: `0 0 calc(${100 / visible}% - ${(24 * (visible - 1)) / visible}px)` }}>
              <ProjectCard project={project} showInteriorBtn={showInteriorBtn} showArchBtn={showArchBtn} idToSlug={idToSlug} />
            </div>
          ))}
        </div>
      </div>

      {cur > 0 && (
        <button onClick={() => setCur((i) => Math.max(0, i - 1))} className="carousel-arrow carousel-arrow-left" aria-label="Previous">‹</button>
      )}
      {cur < max && (
        <button onClick={() => setCur((i) => Math.min(max, i + 1))} className="carousel-arrow carousel-arrow-right" aria-label="Next">›</button>
      )}

      {max > 0 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
          {Array.from({ length: max + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCur(i)}
              style={{ width: i === cur ? 20 : 6, height: 2, background: i === cur ? '#2C2C2C' : '#E2DDD8', borderRadius: 1, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  showInteriorBtn,
  showArchBtn,
  idToSlug,
}: {
  project: any;
  showInteriorBtn?: boolean;
  showArchBtn?: boolean;
  idToSlug: Record<string, string>;
}) {
  const allImages: string[] = [];
  const coverUrl = project.coverMedia?.variants?.find((v: any) => v.label === 'medium')?.path || project.coverMedia?.path;
  if (coverUrl) allImages.push(coverUrl);
  (project.gallery || []).forEach((g: any) => {
    const url = g.media?.variants?.find((v: any) => v.label === 'medium')?.path || g.media?.path;
    if (url && !allImages.includes(url)) allImages.push(url);
  });
  const images = allImages.slice(0, 5);

  const [imgIdx, setImgIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || hovered) return;
    const t = setInterval(() => setImgIdx((i) => (i + 1) % images.length), 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, hovered]);

  const companionHref = project.linkedProjectId && idToSlug[project.linkedProjectId]
    ? `/projects/${idToSlug[project.linkedProjectId]}`
    : showInteriorBtn ? '/projects#interiors' : '/projects#architecture';

  return (
    <div className="carousel-card" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link href={`/projects/${project.slug}`} style={{ display: 'block' }}>
        <div className="carousel-card-image">
          {images.length > 0 ? (
            <div
              style={{
                display: 'flex',
                width: `${images.length * 100}%`,
                height: '100%',
                transform: `translateX(-${imgIdx * (100 / images.length)}%)`,
                transition: 'transform 0.5s ease',
              }}
            >
              {images.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt={project.title} style={{ width: `${100 / images.length}%`, height: '100%', objectFit: 'cover' }} />
              ))}
            </div>
          ) : (
            <div className="carousel-card-placeholder" />
          )}
        </div>
      </Link>
      <div className="carousel-card-content">
        {project.subCategory && <div className="carousel-card-badge">{project.subCategory.toUpperCase()}</div>}
        <div className="carousel-card-name">{project.title}</div>
        {(project.clientName || project.location) && (
          <div className="carousel-card-meta">{[project.clientName, project.location].filter(Boolean).join(' · ')}</div>
        )}
        {project.shortDescription && <p className="carousel-card-desc">{project.shortDescription}</p>}
        <Link href={`/projects/${project.slug}`} className="carousel-card-explore">EXPLORE PROJECT</Link>
        {showInteriorBtn && project.hasInteriors && (
          <Link href={companionHref} className="carousel-card-companion">EXPLORE INTERIORS →</Link>
        )}
        {showArchBtn && project.hasArchitecture && (
          <Link href={companionHref} className="carousel-card-companion">EXPLORE ARCHITECTURE →</Link>
        )}
      </div>
    </div>
  );
}
