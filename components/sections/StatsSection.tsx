"use client";

import React, { useEffect, useState, useRef } from "react";
import { withDefaults } from "@/lib/cms/schema";
import { InView } from "@/components/motion/InView";
import { easeOutCubic, prefersReducedMotion } from "@/lib/motion";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

function StatCard({ item, index }: { item: StatItem; index: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const target = Number(item.value) || 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      setCount(target);
      return;
    }

    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          // Starts a beat after the card fades in, so the digits are
          // already readable when they begin to climb.
          const dur = 1800;
          const t0 = performance.now() + 250 + index * 120;
          const step = (t: number) => {
            const p = Math.min(1, Math.max(0, (t - t0) / dur));
            setCount(Math.round(target * easeOutCubic(p)));
            if (p < 1) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, index]);

  return (
    <div
      ref={ref}
      className="fq-fade relative py-14 first:pl-0 pl-6 sm:pl-9 first:border-l-0 border-l border-white/15"
      style={{ ["--i" as string]: index }}
    >
      <div className="font-semibold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight uppercase leading-none text-white tabular-nums">
        {count}
        <span className="font-light text-white/60">{item.suffix}</span>
      </div>
      <div className="mt-3 text-[11px] sm:text-[11px] tracking-[0.24em] text-white/50 uppercase font-medium">
        {item.label}
      </div>
    </div>
  );
}

export function StatsSection({ content }: { content?: Record<string, any> }) {
  const c = withDefaults("home", "stats", content);
  const items: StatItem[] = c.items ?? [];

  if (items.length === 0) return null;

  return (
    <InView as="section" className="px-6 sm:px-11 bg-black">
      <div className="relative grid grid-cols-1 sm:grid-cols-3 border-b border-white/15">
        {/* A rule that draws across the top as the numbers arrive */}
        <span
          aria-hidden="true"
          className="fq-rule absolute top-0 left-0 right-0 h-px bg-white/30"
        />
        {items.map((item, idx) => (
          <StatCard key={idx} item={item} index={idx} />
        ))}
      </div>
    </InView>
  );
}
