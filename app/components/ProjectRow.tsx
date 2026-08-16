'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface Props {
  project: any;
  index: number;
  idToSlug: Record<string, string>;
}

export default function ProjectRow({ project, index, idToSlug }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const isEven = index % 2 === 0;

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (curtainRef.current) curtainRef.current.style.transform = 'scaleX(0)';
            if (textRef.current) {
              textRef.current.style.opacity = '1';
              textRef.current.style.transform = 'translateY(0)';
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  const img = project.coverMedia?.variants?.find((v: any) => v.label === 'full')?.path || project.coverMedia?.path;

  const companionLabel = project.hasInteriors ? 'EXPLORE INTERIORS →' : project.hasArchitecture ? 'EXPLORE ARCHITECTURE →' : null;
  const companionHref = project.linkedProjectId && idToSlug[project.linkedProjectId]
    ? `/projects/${idToSlug[project.linkedProjectId]}`
    : project.hasInteriors ? '/projects#interiors' : '/projects#architecture';

  return (
    <div ref={rowRef} className="project-row" style={{ gridTemplateColumns: isEven ? '55% 45%' : '45% 55%' }}>
      <div className="project-row-image" style={{ order: isEven ? 1 : 2 }}>
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div
          ref={curtainRef}
          className="project-row-curtain"
          style={{ transformOrigin: isEven ? 'left' : 'right' }}
        />
      </div>
      <div className="project-row-text" style={{ order: isEven ? 2 : 1 }}>
        <div ref={textRef} className="project-row-text-inner">
          {project.subCategory && (
            <span className="project-row-badge">{project.subCategory.toUpperCase()}</span>
          )}
          <div className="project-row-name">{project.title}</div>
          {(project.clientName || project.location) && (
            <div className="project-row-meta">
              {[project.clientName, project.location].filter(Boolean).join(' · ')}
            </div>
          )}
          {project.shortDescription && (
            <p className="project-row-desc">{project.shortDescription}</p>
          )}
          <Link href={`/projects/${project.slug}`} className="project-row-explore">
            EXPLORE PROJECT
          </Link>
          {companionLabel && (
            <Link href={companionHref} className="project-row-companion">
              {companionLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
