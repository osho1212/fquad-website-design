"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { responsive } from "@/lib/img";
import { prefersReducedMotion } from "@/lib/motion";

interface ProjectCarouselProps {
  images: string[];
  alt: string;
  /** Tailwind aspect ratio utility for the frame. */
  aspect?: string;
  /** How wide the frame is drawn, so the browser picks the smallest adequate file. */
  sizes?: string;
  /** When set, the image itself links here (swiping still works; only a tap or click follows the link). */
  href?: string;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export function ProjectCarousel({
  images,
  alt,
  aspect = "aspect-[16/10]",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  href,
}: ProjectCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const slides = images.length > 0 ? images : [""];
  const total = slides.length;

  const scrollToSlide = useCallback(
    (targetIdx: number) => {
      const next = (targetIdx + total) % total;
      setIndex(next);
      const track = trackRef.current;
      if (!track) return;
      const w = track.clientWidth;
      if (w <= 0) return;
      track.scrollTo({
        left: next * w,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    },
    [total]
  );

  const go = useCallback(
    (dir: 1 | -1) => {
      scrollToSlide(index + dir);
    },
    [index, scrollToSlide]
  );

  // Sync active index as the user swipes horizontally through the track.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || total <= 1) return;
    let raf = 0;

    const syncFromScroll = () => {
      raf = 0;
      const w = track.clientWidth;
      if (w <= 0) return;
      const current = Math.min(
        total - 1,
        Math.max(0, Math.round(track.scrollLeft / w))
      );
      setIndex((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(syncFromScroll);
    };

    const onResize = () => {
      const w = track.clientWidth;
      if (w > 0) {
        track.scrollTo({ left: index * w, behavior: "auto" });
      }
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [total, index]);

  return (
    <div className="group/car relative w-full">
      {/* Frame */}
      <div
        className={`relative w-full ${aspect} overflow-hidden bg-zinc-900 border border-white/10`}
      >
        {/* Horizontal swipe & scroll-snap track */}
        <div
          ref={trackRef}
          className="flex w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x pan-y",
            overscrollBehaviorX: "contain",
          }}
        >
          {slides.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative w-full h-full flex-none snap-center snap-always overflow-hidden select-none"
              aria-hidden={i !== index}
            >
              {src ? (
                (() => {
                  const img = (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      {...responsive(src, sizes)}
                      alt={`${alt} — view ${i + 1}`}
                      loading={i <= 1 ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                      className="fq-img w-full h-full object-cover block select-none transition-transform duration-[1200ms] ease-out md:group-hover/car:scale-[1.03]"
                    />
                  );
                  // The link lives inside the scroller, so horizontal swipes still
                  // scroll the track; only a genuine tap/click navigates. One link
                  // per project is enough for keyboards: off-screen slides skip it.
                  return href ? (
                    <Link
                      href={href}
                      aria-label={`View project: ${alt}`}
                      tabIndex={i === index ? 0 : -1}
                      draggable={false}
                      className="block w-full h-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
                    >
                      {img}
                    </Link>
                  ) : (
                    img
                  );
                })()
              ) : (
                <div className="w-full h-full bg-[repeating-linear-gradient(125deg,#1a1a1a_0px,#1a1a1a_1px,transparent_1px,transparent_18px)]" />
              )}
            </div>
          ))}
        </div>

        {/* Silver edge sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        {/* Slide counter badge */}
        {total > 1 && (
          <div
            aria-live="polite"
            className="pointer-events-none absolute top-3 right-3 z-10 px-2.5 py-1 bg-black/55 backdrop-blur-sm border border-white/20 text-[10px] tracking-[0.18em] font-display text-white/90 tabular-nums uppercase"
          >
            {pad2(index + 1)} / {pad2(total)}
          </div>
        )}

        {/* Arrows — always accessible on touch/mobile, reveal on hover on desktop */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="flex absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center border border-white/25 bg-black/55 backdrop-blur-sm text-white/90 opacity-90 md:opacity-0 md:group-hover/car:opacity-100 active:bg-white active:text-black hover:bg-white hover:text-black hover:border-white transition-all duration-300 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="square" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="flex absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center border border-white/25 bg-black/55 backdrop-blur-sm text-white/90 opacity-90 md:opacity-0 md:group-hover/car:opacity-100 active:bg-white active:text-black hover:bg-white hover:text-black hover:border-white transition-all duration-300 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 6l6 6-6 6" strokeLinecap="square" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-0.5 mt-3">
          {slides.map((_, i) => (
            // The visible dot is 5px, but the button around it is a 28×32px
            // hit area (WCAG 2.5.8 asks for at least 24px).
            <button
              key={i}
              type="button"
              onClick={() => scrollToSlide(i)}
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
