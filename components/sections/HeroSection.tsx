"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStartProjectModal } from "@/components/ui/StartProjectModalContext";
import { withDefaults } from "@/lib/cms/schema";
import { clamp, hasFinePointer, onFrame, pointer, prefersReducedMotion, retainPointer } from "@/lib/motion";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";
import { Magnetic } from "@/components/motion/Reveal";

/**
 * The hero is a scroll-scrubbed film: a building going from pencil sketch to
 * clay model to finished render (public/assets/hero, exported from the studio
 * video). `d-` frames are 1440px wide for desktop, `m-` 800px for slow
 * connections. Phones held upright get their own portrait film, `p-`
 * (720×1280), which opens on the clay model and needs no letterboxing.
 */
const FRAME_COUNT = 189;
/**
 * Bumped whenever the frames are replaced. They are cached for a week
 * (next.config.js), so a new film needs new URLs or returning visitors would
 * see old and new frames mixed. The poster class on the stage repeats it.
 */
const FILM_VERSION = "2";
/** Frames the preloader waits on — the opening of the scrub, not all 189. */
const PRIORITY_FRAMES = 20;
/** First frame of the clay model / of the finished render. */
const MODEL_FROM_INDEX = 22;
const RENDER_FROM_INDEX = 56;
const PHASES = ["Sketch", "Model", "Render"] as const;

/** Each frame set is its own cut, with its own length and phase points. */
type Film = { count: number; modelFrom: number; renderFrom: number };
const FILMS: Record<"d" | "m" | "p", Film> = {
  d: { count: FRAME_COUNT, modelFrom: MODEL_FROM_INDEX, renderFrom: RENDER_FROM_INDEX },
  m: { count: FRAME_COUNT, modelFrom: MODEL_FROM_INDEX, renderFrom: RENDER_FROM_INDEX },
  // Clay model from the first frame; the render has taken over by ~28.
  p: { count: 167, modelFrom: 0, renderFrom: 28 },
};

/**
 * Furniture and drafting marks at the edges of the stage. Faint on purpose:
 * the film is the subject, this only frames it. Their ink colour follows the
 * hero's (dark on the paper-white sketch, white once the render takes over).
 */
const HERO_ART: ParallaxItem[] = [
  { art: "pendant", x: "17%", y: "-1%", w: 64, depth: 0.5, opacity: 0.5, desktopOnly: true, delay: 0.2 },
  { art: "pendant", x: "76%", y: "-2%", w: 48, depth: 0.9, opacity: 0.42, desktopOnly: true, delay: 0.5 },
  { art: "plant", x: "1.5%", y: "58%", w: 110, depth: -0.3, opacity: 0.3, desktopOnly: true, delay: 0.7 },
  { art: "armchair", x: "85%", y: "60%", w: 140, depth: 0.4, opacity: 0.26, desktopOnly: true, delay: 0.9 },
  { art: "dimension", x: "2%", y: "26%", w: 210, depth: 0.3, rotate: 90, opacity: 0.38, desktopOnly: true, delay: 0.4 },
  { art: "cross", x: "9%", y: "17%", w: 36, depth: 0.8, spin: 120, opacity: 0.5, delay: 0.3 },
  { art: "cross", x: "92%", y: "44%", w: 30, depth: 1, spin: -120, opacity: 0.45, delay: 0.8 },
];

/**
 * Does this browser decode AVIF? The hero frames ship as AVIF (~43% smaller
 * than the WebP set at a measured SSIM of 0.98+) with the WebP frames kept
 * alongside as the fallback. The probe decodes a 1x1 AVIF data URI, so it
 * costs no request and settles in about a millisecond; it is memoised, and a
 * short timeout falls back to WebP rather than letting a stuck decode hold
 * the film up.
 */
