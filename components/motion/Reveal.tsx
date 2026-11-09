"use client";

import React, { useEffect, useRef } from "react";
import { clamp, hasFinePointer, onFrame, prefersReducedMotion } from "@/lib/motion";

/* ─────────────────────────────────────────────────────────────────────────
   RevealText — headline words rise out of a mask, staggered.
   Pure CSS transitions (see globals.css .fq-rt-*): one IntersectionObserver
   flips data-in, everything else runs off the main thread and can be
   interrupted. No-JS visitors see plain text (the hidden state is scoped to
   html.js).
   ───────────────────────────────────────────────────────────────────────── */

type Tag = "h1" | "h2" | "h3" | "p" | "div" | "span" | "blockquote";

export function RevealText({
  text,
  as: Tag = "div",
  className = "",
  delay = 0,
  stagger = 55,
}: {
  text: string;
  as?: Tag;
  className?: string;
  /** ms before the first word moves. */
  delay?: number;
  /** ms between words — kept in the 30–80 range so it never feels slow. */
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      el.dataset.in = "true";
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.in = "true";
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let word = 0;
  const lines = text.split("\n");

  return (
    <Tag
      // The words below are aria-hidden fragments; the label keeps the
      // heading readable as one string.
      ref={ref as React.Ref<any>}
      aria-label={text.replace(/\n/g, " ")}
      className={className}
    >
      {lines.map((line, li) => (
        <React.Fragment key={li}>
          {li > 0 && <br aria-hidden="true" />}
          {line.split(" ").filter(Boolean).map((w, wi) => {
            const i = word++;
            return (
              <React.Fragment key={`${li}-${wi}`}>
                {wi > 0 && " "}
                <span className="fq-rt-word" aria-hidden="true">
                  <span
                    className="fq-rt-inner"
                    style={{ transitionDelay: `${delay + i * stagger}ms` }}
                  >
                    {w}
                  </span>
                </span>
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ))}
    </Tag>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ScrollWords — a paragraph whose words resolve from faint to full as it
   scrolls through the viewport, so the reader's eye is led along the line.
   Opacity-only, written straight to the DOM; subscribes to the frame loop
   only while the block is on screen.
   ───────────────────────────────────────────────────────────────────────── */
export function ScrollWords({
  text,
  as: Tag = "p",
  className = "",
  floor = 0.16,
}: {
  text: string;
  as?: "p" | "h2" | "h3" | "blockquote" | "div";
  className?: string;
  /** Opacity of a word that hasn't been reached yet. */
  floor?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    if (prefersReducedMotion()) {
      spans.forEach((s) => (s.style.opacity = "1"));
      return;
    }

    const n = spans.length;
    let stop: (() => void) | null = null;
    let last = -1;

    const run = () => {
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      // 0 when the block's top is 90% down the viewport, 1 once its bottom
      // has reached 45% — the whole thing is readable well before it exits.
      const p = clamp((vh * 0.9 - r.top) / (r.height + vh * 0.45));
      if (Math.abs(p - last) < 0.002) return;
      last = p;
      for (let i = 0; i < n; i++) {
        const o = clamp((p * (n + 5) - i) / 5);
        spans[i].style.opacity = String(floor + (1 - floor) * o);
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !stop) {
          stop = onFrame(run);
        } else if (!entry.isIntersecting && stop) {
          stop();
          stop = null;
        }
      },
      { rootMargin: "10% 0px" }
    );
    io.observe(el);
    run();

    return () => {
      io.disconnect();
      stop?.();
    };
  }, [text, floor]);

  // The words stay in the accessibility tree as ordinary text. (An earlier
  // version hid them and relied on aria-label, which screen readers ignore on
  // a <p>, so paragraphs read as empty.) The faint starting state lives in CSS
  // scoped to html.js, so without JavaScript the text is simply full strength.
  return (
    <Tag
      ref={ref as React.Ref<any>}
      className={className}
      style={{ ["--fq-floor" as string]: floor } as React.CSSProperties}
    >
      {words.map((w, i) => (
        <React.Fragment key={i}>
          {i > 0 && " "}
          <span data-w>{w}</span>
        </React.Fragment>
      ))}
    </Tag>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Magnetic — a button that leans toward the pointer. Fine pointers only.
   ───────────────────────────────────────────────────────────────────────── */
export function Magnetic({
  children,
  strength = 0.28,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner || !hasFinePointer() || prefersReducedMotion()) return;

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let active = false;
    let stop: (() => void) | null = null;

    const loop = (_: number, dt: number) => {
      // Spring toward target; snappier when pulled in, softer on release.
      const k = active ? 14 : 9;
      x += (tx - x) * (1 - Math.exp(-k * dt));
      y += (ty - y) * (1 - Math.exp(-k * dt));
      inner.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      if (!active && Math.abs(x) < 0.05 && Math.abs(y) < 0.05) {
        inner.style.transform = "";
        stop?.();
        stop = null;
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
      active = true;
      if (!stop) stop = onFrame(loop);
    };
    const onLeave = () => {
      active = false;
      tx = 0;
      ty = 0;
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      stop?.();
    };
  }, [strength]);

  // The wrapper's padding enlarges the hit area so the pull starts just
  // before the pointer reaches the button; negative margin cancels it out.
  return (
    <div ref={wrapRef} className={`inline-block p-4 -m-4 ${className}`}>
      <div ref={innerRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
