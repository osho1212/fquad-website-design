"use client";

import React from "react";
import { withDefaults } from "@/lib/cms/schema";
import { InView } from "@/components/motion/InView";
import { ScrollWords } from "@/components/motion/Reveal";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";

/**
 * Background layers sit at negative depth (slower than the page) and the
 * foreground accents at positive depth, so scrolling pulls them past each
 * other. Opacity stays low — this is atmosphere behind readable copy.
 */
const STUDIO_ART: ParallaxItem[] = [
  { art: "plan", x: "-5%", y: "4%", w: 560, depth: -0.35, rotate: -5, opacity: 0.1 },
  { art: "floorlamp", x: "92%", y: "3%", w: 100, depth: 0.7, opacity: 0.2, desktopOnly: true },
  { art: "chair", x: "44%", y: "62%", w: 96, depth: 0.45, rotate: 6, spin: 10, opacity: 0.14, desktopOnly: true },
  { art: "dimension", x: "4%", y: "82%", w: 260, depth: 0.35, opacity: 0.22, desktopOnly: true },
  { art: "cross", x: "36%", y: "8%", w: 34, depth: 0.9, spin: 90, opacity: 0.3 },
  { art: "cross", x: "52%", y: "92%", w: 28, depth: 1, spin: -90, opacity: 0.28 },
];

export function StudioSection({ content }: { content?: Record<string, any> }) {
  const c = withDefaults("home", "studio", content);
  const columns: string[] = c.columns ?? [];

  return (
    <section
      id="studio"
      className="relative overflow-hidden pt-28 sm:pt-40 pb-12 sm:pb-16 px-6 sm:px-11 border-t border-white/15 bg-transparent"
    >
      <ParallaxField items={STUDIO_ART} />

      {/* The statement and its supporting columns. */}
      <InView className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-x-12 gap-y-14 items-center max-w-[1760px] mx-auto">
        <div className="xl:col-span-9 2xl:col-span-8">
          <ScrollWords
            as="p"
            text={c.lead}
            className="font-display m-0 font-light text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] 2xl:text-5xl leading-[1.22] tracking-tight text-white"
          />

          {columns.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 sm:gap-10 mt-12">
              {columns.map((para, i) => (
                <p
                  key={i}
                  className="fq-fade m-0 text-sm sm:text-base leading-[1.8] text-white/75"
                  style={{ ["--i" as string]: i + 2 }}
                >
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>
      </InView>
    </section>
  );
}
