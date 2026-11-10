"use client";

import { useEffect, useRef, useState } from "react";
import { damp, onFrame } from "@/lib/motion";
import { FIBONACCI, goldenSpiral } from "@/lib/golden";
import { watchSiteReady } from "@/lib/site-ready";

const SESSION_KEY = "fq-intro";
/**
 * The intro holds until the page behind it is genuinely ready — every hero
 * frame decoded, every image on the page loaded, fonts settled, the 3D
 * scenes built — so that scrolling afterwards costs nothing. These are the
 * ceilings that stop a slow network from holding anyone hostage:
 *
 *   MAX_WAIT_MS   a hard stop; past this the curtain lifts regardless
 *   STALL_MS      how long to sit with no progress arriving before giving up
 *
 * The second is what keeps a long wait honest: while the bar is still
 * climbing the intro keeps waiting, and the moment it stops climbing the
 * intro stops waiting rather than sitting on a dead connection.
 */
const MAX_WAIT_MS = 30000;
const STALL_MS = 6000;
/** Floor so the construction gets to draw itself and read as intentional. */
const MIN_SHOW_MS = 1900;

/** The loader's drawing: a golden rectangle resolved into its spiral. */
const G = goldenSpiral(300, 9);
const PAD = 14;
const VB = `${-PAD} ${-PAD} ${G.width + PAD * 2} ${G.height + PAD * 2}`;
/** The stage zooms into the spiral's eye as the curtain opens. */
const EYE_ORIGIN = `${(((G.eye.x + PAD) / (G.width + PAD * 2)) * 100).toFixed(2)}% ${(
  ((G.eye.y + PAD) / (G.height + PAD * 2)) *
  100
).toFixed(2)}%`;

/**
 * First-visit intro for the home page. A golden rectangle draws itself and
 * subdivides square by square (1, 1, 2, 3, 5, 8…); the spiral through it
 * follows the hero's real loading progress (window.__fqHero), with a point of
 * light at its tip. When the film is ready the view dives into the spiral's
 * eye while the sheet parts along the golden section — 61.8 / 38.2.
 *
 * Shown once per session — the head script in layout.tsx sets
 * `data-intro="loading"` only when it should run, and CSS keeps the overlay
 * hidden otherwise, so returning visitors never see a flash of it.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const spiralRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGGElement>(null);
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
    const spiral = spiralRef.current;
    const tip = tipRef.current;
    // Real length (not pathLength) so getPointAtLength agrees in every engine.
    const total = spiral ? spiral.getTotalLength() : 0;
    if (spiral && total) {
      spiral.style.strokeDasharray = `${total} ${total}`;
      spiral.style.strokeDashoffset = String(total);
      root.dataset.ready = "true";
    }
    let lastPct = -1;

    const finish = () => {
      if (finishing) return;
      finishing = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* private mode — the intro will just play again next visit */
      }
      // Let the spiral close and the tip settle in the eye, then open.
      window.setTimeout(() => {
        root.dataset.leaving = "true";
      }, 280);
      // Reveal page content as the sheet starts to part, not after.
      window.setTimeout(() => {
        html.dataset.intro = "done";
        html.style.overflow = "";
      }, 560);
      window.setTimeout(() => setGone(true), 1700);
      // Everything was laid out under a locked scrollbar. One resize puts
      // ScrollTrigger's measurements and Lenis back in agreement with the
      // page the visitor is about to scroll.
      window.setTimeout(() => window.dispatchEvent(new Event("resize")), 620);
    };

    // Pull the whole page's loading forward into the time the intro is
    // already on screen, and follow it.
    let real = 0;
    let siteReady = false;
    let bestAt = performance.now();
    let best = 0;
    const stopWatching = watchSiteReady((state) => {
      real = state.progress;
      siteReady = state.ready;
      if (real > best + 0.005) {
        best = real;
        bestAt = performance.now();
      }
    });

    const stop = onFrame((_, dt) => {
      const elapsed = performance.now() - started;
      // A slow trickle so the drawing is never frozen before the first
      // numbers arrive; real progress takes over the moment it is ahead.
      const timed = Math.min(1, elapsed / MAX_WAIT_MS) * 0.25;
      const target = finishing ? 1 : Math.max(real, timed);
      shown = damp(shown, target, finishing ? 10 : 5, dt);
      if (finishing && shown > 0.999) shown = 1;

      const pct = Math.round(shown * 100);
      if (pct !== lastPct) {
        lastPct = pct;
        if (counterRef.current) counterRef.current.textContent = String(pct).padStart(3, "0");
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown.toFixed(4)})`;
      if (spiral && total) {
        spiral.style.strokeDashoffset = (total * (1 - shown)).toFixed(2);
        if (tip) {
          const pt = spiral.getPointAtLength(total * shown);
          tip.setAttribute("transform", `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)})`);
        }
      }

      // Done when the page really is done; otherwise give up only on a hard
      // ceiling, or once progress has stopped arriving altogether.
      const stalled = performance.now() - bestAt > STALL_MS;
      if (
        !finishing &&
        ((siteReady && elapsed > MIN_SHOW_MS) ||
          elapsed > MAX_WAIT_MS ||
          (stalled && elapsed > MIN_SHOW_MS))
      ) {
        finish();
      }
    });

    return () => {
      mountedRef.current = false;
      stop();
      stopWatching();
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
      {/* The sheet, cut at the golden section; the two leaves part to open. */}
      <div className="fq-preloader-leaf fq-preloader-leaf--a" />
      <div className="fq-preloader-leaf fq-preloader-leaf--b" />
      <div className="fq-preloader-seam" />

      <div className="fq-preloader-inner">
        <svg
          viewBox={VB}
          className="fq-preloader-mark"
          style={{ transformOrigin: EYE_ORIGIN }}
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="fq-pre-glow">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
              <stop offset="0.35" stopColor="currentColor" stopOpacity="0.25" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Golden rectangle, then each square it resolves into, in turn. */}
          <rect
            className="fq-pre-frame"
            pathLength={1}
            x={0}
            y={0}
            width={G.width}
            height={G.height}
          />
          {G.squares.map((q, k) => (
            <rect
              key={k}
              className="fq-pre-cell"
              style={{ ["--k" as string]: k }}
              pathLength={1}
              x={q.x}
              y={q.y}
              width={q.s}
              height={q.s}
            />
          ))}
          {G.squares.slice(0, 6).map((q, k) => (
            <text
              key={`n${k}`}
              className="fq-pre-num"
              style={{ ["--k" as string]: k }}
              x={q.x + q.s / 2}
              y={q.y + q.s / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={Math.max(6, q.s * 0.16)}
            >
              {FIBONACCI[FIBONACCI.length - 3 - k]}
            </text>
          ))}

          {/* The spiral follows real loading progress (set from JS). */}
          <path ref={spiralRef} className="fq-pre-spiral" d={G.spiral} />
          <g ref={tipRef} className="fq-pre-tip">
            <circle r={16} fill="url(#fq-pre-glow)" stroke="none" />
            <circle r={2.4} fill="currentColor" stroke="none" />
          </g>
        </svg>

        <div className="fq-preloader-meta">
          <span className="fq-preloader-brand">F.QUAD</span>
          <span className="fq-preloader-phi">φ 1.618</span>
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
