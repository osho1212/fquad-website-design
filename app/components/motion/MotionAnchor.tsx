'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { BUTTON_HOVER, BUTTON_TAP, BUTTON_SPRING } from './variants';

export function MotionAnchor(props: HTMLMotionProps<'a'>) {
  return (
    <motion.a
      whileHover={BUTTON_HOVER}
      whileTap={BUTTON_TAP}
      transition={BUTTON_SPRING}
      {...props}
    />
  );
}
