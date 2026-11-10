"use client";

import React from "react";
import { withDefaults } from "@/lib/cms/schema";
import { InView } from "@/components/motion/InView";
import { ScrollWords } from "@/components/motion/Reveal";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";

const QUOTE_ART: ParallaxItem[] = [
  // Kept to the right margin: drawn behind the quote they crossed its words.
  { art: "mirror", x: "88%", y: "-4%", w: 150, depth: -0.3, opacity: 0.1, desktopOnly: true },
  { art: "vase", x: "91%", y: "58%", w: 56, depth: 0.7, opacity: 0.14, desktopOnly: true },
  { art: "cross", x: "50%", y: "86%", w: 30, depth: 0.9, spin: 90, opacity: 0.28 },
];

export function Testimonial({ content }: { content?: Record<string, any> }) {
  const c = withDefaults("home", "testimonial", content);

  if (!c.quote) return null;

  // The section's top padding is headroom for the oversized quote mark: the
  // section clips its overflow (to contain the parallax art), so the old pt-8
  // cropped the mark's top off. Good Times' slab-sided quote hid that — it
  // just looked shorter — but any round-topped glyph shows it.
  return (
    <section className="relative overflow-hidden px-6 sm:px-11 pb-32 pt-20 sm:pt-28 bg-transparent">
      <ParallaxField items={QUOTE_ART} />

      <InView className="relative z-10 grid grid-cols-1 md:grid-cols-[0.4fr_1fr] gap-5 md:gap-11">
        <div className="fq-fade text-[11px] tracking-[0.24em] text-white/70 uppercase">
          {c.eyebrow}
        </div>
        <div className="relative">
          {/* The only quotation mark on the testimonial: oversized, outlined
              and set behind the type. The quote text itself is rendered bare,
              so editors must not type their own marks.
              On phones the grid is one column, so an absolutely placed mark
              landed on the eyebrow above it; there it sits in the flow, in a
              short box (the glyph's ink is only the top of its em box). */}
          <span
            aria-hidden="true"
            className="fq-outline fq-quote-mark block h-16 -ml-1 text-[7rem] leading-none md:absolute md:h-auto md:ml-0 md:-top-[6.75rem] md:-left-10 md:text-[16rem] select-none pointer-events-none"
          >
            &ldquo;
          </span>
          <ScrollWords
            as="blockquote"
            text={c.quote}
            className="font-display relative m-0 font-light text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-[1.24] tracking-tight max-w-[26ch] text-white"
          />
          <div
            className="fq-fade mt-7 text-[11px] tracking-[0.2em] text-white/70 uppercase"
            style={{ ["--i" as string]: 3 }}
          >
            {c.attribution}
          </div>
        </div>
      </InView>
    </section>
  );
}
