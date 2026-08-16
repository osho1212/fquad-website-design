import type { Variants, Transition } from 'framer-motion';

export const REVEAL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const DEFAULT_VIEWPORT = { once: true, amount: 0.15 } as const;

export const DEFAULT_STAGGER_DELAY = 0.08;
export const MAX_STAGGER_SPREAD = 0.6;

export const BUTTON_HOVER = { scale: 1.04 };
export const BUTTON_TAP = { scale: 0.97 };
export const BUTTON_SPRING: Transition = { type: 'spring', stiffness: 400, damping: 17 };
