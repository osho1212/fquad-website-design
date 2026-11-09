"use client";

import React, { useEffect, useRef } from "react";
import { withDefaults } from "@/lib/cms/schema";
import { clamp, damp, onFrame, prefersReducedMotion } from "@/lib/motion";

/** Idle drift in px/s. */
const BASE_SPEED = 55;

export function AwardsSection({ content }: { content?: Record<string, any> }) {
  const c = withDefaults("home", "awards_marquee", content);
  const awards: string[] = c.items ?? [];

  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);

  // The band drifts on its own and is shoved along by scrolling: faster in
  // the direction you scroll, reversing when you scroll back up, and skewed
  // slightly by the velocity. All transform, written on the shared frame loop
  // while the strip is on screen.
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const band = bandRef.current;
    if (!section || !track || !band || prefersReducedMotion()) return;

    let x = 0;
    let dir = -1; // leftward by default
    let boost = 0;
    let skew = 0;
    let stop: (() => void) | null = null;

    const loop = (_: number, dt: number) => {
      const v = window.__fqLenis?.velocity ?? 0; // px/frame-ish, signed
      const speedUp = clamp(Math.abs(v) / 40, 0, 5);
      if (Math.abs(v) > 0.6) dir = v > 0 ? -1 : 1;
      boost = damp(boost, speedUp, 5, dt);
      skew = damp(skew, clamp(-v * 0.18, -7, 7), 6, dt);

      const width = band.offsetWidth;
      if (width === 0) return;
      x += dir * (BASE_SPEED * (1 + boost * 3.2)) * dt;
      if (x <= -width) x += width;
      if (x > 0) x -= width;
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !stop) stop = onFrame(loop);
        else if (!entry.isIntersecting && stop) {
          stop();
          stop = null;
        }
      },
      { rootMargin: "20% 0px" }
    );
    io.observe(section);
    return () => {
      io.disconnect();
      stop?.();
    };
  }, [awards.length]);

  if (awards.length === 0) return null;

  const band = (keyPrefix: string, hidden?: boolean, ref?: React.Ref<HTMLDivElement>) => (
    <div
      ref={ref}
      className="flex items-center gap-12 pr-12 shrink-0"
      aria-hidden={hidden || undefined}
    >
      {awards.map((award, i) => (
        <React.Fragment key={`${keyPrefix}-${i}`}>
          {/* Alternate solid and outlined type so the strip has rhythm */}
          <span className={i % 2 ? "fq-outline" : undefined}>{award}</span>
          <span className="text-[#c0c0c0]">{c.separator}</span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <section id="awards" className="pb-28 bg-transparent">
      <div ref={sectionRef} className="overflow-hidden border-t border-b border-white/15 py-6">
        {/* Falls back to the CSS marquee until JS takes over, and for
            reduced-motion visitors it simply sits still. */}
        <div
          ref={trackRef}
          className="flex w-max font-medium uppercase text-lg sm:text-2xl lg:text-4xl tracking-tight whitespace-nowrap text-white will-change-transform"
        >
          {band("a", false, bandRef)}
          {band("b", true)}
          {band("c", true)}
        </div>
      </div>
    </section>
  );
}
