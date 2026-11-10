"use client";

import React, { useState } from "react";
import { responsive } from "@/lib/img";

interface ProjectCarouselProps {
  images: string[];
  alt: string;
  /** Tailwind aspect ratio utility for the frame. */
  aspect?: string;
  /** How wide the frame is drawn, so the browser picks the smallest adequate file. */
  sizes?: string;
}

export function ProjectCarousel({
  images,
  alt,
  aspect = "aspect-[16/10]",
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: ProjectCarouselProps) {
  const [index, setIndex] = useState(0);
  const slides = images.length > 0 ? images : [""];

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);

  // Only the slide on show and its neighbours are fetched; the rest load when
  // the visitor gets close, instead of every photo of every project at once.
  const isNear = (i: number) => {
    const d = Math.abs(i - index);
    return Math.min(d, slides.length - d) <= 1;
  };

  return (
    <div className="group/car relative w-full">
      {/* Frame */}
      <div
        className={`relative w-full ${aspect} overflow-hidden bg-zinc-900 border border-white/10`}
      >
        {slides.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            {src ? (
              isNear(i) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  {...responsive(src, sizes)}
                  alt={`${alt} — view ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover block transition-transform duration-[1200ms] ease-out group-hover/car:scale-[1.03]"
                />
              )
            ) : (
              <div className="w-full h-full bg-[repeating-linear-gradient(125deg,#1a1a1a_0px,#1a1a1a_1px,transparent_1px,transparent_18px)]" />
            )}
          </div>
        ))}

        {/* Silver edge sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        {/* Arrows — desktop, on hover */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center border border-white/25 bg-black/50 backdrop-blur-sm text-white/80 opacity-0 group-hover/car:opacity-100 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="square" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center border border-white/25 bg-black/50 backdrop-blur-sm text-white/80 opacity-0 group-hover/car:opacity-100 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 6l6 6-6 6" strokeLinecap="square" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-0.5 mt-3">
          {slides.map((_, i) => (
            // The visible dot is 5px, but the button around it is a 28×32px
            // hit area (WCAG 2.5.8 asks for at least 24px).
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === index}
              className="group/dot flex items-center justify-center min-w-[28px] h-8 px-1 cursor-pointer"
            >
              <span
                className={`block h-[5px] transition-all duration-400 ${
                  i === index
                    ? "w-7 bg-gradient-to-r from-[#e6e6e6] via-[#a6a6a6] to-[#dfdfdf]"
                    : "w-[5px] bg-white/25 group-hover/dot:bg-white/50"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
