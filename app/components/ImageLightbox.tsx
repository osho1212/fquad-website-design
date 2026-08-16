'use client';

import { useEffect, useState } from 'react';

interface Props {
  images: { url: string; areaLabel?: string }[];
  initial: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, initial, onClose }: Props) {
  const [idx, setIdx] = useState(initial);
  const prev = () => setIdx((i) => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setIdx((i) => (i < images.length - 1 ? i + 1 : 0));

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let touchX = 0;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      onTouchStart={(e) => { touchX = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const d = e.changedTouches[0].clientX - touchX;
        if (Math.abs(d) > 50) { d < 0 ? next() : prev(); }
      }}
    >
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#FAFAF8', fontSize: 24, cursor: 'pointer', zIndex: 1001 }}>✕</button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[idx].url} alt="" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '85vh', maxWidth: '90vw', objectFit: 'contain', display: 'block' }} />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(248,248,246,0.1)', border: '0.5px solid rgba(248,248,246,0.2)', color: '#FAFAF8', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(248,248,246,0.1)', border: '0.5px solid rgba(248,248,246,0.2)', color: '#FAFAF8', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}
          >
            ›
          </button>
          <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
            {images.map((_, i) => (
              <div
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                style={{ width: i === idx ? 20 : 6, height: 2, background: i === idx ? '#FAFAF8' : 'rgba(248,248,246,0.3)', borderRadius: 1, cursor: 'pointer', transition: 'all 0.3s' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
