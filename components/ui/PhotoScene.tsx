"use client";

import React, { useEffect, useRef } from "react";
import { ModernImage } from "@/components/ui/ModernImage";

/** The four photographs the What We Do section cycles through, one per practice. */
export type PhotoVariant = "residence" | "farmhouse" | "skylounge" | "atelier";

/** One photograph: where it is and what it shows. */
export interface ScenePhoto {
  src: string;
  alt: string;
}

export interface PhotoSceneProps {
  variant: PhotoVariant;
  /** The photograph for every practice. They come from the CMS (Homepage → What We Do). */
  images: Record<PhotoVariant, ScenePhoto>;
  className?: string;
  /** Element whose scroll progress drives the meter (a tall pinned section). */
  trackRef?: React.RefObject<HTMLElement | null>;
  /** Remaps the box's own transit through the viewport; ignored when `trackRef` is set. */
  range?: [number, number];
  /** Called each frame with the progress (0–1) and which photo is showing. */
  onState?: (state: { p: number; variant?: PhotoVariant }) => void;
  onReady?: () => void;
  /** Progress set by the caller (e.g. from a timer); takes precedence over the above. */
  progressRef?: React.RefObject<number | null>;
  /** Other photos to load in the background. */
  preload?: PhotoVariant[];
}

/**
 * A project photograph that stands in for a 3D model in What We Do. It reports
 * progress the way the WebGL scenes do (from `progressRef`, `trackRef` or the
 * element's own transit), which the section uses for its meters and clocks.
 * The real 3D scenes now appear only in the footer and in How We Work
 * (components/three/RoomScene.tsx).
 */

const POSITIONED = /\b(absolute|fixed|relative|sticky)\b/;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export function PhotoScene({
  variant,
  images,
  className,
  trackRef,
  range,
  onState,
  onReady,
  progressRef,
  preload,
}: PhotoSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ onState, variant, range, trackRef, progressRef });
  stateRef.current = { onState, variant, range, trackRef, progressRef };

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Report progress while the box is on screen, and once whenever the image
  // changes so callers learn which one is showing even when off screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false;
    let raf = 0;

    const progress = (): number => {
      const s = stateRef.current;
      if (s.progressRef) return clamp(s.progressRef.current ?? 0);
      const r = (s.trackRef?.current ?? root).getBoundingClientRect();
      const vh = window.innerHeight;
      if (s.trackRef?.current) return clamp(-r.top / Math.max(1, r.height - vh));
      const t = clamp((vh - r.top) / (vh + r.height));
      const [a, b] = s.range ?? [0, 1];
      return clamp((t - a) / Math.max(0.0001, b - a));
    };

    const report = () => {
      const p = progress();
      if (zoomRef.current && !reduced) {
        zoomRef.current.style.transform = `scale(${(1 + 0.05 * p).toFixed(4)})`;
      }
      stateRef.current.onState?.({ p, variant: stateRef.current.variant });
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (visible && !document.hidden) report();
    };
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      rootMargin: "10% 0px",
    });
    io.observe(root);
    report();
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    stateRef.current.onState?.({ p: 0, variant });
  }, [variant]);

  const shown = Array.from(new Set<PhotoVariant>([variant, ...(preload ?? [])]));
  const cls = className ?? "";

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={images[variant].alt}
      className={`${POSITIONED.test(cls) ? cls : `relative ${cls}`} overflow-hidden bg-[#0a0a0a]`}
    >
      <div ref={zoomRef} className="absolute inset-0 will-change-transform">
        {shown.map((v) => (
          <ModernImage
            key={v}
            src={images[v].src}
            alt=""
            draggable={false}
            loading={v === variant ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              v === variant ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
