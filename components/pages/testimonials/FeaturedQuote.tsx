import React from "react";
import { Section } from "@/components/layout/Section";
import { ScrollWords } from "@/components/motion/Reveal";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";
import type { QuoteImage } from "./QuoteCard";

// Atmosphere behind the quote, kept to the margins (the type sits over the
// left and centre) and well under the 0.15 ceiling.
const QUOTE_ART: ParallaxItem[] = [
  { art: "pendant", x: "88%", y: "-4%", w: 74, depth: 0.5, opacity: 0.15, desktopOnly: true },
  { art: "mirror", x: "78%", y: "40%", w: 150, depth: -0.3, opacity: 0.09, desktopOnly: true },
  { art: "vase", x: "94%", y: "74%", w: 60, depth: 0.7, opacity: 0.13, desktopOnly: true },
  { art: "cross", x: "3%", y: "88%", w: 28, depth: 0.9, spin: 90, opacity: 0.2 },
];

/**
 * The large pull-quote. Fed either by a testimonial row (with an optional
 * photo) or, when the database has none, by the home page's featured quote —
 * so /testimonials always opens with real words from a client.
 */
export function FeaturedQuote({
  eyebrow,
  quote,
  name,
  detail,
  image,
}: {
  eyebrow?: string;
  quote: string;
  name: string;
  detail?: string | null;
  image?: QuoteImage | null;
}) {
  return (
    <div className="relative overflow-hidden">
      <ParallaxField items={QUOTE_ART} />

      <Section eyebrow={eyebrow} className="relative z-10">
        <div className={`grid grid-cols-1 gap-12 lg:gap-16 ${image ? "lg:grid-cols-12" : ""}`}>
          {image && (
            // Corner ticks sit just outside the photo, like a drawing-sheet viewport.
            <div className="fq-fade fq-frame self-start p-2.5 lg:col-span-4">
              <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  width={image.width ?? 800}
                  height={image.height ?? 1000}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 block h-full w-full object-cover"
                />
              </div>
              <span className="fq-frame-b" aria-hidden="true" />
            </div>
          )}

          <figure className={`relative m-0 min-w-0 ${image ? "lg:col-span-8" : ""}`}>
            {/* oversized opening mark, set behind the type */}
            <span
              aria-hidden="true"
              className="fq-outline pointer-events-none absolute -left-2 -top-14 select-none font-display text-[7rem] leading-none sm:-left-8 sm:-top-20 sm:text-[11rem]"
            >
              &ldquo;
            </span>
            <ScrollWords
              as="blockquote"
              text={`“${quote}”`}
              className="font-display relative m-0 max-w-[28ch] font-light text-xl sm:text-3xl md:text-4xl lg:text-5xl leading-[1.22] tracking-tight text-white"
            />
            <figcaption
              className="fq-fade mt-9 flex flex-col gap-2"
              style={{ ["--i" as string]: 3 }}
            >
              <cite className="text-[11px] font-medium not-italic uppercase tracking-[0.22em] text-white/80">
                {name}
              </cite>
              {detail && (
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                  {detail}
                </span>
              )}
            </figcaption>
          </figure>
        </div>
      </Section>
    </div>
  );
}