let avifProbe: Promise<boolean> | null = null;
const supportsAvif = (): Promise<boolean> => {
  if (avifProbe) return avifProbe;
  avifProbe = new Promise<boolean>((resolve) => {
    if (typeof Image === "undefined") return resolve(false);
    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };
    const img = new Image();
    img.onload = () => done(img.naturalWidth > 0);
    img.onerror = () => done(false);
    img.src =
      "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAo" +
      "aGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAAB" +
      "AAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABL" +
      "aXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAAC" +
      "AAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
    window.setTimeout(() => done(false), 200);
  });
  return avifProbe;
};

const pad3 = (n: number) => String(n).padStart(3, "0");

/** Average colour of a 2px row of a frame (for the portrait bands). */
let probe: CanvasRenderingContext2D | null = null;
function edgeColour(img: HTMLImageElement, y: number): string {
  if (!probe) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    probe = c.getContext("2d", { willReadFrequently: true });
  }
  if (!probe) return "rgb(245,243,238)";
  probe.clearRect(0, 0, 1, 1);
  probe.drawImage(img, 0, Math.max(0, y), img.naturalWidth, 2, 0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return `rgb(${r},${g},${b})`;
}
const transparentOf = (rgb: string) => rgb.replace("rgb(", "rgba(").replace(")", ",0)");

const STENCIL = {
  landscape: {
    viewBox: "0 0 1920 1080",
    fit: "xMidYMid slice",
    cx: 960,
    titleY: 480,
    titleSize: 170,
    subY: 610,
    subSize: 24,
    bylineY: 662,
    bylineSize: 18,
  },
  // Title ≈ 4.8× its font size wide, so 128 fills ~80% of a 760-unit sheet.
  portrait: {
    viewBox: "0 0 760 1200",
    fit: "xMidYMid meet",
    cx: 380,
    titleY: 540,
    titleSize: 128,
    subY: 632,
    subSize: 15,
    bylineY: 668,
    bylineSize: 12,
  },
} as const;

/**
 * The finale artwork: paper everywhere except a F.QUAD-shaped window onto the
 * film (no outline around the letters), and two plain lines beneath. The
 * mask holds only the title — a window that thin shows nothing legible.
 */
function StencilArt({
  variant,
  title,
  subtitle,
  byline,
}: {
  variant: keyof typeof STENCIL;
  title: string;
  subtitle: string;
  byline: string;
}) {
  const s = STENCIL[variant];
  const id = `fquad-stencil-${variant}`;
  const font = { fontFamily: "Good Times, sans-serif", textAnchor: "middle" as const };
  return (
    <svg
      viewBox={s.viewBox}
      preserveAspectRatio={s.fit}
      className={`fq-stencil fq-stencil--${variant} w-full h-full absolute inset-0`}
      role="img"
      aria-label={title}
    >
      <defs>
        <mask id={id}>
          {/* White: the paper stays. Black: the title punches through. */}
          <rect x="-2000" y="-2000" width="6000" height="5000" fill="white" />
          <text
            x={s.cx}
            y={s.titleY}
            dominantBaseline="central"
            fill="black"
            fontWeight="bold"
            fontSize={s.titleSize}
            letterSpacing="0.08em"
            {...font}
          >
            {title}
          </text>
        </mask>
      </defs>
      <rect
        className="fq-hero-stencil-fill"
        x="-2000"
        y="-2000"
        width="6000"
        height="5000"
        mask={`url(#${id})`}
      />
      <text
        className="fq-hero-stencil-sub"
        x={s.cx}
        y={s.subY}
        dominantBaseline="central"
        fontWeight="500"
        fontSize={s.subSize}
        letterSpacing="0.18em"
        {...font}
      >
        {subtitle}
      </text>
      <text
        className="fq-hero-stencil-sub"
        x={s.cx}
        y={s.bylineY}
        dominantBaseline="central"
        fontWeight="500"
        fontSize={s.bylineSize}
        letterSpacing="0.22em"
        opacity="0.7"
        {...font}
      >
        {byline}
      </text>
    </svg>
  );
}

