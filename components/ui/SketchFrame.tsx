"use client";

import React, { useEffect, useId, useRef } from "react";
import { clamp, onFrame, prefersReducedMotion } from "@/lib/motion";
import { ModernImage } from "@/components/ui/ModernImage";
import { bestSingleSource } from "@/lib/photo-sources";

export interface SketchFrameImage {
  /** The finished photograph. */
  src: string;
  /** The loose first sketch (see scripts/make-sketches.mjs). Absent for a
   *  photo uploaded through the CMS: it is then drawn as a graphite print of
   *  itself instead (see .fq-sketch-layer--photo). */
  rough?: string;
  /** The finished pencil drawing: fine lines and hatched shading. Same as above. */
  pencil?: string;
  alt: string;
}

/** The three files for a project photo in public/assets/images. */
export const sketchImage = (name: string, alt: string): SketchFrameImage => ({
  src: `/assets/images/${name}.jpg`,
  rough: `/assets/images/sketch/${name}-rough.webp`,
  pencil: `/assets/images/sketch/${name}-pencil.webp`,
  alt,
});

/**
 * The frame image for any photo address. A shipped photo in
 * public/assets/images has its rough and pencil layers beside it; anything
 * else (a CMS upload, an outside address) has none and falls back to a
 * graphite print of the photo.
 */
export const sketchImageFromSrc = (src: string, alt: string): SketchFrameImage => {
  const shipped = /^\/assets\/images\/([A-Za-z0-9_-]+)\.jpg$/.exec(src);
  return shipped ? sketchImage(shipped[1], alt) : { src, alt };
};

/** Linear 0→1 between `a` and `b`. */
const lin = (a: number, b: number, t: number) => clamp((t - a) / (b - a));
/** Eased 0→1 between `a` and `b`. */
const ramp = (a: number, b: number, t: number) => {
  const x = lin(a, b, t);
  return x * x * (3 - 2 * x);
};

/**
 * A back-and-forth scribble that covers the unit square, as one path. Used as
 * a mask: drawing the path on (stroke-dashoffset) uncovers the artwork stroke
 * by stroke, the way a pencil shades an area in. Coordinates are fractions of
 * the frame, so the same path fits any frame size.
 */
function scribble(angleDeg: number, strokes: number, seed: number): string {
  let a = seed | 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const R = 0.86; // reaches past the square's corners (0.707 from centre)
  const step = (2 * R) / strokes;
  let d = "";
  for (let k = 0; k <= strokes; k++) {
    const u = (k % 2 ? 1 : -1) * R * (0.9 + rand() * 0.2); // which side
    const v = -R + k * step + (rand() - 0.5) * step * 0.7; // how far along
    const x = 0.5 + u * cos - v * sin;
    const y = 0.5 + u * sin + v * cos;
    d += `${k ? "L" : "M"}${x.toFixed(3)} ${y.toFixed(3)}`;
  }
  return d;
}

/** Loose, wide strokes for the first sketch; tighter ones, laid along the
 *  hatching, for the finished drawing. Stroke widths are set in globals.css
 *  (.fq-sketch-layer--*), a little over twice each path's step so passes overlap. */
const ROUGH_PATH = scribble(-30, 30, 7);
const PENCIL_PATH = scribble(-52, 52, 19);

/** Writes one image's stage for progress `t` as CSS variables. */
function applyStage(style: CSSStyleDeclaration, t: number): number {
  const color = ramp(0.55, 0.85, t);
  const fade = 1 - ramp(0.65, 0.9, t); // the pencil leaving once colour is in
  style.setProperty("--rough-draw", lin(0, 0.25, t).toFixed(4));
  style.setProperty("--rough-full", lin(0.2, 0.25, t).toFixed(3));
  // The first sketch stays faintly visible under the finished drawing.
  style.setProperty("--rough", ((1 - 0.6 * ramp(0.3, 0.6, t)) * fade).toFixed(4));
  style.setProperty("--draw", lin(0.2, 0.6, t).toFixed(4));
  style.setProperty("--full", lin(0.53, 0.6, t).toFixed(3));
  style.setProperty("--lines", fade.toFixed(4));
  style.setProperty("--color", color.toFixed(4));
  style.setProperty("--settle", ramp(0.55, 1, t).toFixed(4));
  return color;
}

