import React from "react";
import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { Magnetic, RevealText } from "@/components/motion/Reveal";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";

const INVITE_ART: ParallaxItem[] = [
  { art: "floorlamp", x: "90%", y: "2%", w: 84, depth: 0.6, opacity: 0.14, desktopOnly: true },
  { art: "armchair", x: "66%", y: "50%", w: 200, depth: 0.35, opacity: 0.09, desktopOnly: true },
  { art: "dimension", x: "4%", y: "88%", w: 230, depth: 0.3, opacity: 0.13, desktopOnly: true },
  { art: "cross", x: "95%", y: "88%", w: 28, depth: 1, spin: -90, opacity: 0.2 },
];

// `.btn-metallic` pins its own 10px type, so the 11px floor needs `!`.
const OUTLINE_BTN =
  "inline-flex min-h-[44px] items-center justify-center px-6 text-[11px] tracking-[0.18em] uppercase font-medium text-white border border-white/35 hover:border-white transition-colors";
const PRIMARY_BTN =
  "btn-metallic !text-[11px] min-h-[44px] uppercase font-medium cursor-pointer";

/**
 * The page's way forward, shown whether or not any testimonials exist: share
 * a story of your own, or start a project. It replaces the old "coming soon"
 * dead end, so there is always somewhere to go from here.
 */
export function Invite() {
  return (
    <section className="relative overflow-hidden border-t border-white/15 px-6 sm:px-14 py-24 sm:py-32">
      <ParallaxField items={INVITE_ART} />

      <InView className="relative z-10 grid max-w-[1500px] grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          <RevealText
            as="h2"
            text={"Share your story,\nor start a new one."}
            className="m-0 font-normal uppercase text-3xl sm:text-5xl md:text-6xl leading-[0.98] tracking-tight text-white"
          />
          <p
            className="fq-fade m-0 mt-8 max-w-[52ch] text-base sm:text-lg leading-relaxed text-white/70"
            style={{ ["--i" as string]: 3 }}
          >
            If you have lived with a space we designed, tell us how it feels. If you are planning
            one, tell us about it &mdash; every project here began as a conversation.
          </p>
        </div>

        <div
          className="fq-fade flex flex-wrap items-center gap-5 lg:col-span-4 lg:justify-end"
          style={{ ["--i" as string]: 4 }}
        >
          <Magnetic>
            <Link href="/contact" className={OUTLINE_BTN}>
              Share your story
            </Link>
          </Magnetic>
          <Magnetic>
            {/* Opened by the global data-start-project listener. */}
            <button type="button" data-start-project="true" className={PRIMARY_BTN}>
              Start a project
            </button>
          </Magnetic>
        </div>
      </InView>
    </section>
  );
}
