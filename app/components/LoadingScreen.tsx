'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem('fq_loaded')) return;
    setVisible(true);
    const start = Date.now();
    const tick = setInterval(() => {
      const p = Math.min((Date.now() - start) / 1800, 1);
      setProgress(p);
      if (p >= 1) {
        clearInterval(tick);
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem('fq_loaded', '1');
        }, 400);
      }
    }, 16);
    return () => clearInterval(tick);
  }, []);

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0F0F0F', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.4s ease', opacity: progress >= 1 ? 0 : 1 }}>
      <div style={{ fontSize: 'clamp(32px,6vw,52px)', color: '#FAFAF8', letterSpacing: '0.2em', marginBottom: 32 }}>F.QUAD</div>
      <div style={{ width: 200, height: 1, background: 'rgba(248,248,246,0.1)', borderRadius: 1, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ height: '100%', background: '#FAFAF8', width: `${progress * 100}%`, transition: 'width 0.05s linear', borderRadius: 1 }} />
      </div>
      <div style={{ fontSize: 11, color: '#6B6560', letterSpacing: '0.4em' }}>STUDIO</div>
    </div>
  );
}