function SketchLayer({
  kind,
  href,
  id,
  d,
  photo = false,
}: {
  kind: "rough" | "pencil";
  href: string;
  id: string;
  d: string;
  /** `href` is the photo itself, not pencil artwork: tone it like graphite. */
  photo?: boolean;
}) {
  return (
    <svg
      className={`fq-sketch-layer fq-sketch-layer--${kind}${photo ? " fq-sketch-layer--photo" : ""}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask
          id={id}
          maskUnits="objectBoundingBox"
          maskContentUnits="objectBoundingBox"
          x="0"
          y="0"
          width="1"
          height="1"
        >
          {/* A wider, fainter pass under the main one softens each stroke's edge. */}
          <path d={d} pathLength={1} className="fq-sketch-stroke fq-sketch-stroke--soft" />
          <path d={d} pathLength={1} className="fq-sketch-stroke" />
          {/* Fills in any sliver the strokes missed as the pass finishes. */}
          <rect x="0" y="0" width="1" height="1" className="fq-sketch-fill" />
        </mask>
      </defs>
      <image
        href={href}
        x="0"
        y="0"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        mask={`url(#${id})`}
      />
    </svg>
  );
}

/**
 * A photo being drawn in pencil, a rough sketch coming to life, as progress
 * `t` runs 0 → 1:
 *
 *   0.00–0.25  the rough sketch appears under loose back-and-forth strokes
 *   0.20–0.60  the finished drawing (fine lines, hatching) is laid over it
 *   0.55–0.85  the photo's colour washes in under the pencil
 *   0.65–0.90  the pencil fades, leaving the photo
 *
 * `t` comes from `progressRef` when given (e.g. a pinned section's per-step
 * progress); otherwise from the frame's own pass through the viewport.
 * Only the active image is shown; switching `active` crossfades.
 *
 * Per frame only CSS variables change (stroke offsets, opacities, a scale).
 */
export function SketchFrame({
  images,
  active,
  progressRef,
  onProgress,
  className = "",
}: {
  images: SketchFrameImage[];
  active: number;
  progressRef?: React.RefObject<number | null>;
  /** Called when the active image's stage changes: its progress, and how far
   *  the colour has come in (0–1), e.g. to restyle a caption over the frame. */
  onProgress?: (t: number, color: number) => void;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const live = useRef({ active, progressRef, onProgress });
  live.current = { active, progressRef, onProgress };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = prefersReducedMotion();
    let last = -1;
    let lastActive = -1;

    const write = (t: number) => {
      const { active: idx, onProgress: cb } = live.current;
      const group = groupRefs.current[idx];
      if (!group || (Math.abs(t - last) < 0.0005 && idx === lastActive)) return;
      last = t;
      lastActive = idx;
      cb?.(t, applyStage(group.style, t));
    };

    const progress = () => {
      if (reduced) return 1;
      const ref = live.current.progressRef;
      if (ref) return clamp(ref.current ?? 0);
      // Own transit: builds while the frame rises from the bottom of the
      // screen to a little above the middle.
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const transit = clamp((vh - r.top) / (vh + r.height));
      return clamp((transit - 0.05) / 0.45);
    };

    // Every image starts blank (or finished, for reduced motion); the shown
    // one is then set to its real stage.
    groupRefs.current.forEach((g) => g && applyStage(g.style, reduced ? 1 : 0));
    write(progress());

    let stop: (() => void) | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !stop) stop = onFrame(() => write(progress()));
        else if (!entry.isIntersecting && stop) {
          stop();
          stop = null;
        }
      },
      { rootMargin: "10% 0px" }
    );
    io.observe(root);
    return () => {
      io.disconnect();
      stop?.();
    };
  }, []);

  return (
    <div ref={rootRef} className={`fq-sketch ${className}`}>
      {images.map((img, i) => {
        const on = i === active;
        // Only the shown image and its neighbours carry their artwork (SVG
        // images can't be lazy-loaded, so the rest aren't mounted at all).
        const near = Math.abs(i - active) <= 1;
        return (
          <div
            key={`${img.src}-${i}`}
            ref={(el) => {
              groupRefs.current[i] = el;
            }}
            className={`fq-sketch-group${on ? " is-active" : ""}`}
            aria-hidden={on ? undefined : true}
          >
            <div className="fq-sketch-stack">
              <ModernImage
                src={img.src}
                alt={on ? img.alt : ""}
                draggable={false}
                loading={near ? "eager" : "lazy"}
                decoding="async"
                className="fq-sketch-color"
              />
              {near && (
                <>
                  <SketchLayer
                    kind="pencil"
                    href={img.pencil ?? bestSingleSource(img.src)}
                    photo={!img.pencil}
                    id={`${uid}-p${i}`}
                    d={PENCIL_PATH}
                  />
                  <SketchLayer
                    kind="rough"
                    href={img.rough ?? bestSingleSource(img.src)}
                    photo={!img.rough}
                    id={`${uid}-r${i}`}
                    d={ROUGH_PATH}
                  />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