export function HeroSection({ content }: { content?: Record<string, any> }) {
  const c = withDefaults("home", "hero", content);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  // Scroll-driven layers are updated through refs, not React state: setState
  // on every scroll tick re-rendered this whole tree up to 60 times a second.
  const textRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const hudFrameRef = useRef<HTMLSpanElement>(null);
  const hudPhaseRef = useRef<HTMLSpanElement>(null);
  const hudBarRef = useRef<HTMLDivElement>(null);
  const stencilRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // The one thing that stays in React state: it flips once per scrub and
  // swaps the ink colour (dark on the sketch, white over the render).
  const [onRender, setOnRender] = useState(false);
  const { openModal } = useStartProjectModal();

  // Which film is loaded depends on the screen's shape, so it is tracked here:
  // rotating a phone (or resizing a window across the phone breakpoint) swaps
  // films instead of cropping the 9:16 portrait film to fill a landscape
  // screen, which is what made the hero look zoomed in.
  const [phone, setPhone] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px) and (orientation: portrait)");
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || phone === null) return;
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Upright phones get the portrait film; data-saver and slow connections
    // elsewhere get the small landscape set. On data-saver / 2g / 3g every
    // other frame is skipped (the scrub holds the nearest loaded frame, so
    // motion stays continuous).
    const conn = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const slow = Boolean(conn?.saveData) || /(^|-)(2g|3g)$/.test(conn?.effectiveType ?? "");
    const prefix = phone ? "p" : slow ? "m" : "d";
    const film = FILMS[prefix];
    // Flipped to "avif" once the probe confirms support, before any frame is
    // requested. WebP stays the default so an unsupported browser never pays
    // a failed request.
    let ext = "webp";
    const stride = slow ? 2 : 1;
    let maxInflight = slow ? 3 : 6;

    const images: (HTMLImageElement | undefined)[] = new Array(film.count);
    const started: boolean[] = new Array(film.count).fill(false);
    const decoded: boolean[] = new Array(film.count).fill(false);
    /** Edge colours per frame for the portrait bands (read back once each). */
    const edges: ([string, string] | undefined)[] = new Array(film.count);
    let cancelled = false;
    const seq = { frame: 0 };
    let wasRender = false;
    let lastDrawn = -1;
    let priorityLoaded = 0;
    let inflight = 0;
    const priorityTotal = Array.from({ length: PRIORITY_FRAMES }, (_, k) => k).filter(
      (k) => k % stride === 0
    ).length;
    /** Every frame the film will ever want, once stride is taken out. */
    const filmTotal = Math.ceil(film.count / stride);
    let filmSettled = 0;

    /**
     * What the intro reads. `loaded`/`total` is the opening handful — enough
     * to start playing. `filmLoaded`/`filmTotal` is the whole film, which is
     * what an intro that means to hold until scrolling is smooth must wait
     * on: the rest of the frames are otherwise fetched as the visitor
     * scrolls into them, which is exactly where the stutter came from.
     */
    const publish = () => {
      window.__fqHero = {
        loaded: priorityLoaded,
        total: priorityTotal,
        filmLoaded: filmSettled,
        filmTotal,
        preloadAll,
      };
    };
    publish();

    const render = () => {
      const frameIdx = Math.min(film.count - 1, Math.max(0, Math.round(seq.frame)));

      // Only re-render React when the boundary is actually crossed — render()
      // runs on every scroll tick.
      const isRender = frameIdx >= film.renderFrom;
      if (isRender !== wasRender) {
        wasRender = isRender;
        setOnRender(isRender);
      }

      // Frames still downloading (or skipped on a slow connection): hold the
      // nearest one that has arrived rather than flashing back to frame 1.
      let shown = frameIdx;
      let img = images[shown];
      if (!(img && decoded[shown] && img.naturalWidth)) {
        img = undefined;
        for (let k = frameIdx - 1; k >= 0; k--) {
          const cand = images[k];
          if (cand && decoded[k] && cand.naturalWidth) {
            img = cand;
            shown = k;
            break;
          }
        }
      }
      if (img) {
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        // Screens taller than the film: cropping it to cover would cut the
        // building's sides (a sliver of it, for the 16:9 film on a portrait
        // tablet; the edges of the 9:16 phone film on a 19.5:9 phone). There
        // the whole frame is drawn at full width and the bands above and
        // below take the frame's own edge colours, feathered in, so it reads
        // as one image. The landscape film keeps covering any landscape
        // screen; it sits above the headline on a portrait one.
        const vw = canvas.clientWidth || window.innerWidth;
        const vh = canvas.clientHeight || window.innerHeight;
        const upright = ih > iw;
        const portrait = upright ? vw / vh < iw / ih - 0.01 : vw / vh < 1;
        const cw = iw;
        const ch = portrait ? Math.round((iw * vh) / vw) : ih;
        if (canvas.width !== cw || canvas.height !== ch) {
          canvas.width = cw;
          canvas.height = ch;
          lastDrawn = -1;
        }
        if (shown !== lastDrawn) {
          if (!portrait) {
            ctx.drawImage(img, 0, 0);
          } else {
            const dy = upright
              ? Math.round((ch - ih) * 0.45)
              : Math.max(0, Math.round(ch * 0.4 - ih / 2));
            let edge = edges[shown];
            if (!edge) {
              edge = [edgeColour(img, 0), edgeColour(img, ih - 2)];
              edges[shown] = edge;
            }
            const [top, bottom] = edge;
            ctx.fillStyle = top;
            ctx.fillRect(0, 0, cw, dy + 2);
            ctx.fillStyle = bottom;
            ctx.fillRect(0, dy + ih - 2, cw, ch - dy - ih + 2);
            ctx.drawImage(img, 0, dy);
            const feather = Math.round(ih * 0.14);
            const g1 = ctx.createLinearGradient(0, dy, 0, dy + feather);
            g1.addColorStop(0, top);
            g1.addColorStop(1, transparentOf(top));
            ctx.fillStyle = g1;
            ctx.fillRect(0, dy, cw, feather);
            const g2 = ctx.createLinearGradient(0, dy + ih - feather, 0, dy + ih);
            g2.addColorStop(0, transparentOf(bottom));
            g2.addColorStop(1, bottom);
            ctx.fillStyle = g2;
            ctx.fillRect(0, dy + ih - feather, cw, feather);
          }
          lastDrawn = shown;
        }
      }
      pump();

      // Live drawing readout.
      if (hudFrameRef.current) {
        hudFrameRef.current.textContent = `${pad3(frameIdx + 1)} / ${film.count}`;
      }
      if (hudPhaseRef.current) {
        hudPhaseRef.current.textContent =
          PHASES[frameIdx >= film.renderFrom ? 2 : frameIdx >= film.modelFrom ? 1 : 0];
      }
      if (hudBarRef.current) {
        hudBarRef.current.style.transform = `scaleX(${(seq.frame / (film.count - 1)).toFixed(4)})`;
      }
    };

    // Just-in-time loading: a few requests in flight at a time, always the
    // unloaded frame closest to where the visitor is scrolling (forward
    // first). The opening frames load immediately; nothing queues 189
    // downloads ahead of the page's other assets.
    // Only a window around the playhead is ever requested: a visitor who
    // reads the headline and leaves downloads ~a third of the film, not all
    // of it. Scrolling slides the window; a far jump (an anchor link) simply
    // holds the nearest loaded frame until its neighbourhood arrives.
    let AHEAD = slow ? 36 : 64;
    let BEHIND = 10;
    const nextWanted = (): number => {
      const cur = Math.round(seq.frame);
      for (let d = 0; d <= AHEAD; d++) {
        const fwd = cur + d;
        if (fwd < film.count && !started[fwd] && fwd % stride === 0) return fwd;
        if (d > 0 && d <= BEHIND) {
          const back = cur - d;
          if (back >= 0 && !started[back] && back % stride === 0) return back;
        }
      }
      return -1;
    };

    const startFrame = (idx: number) => {
      started[idx] = true;
      inflight += 1;
      const img = new Image();
      const priority = idx < PRIORITY_FRAMES;
      const settle = () => {
        inflight -= 1;
        filmSettled += 1;
        if (priority) priorityLoaded += 1;
        publish();
      };
      // Decode off the main thread before the frame counts as ready. A frame
      // drawn straight after onload is decoded synchronously inside
      // drawImage — 10-30 ms of main thread per frame on a phone, which is
      // what made fast scrubs stutter.
      img.onload = () => {
        const ready = () => {
          if (cancelled) return;
          decoded[idx] = true;
          settle();
          if (idx === 0 || Math.round(seq.frame) === idx) render();
          else pump();
        };
        if (typeof img.decode === "function") img.decode().then(ready, ready);
        else ready();
      };
      // A failed frame must not hold the intro hostage.
      img.onerror = () => {
        settle();
        pump();
      };
      img.decoding = "async";
      img.src = `/assets/hero/${prefix}-${pad3(idx + 1)}.${ext}?v=${FILM_VERSION}`;
      images[idx] = img;
    };

    /**
     * Pull the whole film down now rather than a window around the current
     * frame. The intro calls this so that by the time the curtain lifts every
     * frame is decoded and a scrub costs nothing; nobody else should, or the
     * hero would fight the rest of the page for bandwidth on first paint.
     */
    function preloadAll() {
      if (AHEAD >= film.count) return;
      AHEAD = film.count;
      BEHIND = film.count;
      maxInflight = slow ? 4 : 10;
      if (formatSettled) pump();
    }

    function pump() {
      while (inflight < maxInflight) {
        const idx = nextWanted();
        if (idx < 0) return;
        startFrame(idx);
      }
    }
    // Nothing is requested until the format is known — a few milliseconds
    // against an intro that runs for well over a second.
    let formatSettled = false;
    supportsAvif().then((ok) => {
      if (formatSettled) return;
      formatSettled = true;
      if (ok) ext = "avif";
      pump();
      // Try initial draw immediately in case first image is cached
      if (images[0] && decoded[0]) render();
    });

    // Phase layout across the scroll distance (340vh section − 100vh pinned = 240vh):
    //   0.00 → 0.50  the film scrubs: sketch → model → render
    //   0.50 → 0.66  the finished render holds under the headline
    //   0.66 → 0.88  the stage settles to paper around the F.QUAD cut-out
    const setDisplay = (el: HTMLElement | null, on: boolean, display: string) => {
      if (el) el.style.display = on ? display : "none";
    };

    const apply = (p: number) => {
      const textOp = p <= 0.56 ? 1 : clamp(1 - (p - 0.56) / 0.12);
      const textY = p <= 0.56 ? 0 : Math.max(-30, Math.min(0, -(p - 0.56) * 70));
      const text = textRef.current;
      if (text) {
        text.style.opacity = String(textOp);
        text.style.transform = `translateY(${textY}px)`;
        text.style.display = textOp <= 0.01 ? "none" : "flex";
        text.style.pointerEvents = textOp > 0.3 ? "auto" : "none";
      }
      if (fieldRef.current) fieldRef.current.style.opacity = String(textOp);
      // Inline opacity only once the HUD fades out; before that, leave it to
      // the CSS intro transition (an inline value would beat it).
      if (hudRef.current) {
        hudRef.current.style.opacity = p > 0.56 ? String(clamp(1 - (p - 0.58) / 0.1)) : "";
      }

      const settle = p > 0.66 ? clamp((p - 0.66) / 0.22) : 0;
      if (stencilRef.current) stencilRef.current.style.opacity = String(settle);
      setDisplay(stencilRef.current, settle > 0.01, "block");

      // The "scroll" prompt has done its job once the visitor starts scrolling.
      // Inline opacity only after that, so the CSS intro transition isn't beaten.
      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = p > 0.002 ? String(clamp(1 - p / 0.08)) : "";
      }

      const cue = clamp((p - 0.86) / 0.12);
      if (cueRef.current) cueRef.current.style.opacity = String(cue);
      setDisplay(cueRef.current, cue > 0.01, "flex");
    };
    apply(0);

    // With Lenis already easing the scroll, a short scrub is enough inertia.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
        onUpdate: (self) => apply(self.progress),
      },
    });

    tl.to(seq, {
      frame: film.count - 1,
      ease: "none",
      duration: 0.5,
      onUpdate: render,
    });

    // Hold on final frame for the remainder of the timeline
    tl.to({}, { duration: 0.5 });

    // Depth: the film drifts a few px against the pointer.
    let stopDepth: (() => void) | null = null;
    let releasePointer: (() => void) | null = null;
    const wrap = canvasWrapRef.current;
    let heroVisible = true;
    const heroIo = new IntersectionObserver(([e]) => {
      heroVisible = e.isIntersecting;
    });
    heroIo.observe(container);
    if (wrap && hasFinePointer() && !prefersReducedMotion()) {
      releasePointer = retainPointer();
      let lastDepth = "";
      stopDepth = onFrame(() => {
        if (!heroVisible) return;
        const next = `translate3d(${(-pointer.x * 12).toFixed(1)}px, ${(-pointer.y * 9).toFixed(
          1
        )}px, 0) scale(1.035)`;
        if (next === lastDepth) return;
        lastDepth = next;
        wrap.style.transform = next;
      });
    }

    // Rotating a phone flips between the cover and the full-width layouts.
    const onResize = () => {
      lastDrawn = -1;
      render();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      heroIo.disconnect();
      cancelled = true;
      formatSettled = true;
      stopDepth?.();
      releasePointer?.();
      tl.scrollTrigger?.kill();
      tl.kill();
      delete window.__fqHero;
    };
  }, [phone]);

  return (
    <section id="top" ref={containerRef} className="relative h-[340vh] bg-black">
      <div
        className={`fq-hero-stage sticky top-0 h-[100svh] w-full overflow-hidden bg-[url('/assets/hero/d-001.webp?v=2')] max-md:portrait:bg-[url('/assets/hero/p-001.webp?v=2')] bg-cover bg-center flex flex-col justify-center items-center${
          onRender ? " fq-hero-stage--render" : ""
        }`}
      >
        {/* Layer 0: the film, drawn frame by frame on a canvas */}
        <div ref={canvasWrapRef} className="absolute inset-0 z-0 will-change-transform">
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover block"
          />
        </div>

        {/* Layer 0.2: soft scrim so white type holds up over the render */}
        <div
          aria-hidden="true"
          className="fq-hero-scrim absolute inset-x-0 bottom-0 h-[58%] z-[2] pointer-events-none"
        />

        {/* Layer 0.5: drifting furniture and drafting marks, tied to hero progress */}
        <div ref={fieldRef} className="absolute inset-0 z-[5] pointer-events-none">
          <ParallaxField items={HERO_ART} track={containerRef} draw="intro" range={260} />
        </div>

        {/* Layer 1: headline and calls to action */}
        <div
          ref={textRef}
          className="fq-hero-copy absolute bottom-0 left-0 right-0 z-10 w-full px-6 sm:px-11 pb-12 sm:pb-16 flex flex-col items-center justify-center text-center pointer-events-auto"
        >
          <h1
            className="fq-intro-item fq-hero-h1 m-0 font-bold text-[clamp(1rem,6.1vw,1.5rem)] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl whitespace-nowrap leading-none tracking-tight uppercase"
            style={{ ["--i" as string]: 0 }}
          >
            {c.headline}
          </h1>

          <div
            className="fq-intro-item flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mt-5 sm:mt-6"
            style={{ ["--i" as string]: 1 }}
          >
            <Magnetic strength={0.22}>
              <a
                href={c.primaryCtaHref}
                className="btn-secondary fq-hero-btn-secondary min-h-[44px] text-[11px] sm:text-xs py-2 px-5 sm:px-6 tracking-[0.16em] sm:tracking-[0.2em] uppercase font-semibold"
              >
                {c.primaryCtaLabel}
              </a>
            </Magnetic>
            <Magnetic strength={0.22}>
              <button
                type="button"
                onClick={() => openModal()}
                className="btn-primary fq-hero-btn-primary min-h-[44px] text-[11px] sm:text-xs py-2 px-5 sm:px-6 tracking-[0.16em] sm:tracking-[0.2em] uppercase font-semibold"
              >
                {c.secondaryCtaLabel}
              </button>
            </Magnetic>
          </div>

          {/* Scroll prompt: label plus cascading arrows, visible until the first scroll */}
          <div
            ref={scrollHintRef}
            className="fq-intro-item fq-scroll-cue flex flex-col items-center gap-3 mt-7 sm:mt-8 pointer-events-none"
            style={{ ["--i" as string]: 2 }}
          >
            <span className="text-xs sm:text-[13px] tracking-[0.3em] uppercase font-semibold">{c.scrollHint}</span>
            <span aria-hidden="true" className="fq-scroll-bob flex flex-col items-center gap-1.5">
              <span className="fq-scroll-chevs">
                <i />
                <i />
                <i />
              </span>
            </span>
          </div>
        </div>

        {/* Layer 1.2: drawing HUD — location, phase, frame counter, progress */}
        <div
          ref={hudRef}
          aria-hidden="true"
          className="fq-hero-sub fq-intro-item hidden md:flex absolute inset-x-11 bottom-6 z-10 justify-between items-end pointer-events-none text-[11px] tracking-[0.24em] uppercase"
          style={{ ["--i" as string]: 3 }}
        >
          <div className="flex flex-col gap-1.5">
            <span>17.3850° N · 78.4867° E</span>
            <span className="opacity-70">Hyderabad · IN</span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <span ref={hudPhaseRef}>Sketch</span>
              <span ref={hudFrameRef} className="tabular-nums">
                001 / {FRAME_COUNT}
              </span>
            </div>
            <div className="fq-hero-hud-track w-36 h-px overflow-hidden">
              <div
                ref={hudBarRef}
                className="fq-hero-hud-fill h-full w-full origin-left"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </div>
        </div>

        {/* Layer 2: finale — the stage settles to paper around a F.QUAD cut-out
            that frames the finished render. The mask holds only the title;
            the two smaller lines are plain type (a window that thin shows
            nothing legible). */}
        <div
          ref={stencilRef}
          style={{ opacity: 0, display: "none" }}
          className="absolute inset-0 z-20 pointer-events-none w-full h-full overflow-hidden"
        >
          {/* Two compositions: landscape fills the screen (slice); portrait
              fits a taller sheet whole (meet) so the title is never cropped. */}
          <StencilArt
            variant="landscape"
            title={c.stencilTitle}
            subtitle={c.stencilSubtitle}
            byline={c.stencilByline}
          />
          <StencilArt
            variant="portrait"
            title={c.stencilTitle}
            subtitle={c.stencilSubtitle}
            byline={c.stencilByline}
          />
        </div>

        {/* Layer 3: settled navigation cue */}
        <div
          ref={cueRef}
          style={{ opacity: 0, display: "none" }}
          className="absolute bottom-10 z-30 pointer-events-none flex flex-col items-center gap-2 text-white/60 text-[11px] tracking-[0.24em] uppercase"
        >
          <span className="text-white/80 font-medium">{c.discoverLabel}</span>
          <div className="w-[1px] h-6 bg-gradient-to-b from-white to-transparent animate-bounce" />
        </div>
      </div>
    </section>
  );
}
