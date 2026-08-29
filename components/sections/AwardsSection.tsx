"use client";

import React from "react";
import { withDefaults } from "@/lib/cms/schema";

export function AwardsSection({ content }: { content?: Record<string, any> }) {
  const c = withDefaults("home", "awards_marquee", content);
  const awards: string[] = c.items ?? [];

  if (awards.length === 0) return null;

  const band = (keyPrefix: string, hidden?: boolean) => (
    <div className="flex items-center gap-12 pr-12" aria-hidden={hidden || undefined}>
      {awards.map((award, i) => (
        <React.Fragment key={`${keyPrefix}-${i}`}>
          <span>{award}</span>
          <span className="text-[#c0c0c0]">{c.separator}</span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <section id="awards" className="pb-28 bg-transparent">
      <div className="overflow-hidden border-t border-b border-white/15 py-5">
        <div className="animate-fq-marquee font-medium uppercase text-sm sm:text-base lg:text-lg tracking-tight whitespace-nowrap text-white">
          {band("a")}
          {band("dup", true)}
        </div>
      </div>
    </section>
  );
}
