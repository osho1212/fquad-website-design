"use client";

import React from "react";
import { withDefaults } from "@/lib/cms/schema";
import { InView } from "@/components/motion/InView";
import { ScrollWords } from "@/components/motion/Reveal";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";

const QUOTE_ART: ParallaxItem[] = [
  { art: "mirror", x: "80%", y: "-6%", w: 170, depth: -0.3, opacity: 0.1, desktopOnly: true },
  { art: "vase", x: "70%", y: "34%", w: 64, depth: 0.7, opacity: 0.16, desktopOnly: true },
  { art: "cross", x: "50%", y: "86%", w: 30, depth: 0.9, spin: 90, opacity: 0.28 },
];

export function Testimonial({ content }: { content?: Record<string, any> }) {
  const c = withDefaults("home", "testimonial", content);

  if (!c.quote) return null;

  return (
    <section className="relative overflow-hidden px-6 sm:px-11 pb-32 pt-8 bg-transparent">
      <ParallaxField items={QUOTE_ART} />

      <InView className="relative z-10 grid grid-cols-1 md:grid-cols-[0.4fr_1fr] gap-8 md:gap-11">
        <div className="fq-fade text-[11px] tracking-[0.24em] text-white/45 uppercase">
          {c.eyebrow}
        </div>
        <div className="relative">
          {/* oversized opening mark, set behind the type */}
          <span
            aria-hidden="true"
            className="fq-outline absolute -top-14 -left-2 sm:-top-20 sm:-left-8 font-display text-[7rem] sm:text-[11rem] leading-none select-none pointer-events-none"
          >
            &ldquo;
          </span>
          <ScrollWords
            as="blockquote"
            text={`“${c.quote}”`}
            className="font-display relative m-0 font-light text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-[1.24] tracking-tight max-w-[26ch] text-white"
          />
          <div
            className="fq-fade mt-7 text-[11px] tracking-[0.2em] text-[#c0c0c0] uppercase"
            style={{ ["--i" as string]: 3 }}
          >
            {c.attribution}
          </div>
        </div>
      </InView>
    </section>
  );
}
