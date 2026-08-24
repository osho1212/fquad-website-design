"use client";

import React, { useState } from "react";

interface ProjectCarouselProps {
  images: string[];
  alt: string;
  /** Tailwind aspect ratio utility for the frame. */
  aspect?: string;
}

export function ProjectCarousel({
  images,
  alt,
  aspect = "aspect-[16/10]",
}: ProjectCarouselProps) {
  const [index, setIndex] = useState(0);
  const slides = images.length > 0 ? images : [""];

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);

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
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={`${alt} — view ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover block transition-transform duration-[1200ms] ease-out group-hover/car:scale-[1.03]"
              />
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
        <div className="flex items-center justify-center gap-2.5 mt-5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === index}
              className={`h-[5px] transition-all duration-400 ${
                i === index
                  ? "w-7 bg-gradient-to-r from-[#e6e6e6] via-[#a6a6a6] to-[#dfdfdf]"
                  : "w-[5px] bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
