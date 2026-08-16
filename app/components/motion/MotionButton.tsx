'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { BUTTON_HOVER, BUTTON_TAP, BUTTON_SPRING } from './variants';

export function MotionButton(props: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      whileHover={BUTTON_HOVER}
      whileTap={BUTTON_TAP}
      transition={BUTTON_SPRING}
      {...props}
    />
  );
}
