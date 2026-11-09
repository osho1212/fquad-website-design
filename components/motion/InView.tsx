"use client";

import React, { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Flips `data-in="true"` on its element the first time it scrolls into view.
 * Descendants with `.fq-fade` / `.fq-rule` (see globals.css) react to it with
 * a staggered CSS transition, so a whole section can reveal from one observer.
 */
export function InView({
  as: Tag = "div",
  className = "",
  threshold = 0.15,
  children,
  ...rest
}: {
  as?: "div" | "section" | "header" | "ul" | "li" | "article" | "footer";
  className?: string;
  threshold?: number;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      el.dataset.in = "true";
      return;
    }
    // A fixed 15% threshold can never be met by an element taller than ~6.5
    // viewports (a long list on a phone), which would leave it hidden for
    // good. Cap it so the visible slice needed is never more than half a screen.
    const ratio = Math.max(0.01, Math.min(threshold, (window.innerHeight * 0.5) / Math.max(1, el.offsetHeight)));
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.in = "true";
          io.disconnect();
        }
      },
      { threshold: ratio, rootMargin: "0px 0px -5% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag ref={ref as React.Ref<any>} className={className} {...rest}>
      {children}
    </Tag>
  );
}
