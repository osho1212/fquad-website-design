import gsap from "gsap";
import type Lenis from "lenis";

declare global {
  interface Window {
    /** Set by <SmoothScroll /> while Lenis is driving the page. */
    __fqLenis?: Lenis;
    /** Hero frame-sequence loading progress, read by the preloader. */
    __fqHero?: { loaded: number; total: number };
  }
}

/** Strong ease-out for entrances — the built-in CSS curves are too weak. */
export const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
/** Strong ease-in-out for on-screen movement. */
export const EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";

export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent exponential smoothing (dt in seconds). */
export const damp = (a: number, b: number, lambda: number, dt: number) =>
  lerp(a, b, 1 - Math.exp(-lambda * dt));

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * One shared frame loop for every effect on the page. GSAP's ticker already
 * drives Lenis, so hanging everything off it keeps scroll position and
 * scroll-linked visuals in the same frame (no one-frame lag between them).
 * `dt` is in seconds and capped so a background tab can't cause a jump.
 */
export function onFrame(cb: (time: number, dt: number) => void): () => void {
  const fn = (time: number, deltaMs: number) =>
    cb(time, Math.min(deltaMs, 64) / 1000);
  gsap.ticker.add(fn);
  return () => gsap.ticker.remove(fn);
}

/** Scroll to an absolute Y through Lenis when it is active. */
export function scrollToY(y: number, opts?: { duration?: number }) {
  if (typeof window === "undefined") return;
  const lenis = window.__fqLenis;
  if (lenis) {
    lenis.scrollTo(y, { duration: opts?.duration ?? 1.2 });
    return;
  }
  window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/* ── Shared, smoothed pointer ────────────────────────────────────────────
   Parallax layers, the hero canvas and the 3D scenes all want "where is the
   pointer, -1..1, eased". One listener and one smoothing loop serve all of
   them; both only run while at least one consumer is mounted. */
export const pointer = { tx: 0, ty: 0, x: 0, y: 0 };

let pointerSubs = 0;
let stopPointerLoop: (() => void) | null = null;

const onPointerMove = (e: PointerEvent) => {
  pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
};

export function retainPointer(): () => void {
  if (typeof window === "undefined" || !hasFinePointer()) return () => {};
  pointerSubs += 1;
  if (pointerSubs === 1) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    stopPointerLoop = onFrame((_, dt) => {
      pointer.x = damp(pointer.x, pointer.tx, 4, dt);
      pointer.y = damp(pointer.y, pointer.ty, 4, dt);
    });
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    pointerSubs -= 1;
    if (pointerSubs === 0) {
      window.removeEventListener("pointermove", onPointerMove);
      stopPointerLoop?.();
      stopPointerLoop = null;
      pointer.tx = pointer.ty = pointer.x = pointer.y = 0;
    }
  };
}
