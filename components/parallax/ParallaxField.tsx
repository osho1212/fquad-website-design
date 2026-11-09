"use client";

import React, { useEffect, useRef } from "react";
import {
  clamp,
  easeOutCubic,
  onFrame,
  pointer,
  prefersReducedMotion,
  retainPointer,
} from "@/lib/motion";
import { Art, type ArtName } from "./art";

export interface ParallaxItem {
  art: ArtName;
  /** Left / top as a CSS length, relative to the field. */
  x: string;
  y: string;
  /** Design width in px at a 1440 viewport; scales down with the window. */
  w: number;
  /**
   * Parallax depth. Positive moves faster than the page (foreground),
   * negative slower (background). 0 = pinned to the page.
   */
  depth: number;
  rotate?: number;
  /** Extra rotation (deg) swept across the scroll range. */
  spin?: number;
  opacity?: number;
  /** Hide on small screens, where the layers would crowd the copy. */
  desktopOnly?: boolean;
  /** Seconds before this item's lines start drawing (intro mode). */
  delay?: number;
}

interface Props {
  items: ParallaxItem[];
  /**
   * Follow this element's scroll progress instead of the field's own transit
   * through the viewport — for sticky/pinned stages, where the field itself
   * never moves.
   */
  track?: React.RefObject<HTMLElement | null>;
  /**
   * "scroll": lines draw on as the field enters the viewport.
   * "intro": lines draw once, on load (CSS keyframe, after the preloader).
   * "none": always fully drawn.
   */
  draw?: "scroll" | "intro" | "none";
  /** Pixels of travel at depth 1 across the full range. */
  range?: number;
  className?: string;
}

/**
 * A layer of drifting blueprint SVGs. Each item sits at its own depth: as the
 * page scrolls the layers slide past each other at different speeds, and the
 * pointer nudges them by the same ratio, so the field reads as real depth
 * rather than a set of unrelated decorations.
 *
 * All motion is `transform` written straight to the element on the shared
 * frame loop, and only while the field is on screen.
 */
export function ParallaxField({
  items,
  track,
  draw = "scroll",
  range = 150,
  className = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = itemRefs.current;
    const reduced = prefersReducedMotion();

    const base = (i: number) => items[i].rotate ?? 0;

    if (reduced) {
      els.forEach((el, i) => {
        if (el) el.style.transform = `rotate(${base(i)}deg)`;
      });
      root.querySelectorAll<SVGElement>("[data-draw]").forEach((p) => {
        p.style.strokeDashoffset = "0";
      });
      return;
    }

    const releasePointer = retainPointer();
    const drawPaths = els.map((el) =>
      el ? Array.from(el.querySelectorAll<SVGElement>("[data-draw]")) : []
    );
    if (draw === "scroll") {
      drawPaths.forEach((paths) =>
        paths.forEach((p) => {
          p.style.strokeDasharray = "1";
          p.style.strokeDashoffset = "1";
        })
      );
    }

    let visible = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "25% 0px" }
    );
    io.observe(track?.current ?? root);

    const stop = onFrame(() => {
      if (!visible) return;
      const vh = window.innerHeight;
      let off: number; // -1 … 1, 0 when the field is centred in the viewport

      const trackEl = track?.current;
      if (trackEl) {
        const r = trackEl.getBoundingClientRect();
        const span = Math.max(1, r.height - vh);
        off = (clamp(-r.top / span) - 0.5) * 2;
      } else {
        const r = root.getBoundingClientRect();
        off = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      }

      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (!el) continue;
        const it = items[i];
        const ty = off * it.depth * range + pointer.y * it.depth * 14;
        const tx = pointer.x * it.depth * 22;
        const rot = base(i) + (it.spin ?? 0) * off;
        el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(
          1
        )}px, 0) rotate(${rot.toFixed(2)}deg)`;

        if (draw === "scroll") {
          const paths = drawPaths[i];
          // Draws in as the field rises from the bottom edge to just past
          // centre; later items in the list start a touch later.
          const dp = clamp((1 - off) * 0.72 - i * 0.03);
          const o = (1 - easeOutCubic(dp)).toFixed(3);
          for (let k = 0; k < paths.length; k++) {
            paths[k].style.strokeDashoffset = o;
          }
        }
      }
    });

    return () => {
      stop();
      io.disconnect();
      releasePointer();
    };
  }, [items, track, draw, range]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-draw-mode={draw}
      className={`fq-art-field absolute inset-0 pointer-events-none select-none ${className}`}
    >
      {items.map((it, i) => {
        const scaled = (it.w / 1440) * 100;
        return (
          <div
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={`fq-art-item absolute ${it.desktopOnly ? "hidden md:block" : ""}`}
            style={
              {
                // Ink colour: a parent can set --art-ink (the hero does, so the
                // lines stay legible over its video); otherwise the theme's.
                color: "var(--art-ink, rgb(var(--fq-fg)))",
                left: it.x,
                top: it.y,
                width: `clamp(${Math.round(it.w * 0.45)}px, ${scaled.toFixed(2)}vw, ${it.w}px)`,
                opacity: it.opacity ?? 0.2,
                transform: `rotate(${it.rotate ?? 0}deg)`,
                // Intro-mode line drawing reads this (ms) for its stagger.
                "--d": Math.round((it.delay ?? i * 0.12) * 1000),
              } as React.CSSProperties
            }
          >
            <Art name={it.art} />
          </div>
        );
      })}
    </div>
  );
}
