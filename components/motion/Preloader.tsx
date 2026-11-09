"use client";

import { useEffect, useRef, useState } from "react";
import { damp, onFrame } from "@/lib/motion";

const SESSION_KEY = "fq-intro";
/** Never hold a visitor longer than this, whatever the network is doing. */
const MAX_WAIT_MS = 4200;
/** Floor so the drawing-on animation always gets to read as intentional. */
const MIN_SHOW_MS = 1500;

/**
 * First-visit intro for the home page. The hero frame sequence reports how
 * many of its opening frames have decoded (window.__fqHero); this tracks that
 * real progress with a blueprint "F.QUAD" mark drawing itself on, then lifts
 * like a curtain. Shown once per session — the head script in layout.tsx sets
 * `data-intro="loading"` only when it should run, and CSS keeps the overlay
 * hidden otherwise, so returning visitors never see a flash of it.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current;
    mountedRef.current = true;
    if (!root || html.dataset.intro !== "loading") {
      setGone(true);
      return;
    }

    html.style.overflow = "hidden";
    const started = performance.now();
    let shown = 0;
    let finishing = false;

    const finish = () => {
      if (finishing) return;
      finishing = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* private mode — the intro will just play again next visit */
      }
      root.dataset.leaving = "true";
      // Reveal page content as the curtain starts to rise, not after.
      window.setTimeout(() => {
        html.dataset.intro = "done";
        html.style.overflow = "";
      }, 260);
      window.setTimeout(() => setGone(true), 1100);
    };

    const stop = onFrame(() => {
      const hero = window.__fqHero;
      const real = hero ? Math.min(1, hero.loaded / Math.max(1, hero.total)) : 0;
      const elapsed = performance.now() - started;
      // Time-based ceiling so the number keeps moving even before any frame
      // has landed; real progress takes over once it's ahead.
      const timed = Math.min(1, elapsed / MAX_WAIT_MS) * 0.6;
      const target = Math.max(real, timed);
      shown = damp(shown, target, 6, 1 / 60);

      const pct = Math.round(shown * 100);
      if (counterRef.current) {
        counterRef.current.textContent = String(pct).padStart(3, "0");
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown})`;

      if (!finishing && ((real >= 1 && elapsed > MIN_SHOW_MS) || elapsed > MAX_WAIT_MS)) {
        shown = 1;
        finish();
      }
    });

    return () => {
      mountedRef.current = false;
      stop();
      html.style.overflow = "";
      // A real unmount (navigating away mid-intro) must not leave the page
      // stuck in its hidden "loading" state. React StrictMode's simulated
      // unmount re-mounts in the same tick, so deferring the check lets that
      // case pass untouched.
      window.setTimeout(() => {
        if (!mountedRef.current && html.dataset.intro === "loading") {
          html.dataset.intro = "done";
        }
      }, 50);
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={rootRef} className="fq-preloader" role="status" aria-label="Loading F.QUAD">
      <div className="fq-preloader-inner">
        {/* The "quad": a square resolved into four cells, drawn line by line. */}
        <svg
          viewBox="0 0 120 120"
          className="fq-preloader-mark"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          aria-hidden="true"
        >
          <rect pathLength={1} x="10" y="10" width="100" height="100" />
          <line pathLength={1} x1="60" y1="10" x2="60" y2="110" />
          <line pathLength={1} x1="10" y1="60" x2="110" y2="60" />
          <rect pathLength={1} x="22" y="22" width="26" height="26" />
          <rect pathLength={1} x="72" y="22" width="26" height="26" />
          <rect pathLength={1} x="22" y="72" width="26" height="26" />
          <rect pathLength={1} x="72" y="72" width="26" height="26" />
          <line pathLength={1} x1="0" y1="60" x2="10" y2="60" />
          <line pathLength={1} x1="110" y1="60" x2="120" y2="60" />
          <line pathLength={1} x1="60" y1="0" x2="60" y2="10" />
          <line pathLength={1} x1="60" y1="110" x2="60" y2="120" />
        </svg>

        <div className="fq-preloader-meta">
          <span className="fq-preloader-brand">F.QUAD</span>
          <span ref={counterRef} className="fq-preloader-count">
            000
          </span>
        </div>
        <div className="fq-preloader-rule">
          <div ref={barRef} className="fq-preloader-rule-fill" />
        </div>
        <span className="fq-preloader-sub">Architecture &amp; Interior Design Studio</span>
      </div>
    </div>
  );
}
