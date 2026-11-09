"use client";

import React, { useEffect, useRef, useState } from "react";
import { easeOutCubic, prefersReducedMotion } from "@/lib/motion";

export interface StatItem {
  number: number | string;
  suffix?: string;
  label: string;
}

/**
 * One figure. It renders at its real value, so server HTML, no-JS and
 * reduced-motion visitors all read the truth; where motion is welcome it drops
 * to zero and climbs back once it scrolls into view. The `.fq-fade` reveal
 * comes from the InView that wraps the row on the page.
 */
function Stat({ item, index }: { item: StatItem; index: number }) {
  const target = Number(item.number) || 0;
  const suffix = item.suffix ?? "";
  const [count, setCount] = useState(target);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !("IntersectionObserver" in window)) return;

    // The card is still opacity:0 here, so the reset to zero is never seen.
    setCount(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const dur = 1800;
        // A beat after the card fades in, staggered along the row.
        const t0 = performance.now() + 250 + index * 120;
        const step = (t: number) => {
          const p = Math.min(1, Math.max(0, (t - t0) / dur));
          setCount(Math.round(target * easeOutCubic(p)));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, index]);

  return (
    // dt comes first in the DOM (label, then value); flex-col-reverse puts the
    // big figure above its label visually.
    <div
      ref={ref}
      className="fq-fade flex flex-col-reverse gap-3 py-9 sm:py-14 sm:px-9 sm:first:pl-0 min-w-0"
      style={{ ["--i" as string]: index }}
    >
      <dt className="text-[11px] sm:text-xs tracking-[0.22em] text-white/60 uppercase font-medium">
        {item.label}
      </dt>
      <dd className="m-0 font-semibold text-4xl md:text-5xl lg:text-6xl tracking-tight uppercase leading-none text-white tabular-nums">
        {/* The animated digits are hidden from assistive tech; the true value is read instead. */}
        <span aria-hidden="true">
          {count}
          <span className="font-light text-white/60">{suffix}</span>
        </span>
        <span className="sr-only">
          {target}
          {suffix}
        </span>
      </dd>
    </div>
  );
}

export function Stats({ items }: { items: StatItem[] }) {
  if (items.length === 0) return null;

  return (
    <dl className="m-0 grid grid-cols-1 sm:grid-flow-col sm:auto-cols-fr divide-y sm:divide-y-0 sm:divide-x divide-white/15">
      {items.map((item, i) => (
        <Stat key={i} item={item} index={i} />
      ))}
    </dl>
  );
}
