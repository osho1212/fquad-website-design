"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { responsive } from "@/lib/img";
import { prefersReducedMotion } from "@/lib/motion";

interface ProjectGalleryProps {
  images: string[];
  alt: string;
  backHref: string;
  backLabel: string;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * The project's photographs as a full-viewport viewer.
 *
 * The frame is exactly one screen tall (minus the navbar), and every photo is
 * drawn with object-contain, so the whole picture is visible at once whatever
 * its aspect ratio or the window's — landscape, portrait, ultrawide, phone.
 * A blurred copy of the photo fills the letterbox so it never looks empty.
 *
 * A ribbon of thumbnails overlays the bottom of the photo; picking one jumps
 * to it. Swipe, arrow keys, the arrow buttons and the ribbon all work.
 */
export function ProjectGallery({ images, alt, backHref, backLabel }: ProjectGalleryProps) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [ribbonOpen, setRibbonOpen] = useState(true);
  // On short screens (phone landscape) the strip would eat too much of the
  // photo, so it starts collapsed; "Show gallery" opens it.
  useEffect(() => {
    if (window.innerHeight < 520) setRibbonOpen(false);
  }, []);

  // Height of the thumbnail strip. The photo is padded by this much top AND
  // bottom, so it stays centred in the frame and the strip never covers it.
  const ribbonBoxRef = useRef<HTMLDivElement>(null);
  const [ribbonH, setRibbonH] = useState(0);
  const total = images.length;

