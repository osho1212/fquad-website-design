'use client';

import { motion, type Variants } from 'framer-motion';
import { REVEAL_VARIANTS } from './variants';
import WordReveal from '../WordReveal';

interface HeroContentProps {
  hero: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
  };
}

const heroContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

export function HeroContent({ hero }: HeroContentProps) {
  return (
    <motion.div
      className="hero-content"
      initial="hidden"
      animate="visible"
      variants={heroContainerVariants}
    >
      <motion.div className="hero-eyebrow" variants={REVEAL_VARIANTS}>{hero.eyebrow}</motion.div>
      <h1><WordReveal text={hero.title || ''} /></h1>
      <motion.p variants={REVEAL_VARIANTS}>{hero.subtitle}</motion.p>
      <motion.div className="hero-line" variants={REVEAL_VARIANTS} />
      <motion.div className="scroll-indicator" variants={REVEAL_VARIANTS}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="scroll-chevron">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
