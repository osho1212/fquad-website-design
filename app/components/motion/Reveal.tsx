'use client';

import { motion } from 'framer-motion';
import { REVEAL_VARIANTS, DEFAULT_VIEWPORT } from './variants';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  amount?: number;
  once?: boolean;
}

export function Reveal({ children, className, style, amount = DEFAULT_VIEWPORT.amount, once = DEFAULT_VIEWPORT.once }: RevealProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={REVEAL_VARIANTS}
    >
      {children}
    </motion.div>
  );
}
