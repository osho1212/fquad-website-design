import React from "react";
import { InView } from "@/components/motion/InView";
import { RevealText } from "@/components/motion/Reveal";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";
import { PrimaryAction, TextAction, type ActionSpec } from "./ui";

// Kept off the left, where the copy sits, and well under 0.2 opacity.
const BAND_ART: ParallaxItem[] = [
  { art: "pendant", x: "86%", y: "-8%", w: 64, depth: 0.5, opacity: 0.16, desktopOnly: true },
  { art: "vase", x: "74%", y: "52%", w: 54, depth: 0.8, opacity: 0.14, desktopOnly: true },
  { art: "cross", x: "5%", y: "14%", w: 28, depth: 0.9, spin: 90, opacity: 0.22 },
];

/**
 * The closing call to action at the foot of the journal, team and awards
 * pages: a headline, one honest sentence, and the two ways forward.
 */
export function ClosingBand({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  art = BAND_ART,
}: {
  eyebrow?: string;
  /** "\n" breaks the line. */
  title: string;
  body?: string;
  primary: ActionSpec;
  secondary?: ActionSpec;
  art?: ParallaxItem[];
}) {
  return (
    <section className="relative overflow-hidden px-6 sm:px-14 py-20 sm:py-28 border-t border-white/15">
      <ParallaxField items={art} range={90} />

      {/* Actions drop under the headline until xl: beside it, at 1024px, the
          headline column is too narrow for Good Times (about 0.8em per capital). */}
      <InView className="relative z-10 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] gap-10 xl:gap-16 items-end max-w-[1500px]">
        <div className="min-w-0">
          {eyebrow && (
            <p className="fq-fade m-0 flex items-center gap-3 text-[11px] tracking-[0.24em] text-white/60 mb-7 uppercase font-medium">
              <span aria-hidden="true" className="w-1.5 h-1.5 bg-accent" />
              {eyebrow}
            </p>
          )}
          <RevealText
            as="h2"
            text={title}
            className="m-0 font-normal uppercase text-3xl sm:text-5xl xl:text-6xl leading-[1] tracking-tight text-white max-w-[20ch]"
          />
          {body && (
            <p
              className="fq-fade m-0 mt-7 max-w-[52ch] text-base sm:text-lg leading-relaxed text-white/70"
              style={{ ["--i" as string]: 3 }}
            >
              {body}
            </p>
          )}
        </div>

        <div
          className="fq-fade flex flex-wrap items-center gap-x-5 gap-y-2"
          style={{ ["--i" as string]: 4 }}
        >
          <PrimaryAction action={primary} />
          {secondary && <TextAction action={secondary} />}
        </div>
      </InView>
    </section>
  );
}
