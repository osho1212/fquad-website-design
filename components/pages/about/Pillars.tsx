"use client";

import React from "react";
import { hasFinePointer } from "@/lib/motion";

export interface Pillar {
  num: string;
  title: string;
  desc: string;
}

/**
 * One of the Four F's. The old design hid the description on the back of a
 * hover-to-flip card, which left touch, keyboard and screen-reader visitors
 * with a title and nothing else. Everything is now printed on the card; the
 * pointer only adds a soft edge-light (written to this card alone, never a
 * shared parent) and a nudge to the title.
 */
function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!hasFinePointer()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    // Per-cell right/bottom borders (rather than a gap + background trick)
    // keep the grid lines clean when the last row isn't full.
    <li
      className="fq-fade min-w-0 border-r border-b border-white/15"
      style={{ ["--i" as string]: index + 1 }}
    >
      <div
        onPointerMove={onMove}
        className="fq-spot group relative flex h-full min-h-[300px] sm:min-h-[340px] flex-col overflow-hidden bg-black/50 backdrop-blur-sm p-7 sm:p-8"
      >
        {/* The studio's initial, as a drawing-sheet outline in the corner. */}
        <span
          aria-hidden="true"
          className="fq-outline pointer-events-none select-none absolute -right-3 -top-6 font-display text-[9rem] sm:text-[11rem] leading-none transition-colors duration-500 group-hover:text-white/[0.07]"
        >
          F
        </span>

        <div className="relative text-[11px] tracking-[0.22em] text-white/60 tabular-nums">
          {pillar.num}
        </div>

        <h4 className="relative m-0 mt-auto pt-24 font-normal uppercase text-xl sm:text-2xl tracking-tight text-white transition-transform duration-500 ease-out group-hover:translate-x-1.5">
          {pillar.title}
        </h4>
        <span
          aria-hidden="true"
          className="relative mt-5 block h-px w-8 bg-white/40 transition-[width] duration-500 ease-out group-hover:w-16"
        />
        <p className="relative m-0 mt-5 text-sm leading-[1.8] text-white/75">{pillar.desc}</p>
      </div>
    </li>
  );
}

export function Pillars({ items }: { items: Pillar[] }) {
  if (items.length === 0) return null;

  return (
    // role="list": Safari/VoiceOver drops list semantics from `list-style: none`.
    <ol role="list" className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-white/15">
      {items.map((pillar, i) => (
        <PillarCard key={i} pillar={pillar} index={i} />
      ))}
    </ol>
  );
}
