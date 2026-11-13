"use client";

import React from "react";
import { InView } from "@/components/motion/InView";
import { hasFinePointer } from "@/lib/motion";

export interface QuoteImage {
  src: string;
  alt: string;
  width?: number | null;
  height?: number | null;
}

export interface QuoteItem {
  id: string;
  quote: string;
  clientName: string;
  projectName?: string | null;
  image?: QuoteImage | null;
}

/**
 * A client's words on a card. Each card is its own InView rather than relying
 * on a section-wide one: the observer needs 15% of its element on screen, which
 * a very long list on a phone could never reach, leaving the top of the list
 * stuck invisible. The edge-light follows the pointer and is written to this
 * card's own style only.
 */
export function QuoteCard({ item, index }: { item: QuoteItem; index: number }) {
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!hasFinePointer()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const { image } = item;

  return (
    <InView as="li" className="fq-fade min-w-0" style={{ ["--i" as string]: index % 3 }}>
      <figure
        onPointerMove={onMove}
        className="fq-spot relative m-0 flex h-full flex-col overflow-hidden border border-white/15 bg-black/60 backdrop-blur-md hover:border-white/35 transition-colors"
      >
        {image && (
          <div className="relative aspect-[16/10] overflow-hidden border-b border-white/15 bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              width={image.width ?? 800}
              height={image.height ?? 500}
              loading="lazy"
              decoding="async"
              className="fq-img absolute inset-0 block h-full w-full object-cover"
            />
          </div>
        )}

        <div className="relative flex flex-1 flex-col p-7 sm:p-8">
          {/* oversized opening mark, outlined so it never competes with the text */}
          <span
            aria-hidden="true"
            className="fq-outline pointer-events-none mb-2 block h-9 select-none font-display text-6xl leading-none"
          >
            &ldquo;
          </span>
          <blockquote className="m-0">
            <p className="m-0 text-base leading-[1.8] text-white/80">{item.quote}</p>
          </blockquote>

          <figcaption className="mt-auto pt-8">
            <span aria-hidden="true" className="mb-5 block h-px w-8 bg-white/40" />
            <cite className="block text-sm font-semibold not-italic tracking-wide text-white">
              {item.clientName}
            </cite>
            {item.projectName && (
              <span className="mt-1.5 block text-[11px] uppercase tracking-[0.18em] text-white/60">
                {item.projectName}
              </span>
            )}
          </figcaption>
        </div>
      </figure>
    </InView>
  );
}
