"use client";

import React, { useRef } from "react";
import { withDefaults } from "@/lib/cms/schema";
import { InView } from "@/components/motion/InView";
import { ScrollWords } from "@/components/motion/Reveal";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";
import { RoomScene } from "@/components/three/RoomScene";

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
  // Live clock for the salon's noon-to-night light; written from the scene's frame loop.
  const clockRef = useRef<HTMLSpanElement>(null);
  const columns: string[] = c.columns ?? [];

  return (
    <section
      id="studio"
      className="relative overflow-hidden py-28 sm:py-40 px-6 sm:px-11 border-t border-white/15 bg-transparent"
    >
      <ParallaxField items={STUDIO_ART} />

      <InView className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-12 max-w-[1500px] mx-auto">
        <div className="fq-fade md:col-span-3 xl:col-span-2 flex items-start gap-3 text-[11px] tracking-[0.24em] text-white/60 uppercase">
          <span className="mt-[3px] w-1.5 h-1.5 bg-accent shrink-0" />
          {c.eyebrow}
        </div>

        <div className="md:col-span-9 xl:col-span-6">
          <ScrollWords
            as="p"
            text={c.lead}
            className="font-display m-0 font-light text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-[1.32] tracking-tight max-w-[34ch] text-white"
          />

          {columns.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 sm:gap-10 mt-12 max-w-[900px]">
              {columns.map((para, i) => (
                <p
                  key={i}
                  className="fq-fade m-0 text-xs sm:text-sm leading-[1.85] text-white/75"
                  style={{ ["--i" as string]: i + 2 }}
                >
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* A drawing-sheet viewport holding the 3D salon: as the section scrolls
            past, the light moves from noon sun to golden hour to lamplit night. */}
        <figure
          className="fq-fade fq-frame m-0 md:col-span-9 md:col-start-4 xl:col-span-4 xl:col-start-9 xl:-mt-8"
          style={{ ["--i" as string]: 3 }}
        >
          <RoomScene
            variant="living"
            range={[0.12, 0.82]}
            onState={({ label }) => {
              if (label && clockRef.current) clockRef.current.textContent = label;
            }}
            className="w-full aspect-[5/4] xl:aspect-square"
            label="A cut-away luxury living room — curved bouclé sofa, travertine table, brass ring chandelier, walnut reeded wall and an arched window — whose light moves from midday sun to golden hour to a lamplit evening as the page scrolls"
          />
          <span className="fq-frame-b" aria-hidden="true" />
          <figcaption className="absolute left-3 bottom-3 right-3 flex justify-between text-[11px] tracking-[0.22em] uppercase text-white/50 pointer-events-none">
            <span>Fig. 01 — The Salon</span>
            <span>
              Scroll · <span ref={clockRef} className="tabular-nums">12:00</span>
            </span>
          </figcaption>
        </figure>
      </InView>
    </section>
  );
}
