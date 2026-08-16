'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BUTTON_HOVER, BUTTON_TAP, BUTTON_SPRING } from './variants';

interface MotionLinkWrapProps {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function MotionLinkWrap({ href, className, style, children }: MotionLinkWrapProps) {
  return (
    <motion.span
      style={{ display: 'inline-flex' }}
      whileHover={BUTTON_HOVER}
      whileTap={BUTTON_TAP}
      transition={BUTTON_SPRING}
    >
      <Link href={href} className={className} style={style}>
        {children}
      </Link>
    </motion.span>
  );
}
