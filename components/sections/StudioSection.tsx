"use client";

import React from "react";
import { withDefaults } from "@/lib/cms/schema";

export function StudioSection({ content }: { content?: Record<string, any> }) {
  const c = withDefaults("home", "studio", content);
  const columns: string[] = c.columns ?? [];

  return (
    <section
      id="studio"
      className="relative overflow-hidden py-32 px-6 sm:px-11 border-t border-white/15 bg-transparent"
    >
      {/* Content */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[0.4fr_1fr] gap-11 max-w-7xl mx-auto">
        <div className="text-[10px] tracking-[0.24em] text-white/60 uppercase">
          {c.eyebrow}
        </div>

        <div>
          <p className="font-display m-0 font-light text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-[1.3] tracking-tight max-w-[32ch] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
            {c.lead}
          </p>

          {columns.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 sm:gap-10 mt-10 max-w-[900px]">
              {columns.map((para, i) => (
                <p
                  key={i}
                  className="m-0 text-xs sm:text-sm leading-[1.8] text-white/75 drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]"
                >
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
