"use client";

import React from "react";
import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { RevealText } from "@/components/motion/Reveal";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Interior-design line art, drifting behind the heading. A few presets so
 * neighbouring pages don't all wear the same decoration.
 */
const ART_SETS: Record<string, ParallaxItem[]> = {
  living: [
    { art: "armchair", x: "78%", y: "28%", w: 190, depth: 0.45, opacity: 0.14, desktopOnly: true },
    { art: "floorlamp", x: "92%", y: "-4%", w: 84, depth: 0.7, opacity: 0.16, desktopOnly: true },
    { art: "plant", x: "62%", y: "52%", w: 100, depth: -0.3, opacity: 0.1, desktopOnly: true },
    { art: "cross", x: "6%", y: "20%", w: 30, depth: 0.9, spin: 90, opacity: 0.22 },
  ],
  dining: [
    { art: "pendant", x: "80%", y: "-6%", w: 70, depth: 0.5, opacity: 0.18, desktopOnly: true },
    { art: "chair", x: "88%", y: "40%", w: 96, depth: 0.4, opacity: 0.13, desktopOnly: true },
    { art: "vase", x: "70%", y: "58%", w: 60, depth: 0.8, opacity: 0.15, desktopOnly: true },
    { art: "dimension", x: "4%", y: "86%", w: 240, depth: 0.3, opacity: 0.16, desktopOnly: true },
  ],
  studio: [
    { art: "mirror", x: "84%", y: "-2%", w: 130, depth: 0.45, opacity: 0.13, desktopOnly: true },
    { art: "sofa", x: "52%", y: "62%", w: 360, depth: -0.3, opacity: 0.08, desktopOnly: true },
    { art: "compass", x: "6%", y: "62%", w: 90, depth: 0.5, spin: 40, opacity: 0.13, desktopOnly: true },
    { art: "cross", x: "94%", y: "70%", w: 28, depth: 1, spin: -90, opacity: 0.22 },
  ],
};

export type ArtSet = keyof typeof ART_SETS | "none";

/**
 * The header block of every inner page: breadcrumb, eyebrow, a word-by-word
 * revealed title, an intro, and optional actions — over drifting line art.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  crumbs,
  art = "living",
  // 1.9rem on phones: Good Times runs ~0.8em per capital, so a long single word
  // ("ARCHITECTURE") must fit inside a 375px screen without being clipped by
  // the reveal mask.
  titleClass = "text-[1.9rem] sm:text-6xl md:text-7xl max-w-[18ch]",
  children,
}: {
  eyebrow?: string;
  /** Use "\n" for a line break. */
  title: string;
  intro?: string;
  crumbs?: Crumb[];
  art?: ArtSet;
  /** Size/width of the h1 — override for unusually long titles. */
  titleClass?: string;
  /** Actions (buttons/links) shown under the intro. */
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden pt-36 sm:pt-44 pb-14 sm:pb-20 px-6 sm:px-14 border-b border-white/15">
      {art !== "none" && <ParallaxField items={ART_SETS[art]} range={110} />}

      <InView className="relative z-10 max-w-[1500px]">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="fq-fade mb-8">
            <ol className="m-0 p-0 list-none flex flex-wrap items-center gap-x-2 text-[11px] tracking-[0.18em] uppercase text-white/55">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {c.href ? (
                    <Link href={c.href} className="fq-link inline-block py-1 hover:text-white transition-colors">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-white/80">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {eyebrow && (
          <div className="fq-fade flex items-center gap-3 text-[11px] tracking-[0.24em] text-white/60 mb-7 uppercase font-medium">
            <span aria-hidden="true" className="w-1.5 h-1.5 bg-accent" />
            {eyebrow}
          </div>
        )}

        <RevealText
          as="h1"
          text={title}
          className={`m-0 font-normal uppercase leading-[0.98] tracking-tight text-white ${titleClass}`}
        />

        {intro && (
          <p
            className="fq-fade mt-8 max-w-[56ch] text-base sm:text-lg leading-relaxed text-white/70"
            style={{ ["--i" as string]: 4 }}
          >
            {intro}
          </p>
        )}

        {children && (
          <div className="fq-fade mt-9 flex flex-wrap items-center gap-4" style={{ ["--i" as string]: 5 }}>
            {children}
          </div>
        )}
      </InView>
    </header>
  );
}
