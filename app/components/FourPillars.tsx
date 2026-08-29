'use client';

import { useState, useRef, useEffect } from 'react';

export interface Pillar {
  num: string;
  title: string;
  desc: string;
}

export default function FourPillars({ pillars = [] }: { pillars?: Pillar[] }) {
  const [flipped, setFlipped] = useState<number[]>([]);
  const [aligned, setAligned] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setAligned(true);
      },
      { threshold: 0.2 }
    );
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleInteraction = (index: number) => {
    setFlipped((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Cards fan out from the centre before snapping into a row. Spacing is
  // derived from the count so the effect survives adding or removing a pillar.
  const getInitialTranslate = (i: number) => {
    if (aligned) return 'translateX(0)';
    const spread = 87;
    const offset = (i - (pillars.length - 1) / 2) * spread;
    return `translateX(${offset}%)`;
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        gap: 'clamp(12px,2vw,24px)',
        justifyContent: 'center',
        flexWrap: 'wrap',
        perspective: 1200,
      }}
    >
      {pillars.map((pillar, i) => {
        const isFlipped = flipped.includes(i);
        return (
          <div
            key={i}
            onMouseEnter={() => !isMobile && handleInteraction(i)}
            onMouseLeave={() => !isMobile && handleInteraction(i)}
            onClick={() => isMobile && handleInteraction(i)}
            style={{
              width: 'clamp(200px,22vw,260px)',
              height: 360,
              cursor: 'pointer',
              transformStyle: 'preserve-3d',
              transform: `${getInitialTranslate(i)} ${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}`,
              transition: aligned
                ? `transform 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.08}s`
                : `transform 0.9s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s`,
              position: 'relative',
              userSelect: 'none',
            }}
          >
            {/* FRONT */}
            <div style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: '#1A1A1A',
              border: '0.5px solid rgba(248,248,246,0.08)',
              borderRadius: 4,
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 130, color: 'rgba(248,248,246,0.04)', pointerEvents: 'none' }}>F</div>
              <div style={{ position: 'relative', fontSize: 13, color: '#6B6560', letterSpacing: '0.2em' }}>{pillar.num}</div>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', fontSize: 28, fontWeight: 500, color: '#FAFAF8', letterSpacing: '0.02em', fontFamily: "'Good Times', sans-serif" }}>{pillar.title}</div>
              <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: '#6B6560', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                {isMobile ? 'tap to reveal' : 'hover to reveal'}
              </div>
            </div>
            {/* BACK */}
            <div style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: 4,
              background: '#FAFAF8',
              padding: '32px 28px',
            }}>
              <div style={{ fontSize: 12, color: '#9C9488', letterSpacing: '0.2em' }}>{pillar.num}</div>
              <div style={{ fontSize: 13, color: '#9C9488', letterSpacing: '0.14em', marginTop: 10, fontWeight: 600 }}>{pillar.title}</div>
              <div style={{ borderTop: '0.5px solid #E2DDD8', margin: '18px 0' }} />
              <div style={{ fontSize: 15, color: '#2C2C2C', lineHeight: 1.75 }}>{pillar.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
