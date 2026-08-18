'use client';

import { useEffect, useRef, useState } from 'react';
import ImageLightbox from './ImageLightbox';

interface GalleryItem {
  media: any;
  areaLabel?: string | null;
}

export default function ProjectGallery({ gallery }: { gallery: GalleryItem[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  function urlFor(media: any): string | null {
    return media?.variants?.find((v: any) => v.label === 'full')?.path || media?.path || null;
  }

  const items = gallery
    .map((g: any) => ({ url: urlFor(g.media), areaLabel: g.areaLabel || undefined }))
    .filter((g): g is { url: string; areaLabel: string | undefined } => !!g.url);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('gallery-item-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [items.length]);

  if (items.length === 0) return null;

  const [first, ...rest] = items;

  return (
    <>
      <div
        ref={(el) => { itemRefs.current[0] = el; }}
        className="project-gallery-item project-gallery-hero"
        onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={first.url} alt="" />
        {first.areaLabel && <div className="project-gallery-label">{first.areaLabel}</div>}
      </div>
      {rest.length > 0 && (
        <div className="project-gallery-columns">
          {rest.map((item, i) => (
            <div
              key={i + 1}
              ref={(el) => { itemRefs.current[i + 1] = el; }}
              className="project-gallery-item"
              onClick={() => { setLightboxIndex(i + 1); setLightboxOpen(true); }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" />
              {item.areaLabel && <div className="project-gallery-label">{item.areaLabel}</div>}
            </div>
          ))}
        </div>
      )}
      {lightboxOpen && (
        <ImageLightbox
          images={items.map((g) => ({ url: g.url }))}
          initial={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
