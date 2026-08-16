'use client';

import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';

const HERO_CONTAINER_VARIANTS: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const HERO_ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
};

interface Slide {
  id: string;
  media: any;
}
interface Props {
  slides: Slide[];
  eyebrow: string;
  title: string;
  subtitle: string;
}

export default function HeroSlideshow({ slides, eyebrow, title, subtitle }: Props) {
  const [cur, setCur] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setCur((i) => (i + 1) % slides.length);
    }, 2500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {slides.length === 0 ? (
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(125deg,#1C1C1C 0,#1C1C1C 1px,transparent 1px,transparent 18px),#141414' }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', width: `${slides.length * 100}%`, transform: `translateX(-${cur * (100 / slides.length)}%)`, transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)' }}>
          {slides.map((slide) => {
            const url = slide.media?.variants?.find((v: any) => v.label === 'full')?.path || slide.media?.path;
            const isVideo = slide.media?.type === 'VIDEO';
            return (
              <div key={slide.id} style={{ width: `${100 / slides.length}%`, height: '100%', flexShrink: 0 }}>
                {url && isVideo ? (
                  <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                    <source src={url} type="video/mp4" />
                  </video>
                ) : url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(125deg,#1C1C1C 0,#1C1C1C 1px,transparent 1px,transparent 18px),#141414' }} />
                )}
              </div>
            );
          })}
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(13,13,13,0.55) 0%,rgba(13,13,13,0.3) 40%,rgba(13,13,13,0.65) 100%)' }} />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={HERO_CONTAINER_VARIANTS}
        style={{ position: 'relative', zIndex: 1, padding: '0 clamp(20px,4vw,80px)', maxWidth: 900 }}
      >
        <motion.div variants={HERO_ITEM_VARIANTS} style={{ fontSize: 11, letterSpacing: '0.24em', color: 'white', marginBottom: 24, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
          ARCHITECTURE · INTERIORS · HYDERABAD
        </motion.div>
        <motion.h1 variants={HERO_ITEM_VARIANTS} style={{ fontFamily: "'Good Times', sans-serif", fontSize: 'clamp(32px,6vw,64px)', fontWeight: 400, color: '#FAFAF8', marginBottom: 16, textShadow: '0 0 40px rgba(0,0,0,0.9),0 2px 4px rgba(0,0,0,0.9)', lineHeight: 1.15 }}>{title}</motion.h1>
        <motion.div variants={HERO_ITEM_VARIANTS} style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'white', marginBottom: 32, textShadow: '0 2px 12px rgba(0,0,0,0.8)', maxWidth: 600, margin: '0 auto 32px' }}>
          Considered design for homes, workplaces, and hospitality.
        </motion.div>
        <motion.div variants={HERO_ITEM_VARIANTS} style={{ width: 80, height: 1, background: '#FFFFFF', margin: '0 auto 32px' }} />
        <motion.div variants={HERO_ITEM_VARIANTS} style={{ fontSize: 11, letterSpacing: '0.24em', color: 'rgba(248,248,246,0.5)' }}>SCROLL</motion.div>
      </motion.div>
      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 2 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCur(i)}
              style={{ width: i === cur ? 24 : 8, height: 2, background: i === cur ? '#FAFAF8' : 'rgba(248,248,246,0.3)', border: 'none', borderRadius: 1, cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
