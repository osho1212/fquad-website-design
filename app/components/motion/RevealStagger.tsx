'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { REVEAL_VARIANTS, DEFAULT_VIEWPORT, DEFAULT_STAGGER_DELAY, MAX_STAGGER_SPREAD } from './variants';

interface RevealStaggerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  staggerDelay?: number;
  delayChildren?: number;
  amount?: number;
  once?: boolean;
}

export function RevealStagger({
  children,
  className,
  style,
  staggerDelay = DEFAULT_STAGGER_DELAY,
  delayChildren = 0,
  amount = DEFAULT_VIEWPORT.amount,
  once = DEFAULT_VIEWPORT.once,
}: RevealStaggerProps) {
  const childCount = React.Children.count(children);
  const effectiveStagger = Math.min(staggerDelay, MAX_STAGGER_SPREAD / Math.max(childCount, 1));

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: effectiveStagger, delayChildren } },
  };

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

interface RevealStaggerItemProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function RevealStaggerItem({ children, className, style }: RevealStaggerItemProps) {
  return (
    <motion.div className={className} style={style} variants={REVEAL_VARIANTS}>
      {children}
    </motion.div>
  );
}