  const scrollToSlide = useCallback(
    (target: number) => {
      const next = (target + total) % total;
      setIndex(next);
      const track = trackRef.current;
      if (!track || track.clientWidth <= 0) return;
      track.scrollTo({
        left: next * track.clientWidth,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    },
    [total]
  );

  // Keep `index` in step with swipes.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || total <= 1) return;
    let raf = 0;
    const sync = () => {
      raf = 0;
      const w = track.clientWidth;
      if (w <= 0) return;
      const i = Math.min(total - 1, Math.max(0, Math.round(track.scrollLeft / w)));
      setIndex((prev) => (prev === i ? prev : i));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };
    const onResize = () => {
      const w = track.clientWidth;
      if (w > 0) track.scrollTo({ left: index * w, behavior: "auto" });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [total, index]);

  // Arrow keys, while the gallery is on screen and nobody is typing.
  useEffect(() => {
    if (total <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (t?.isContentEditable) return;
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return;
      e.preventDefault();
      scrollToSlide(index + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total, index, scrollToSlide]);

  useEffect(() => {
    const box = ribbonBoxRef.current;
    if (!box) return;
    const measure = () => setRibbonH(Math.round(box.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [total]);

  // Keep the selected thumbnail visible in the ribbon. Scrolls the ribbon
  // itself, never the page (scrollIntoView would move the page too).
  useEffect(() => {
    const ribbon = ribbonRef.current;
    const thumb = ribbon?.children[index] as HTMLElement | undefined;
    if (!ribbon || !thumb) return;
    const target = thumb.offsetLeft - (ribbon.clientWidth - thumb.clientWidth) / 2;
    ribbon.scrollTo({ left: target, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [index, ribbonOpen]);

  const arrow =
    "absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-white/25 bg-black/55 backdrop-blur-sm text-white/90 hover:bg-white hover:text-black hover:border-white active:bg-white active:text-black transition-colors duration-300 cursor-pointer";

  return (
    <section
      ref={rootRef}
      aria-roledescription="gallery"
      aria-label={`${alt} photographs`}
      // One screen tall, below the fixed navbar. svh keeps it exact on phones
      // whose browser toolbar grows and shrinks.
      className="relative h-svh min-h-[300px] pt-[68px] sm:pt-[76px] pb-3 sm:pb-5 px-3 sm:px-8"
    >
      <div className="relative h-full w-full overflow-hidden bg-zinc-900 border border-white/10">
        {/* Photos: swipeable, snap-scrolling, each fully visible. */}
        <div
          ref={trackRef}
          className="flex h-full w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ touchAction: "pan-x pan-y", overscrollBehaviorX: "contain" }}
        >
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative h-full w-full flex-none snap-center snap-always overflow-hidden select-none"
              aria-hidden={i !== index}
            >
              {/* Blurred copy fills the letterbox. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                {...responsive(src, "20vw", [640])}
                alt=""
                aria-hidden="true"
                loading={i <= 1 ? "eager" : "lazy"}
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-60"
              />
              <div className="absolute inset-0 bg-black/25" />
              <div
                className="absolute inset-0 z-10 transition-[padding] duration-300"
                style={{ paddingTop: ribbonH, paddingBottom: ribbonH }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  {...responsive(src, "100vw")}
                  alt={`${alt} — view ${i + 1} of ${total}`}
                  loading={i <= 1 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  decoding="async"
                  draggable={false}
                  className="block w-full h-full object-contain select-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Back link */}
        <Link
          href={backHref}
          className="absolute top-3 left-3 z-20 inline-flex items-center min-h-9 px-3 bg-black/55 backdrop-blur-sm border border-white/20 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-white/90 hover:bg-white hover:text-black transition-colors"
        >
          {backLabel}
        </Link>

        {total > 1 && (
          <>
            {/* Counter */}
            <div
              aria-live="polite"
              className="pointer-events-none absolute top-3 right-3 z-20 px-2.5 py-1.5 bg-black/55 backdrop-blur-sm border border-white/20 text-[10px] tracking-[0.18em] font-display text-white/90 tabular-nums uppercase"
            >
              {pad2(index + 1)} / {pad2(total)}
            </div>

            {/* Arrows (sit above the ribbon's height so they never overlap it) */}
            <button
              type="button"
              onClick={() => scrollToSlide(index - 1)}
              aria-label="Previous image"
              className={`${arrow} left-2.5 sm:left-4`}
             
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="square" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollToSlide(index + 1)}
              aria-label="Next image"
              className={`${arrow} right-2.5 sm:right-4`}
             
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 6l6 6-6 6" strokeLinecap="square" />
              </svg>
            </button>

            {/* Ribbon: thumbnail strip overlaid on the bottom of the photo */}
            <div className="absolute inset-x-0 bottom-0 z-20">
              <div className="flex justify-center">
                {/* Text only, white with a soft shadow so it reads on any photo. */}
                <button
                  type="button"
                  onClick={() => setRibbonOpen((o) => !o)}
                  aria-expanded={ribbonOpen}
                  aria-controls="gallery-ribbon"
                  className="inline-flex items-center gap-2 min-h-10 px-4 text-[11px] font-medium tracking-[0.22em] uppercase hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.9), 0 0 14px rgba(0,0,0,.6)" }}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 10 6"
                    className={`w-2 h-[6px] transition-transform duration-300 ${ribbonOpen ? "" : "rotate-180"}`}
                    style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,.8))" }}
                  >
                    <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  {ribbonOpen ? "Hide gallery" : "Show gallery"}
                </button>
              </div>

              <div
                ref={ribbonBoxRef}
                id="gallery-ribbon"
                hidden={!ribbonOpen}
                // No panel of its own: the thumbnails sit straight on the
                // photo's blurred backdrop, so the two read as one surface.
              >
                <div
                  ref={ribbonRef}
                  role="tablist"
                  aria-label="Choose an image"
                  className="relative flex gap-2 overflow-x-auto px-3 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  style={{ justifyContent: "safe center" }}
                >
                  {images.map((src, i) => {
                    const selected = i === index;
                    return (
                      <button
                        key={`${src}-${i}`}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-label={`Show image ${i + 1} of ${total}`}
                        onClick={() => scrollToSlide(i)}
                        className={`relative flex-none h-12 w-[4.5rem] sm:h-16 sm:w-24 overflow-hidden border transition-all duration-300 cursor-pointer ${
                          selected
                            ? "border-white opacity-100 ring-1 ring-white"
                            : "border-white/25 opacity-60 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          {...responsive(src, "96px", [640])}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          className="w-full h-full object-cover block"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
