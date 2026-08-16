"use client";

import React, { useEffect, useState, useRef } from "react";

interface StatItem {
  target: number;
  suffix: string;
  label: string;
  isSpecial?: boolean;
}

const statsData: StatItem[] = [
  { target: 20, suffix: "+", label: "YEARS" },
  { target: 500, suffix: "+", label: "PROJECTS", isSpecial: true },
  { target: 22, suffix: "+", label: "AWARDS" },
];

function StatCard({ item }: { item: StatItem }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const dur = 1400;
          const t0 = performance.now();
          const step = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            const e = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(item.target * e));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [item.target]);

  return (
    <div ref={ref} className="py-14 first:pl-0 pl-6 sm:pl-9 first:border-l-0 border-l border-white/15">
      <div className="font-semibold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight uppercase leading-none text-white">
        {count}
        <span className="font-light text-white/60">{item.suffix}</span>
      </div>
      <div className="mt-3 text-[9px] sm:text-[10px] tracking-[0.24em] text-white/50 uppercase font-medium">
        {item.label}
      </div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="px-6 sm:px-11 bg-black">
      <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-white/15">
        {statsData.map((item, idx) => (
          <StatCard key={idx} item={item} />
        ))}
      </div>
    </section>
  );
}
