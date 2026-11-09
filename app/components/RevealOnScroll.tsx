'use client';

import { InView } from '@/components/motion/InView';

/**
 * Fade-and-rise on first view. Kept as a thin wrapper so existing pages don't
 * change, but it now runs on the site's shared reveal (IntersectionObserver +
 * CSS transition, see InView and .fq-fade) instead of a separate framer-motion
 * path with its own easing — one motion language, no extra JS on these pages.
 */
export default function RevealOnScroll({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  /** Seconds. */
  delay?: number;
  className?: string;
}) {
  return (
    <InView className={className}>
      <div className="fq-fade" style={{ transitionDelay: `${Math.round(delay * 1000)}ms` }}>
        {children}
      </div>
    </InView>
  );
}
