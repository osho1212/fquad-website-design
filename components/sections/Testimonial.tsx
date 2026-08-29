"use client";

import React from "react";
import { withDefaults } from "@/lib/cms/schema";

export function Testimonial({ content }: { content?: Record<string, any> }) {
  const c = withDefaults("home", "testimonial", content);

  if (!c.quote) return null;

  return (
    <section className="px-6 sm:px-11 pb-32 grid grid-cols-1 md:grid-cols-[0.4fr_1fr] gap-8 md:gap-11 bg-transparent">
      <div className="text-[10px] tracking-[0.24em] text-white/45 uppercase">
        {c.eyebrow}
      </div>
      <div>
        <blockquote className="font-display m-0 font-light text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-[1.24] tracking-tight max-w-[26ch] text-white">
          &ldquo;{c.quote}&rdquo;
        </blockquote>
        <div className="mt-7 text-[9.5px] tracking-[0.2em] text-[#c0c0c0] uppercase">
          {c.attribution}
        </div>
      </div>
    </section>
  );
}
