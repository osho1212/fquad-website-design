"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import "./LaunchGate.css";
import { LAUNCH_AT_MS, LAUNCH_STAMP, LAUNCH_TIME_LABEL } from "@/lib/launch";
import { SITE } from "@/lib/site";
import { prefersReducedMotion } from "@/lib/motion";
import { watchSiteReady } from "@/lib/site-ready";

/** The sequence, in order. `idle` counts; the rest is the launch. */
type Phase = "idle" | "arm" | "mark" | "split" | "done";

/** How long each phase holds before the next begins. */
const BEATS = {
  full: { arm: 1100, mark: 1900, split: 1600 },
  reduced: { arm: 260, mark: 620, split: 700 },
} as const;

/**
 * How long 11:11 may stay on screen waiting for the page behind to finish
 * loading before the quadrants part anyway. The gate has normally been up
 * for far longer than any page needs, so this is only ever reached by
 * someone who arrived seconds before launch.
 */
const HOLD_CEILING_MS = 15000;

type Remaining = { d: number; h: number; m: number; s: number } | null;

function remainingAt(now: number): Remaining {
  const left = LAUNCH_AT_MS - now;
  if (left <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const sec = Math.floor(left / 1000);
  return {
    d: Math.floor(sec / 86400),
    h: Math.floor((sec % 86400) / 3600),
    m: Math.floor((sec % 3600) / 60),
    s: sec % 60,
  };
}

/**
 * Two digits, each its own element keyed by its own value: when a digit
 * changes React remounts just that element, so its roll-over animation
 * replays on the column that moved and nowhere else.
 */
function Digits({ value }: { value: number }) {
  const chars = String(Math.min(99, Math.max(0, value))).padStart(2, "0").split("");
  return (
    <span className="fq-lg-num">
      {chars.map((ch, i) => (
        <span className="fq-lg-digit" key={`${i}-${ch}`}>
          {ch}
        </span>
      ))}
    </span>
  );
}

/**
 * LAUNCH GATE
 *
 * Holds the public site behind a countdown until the launch instant in
 * lib/launch.ts, then opens it: the copy clears, 11:11 ignites, and the four
 * quadrants of the studio's mark tear apart to uncover the site standing
 * behind them.
 *
 * The overlay is server-rendered and shown by CSS the moment
 * `data-launch="locked"` lands on <html> (set by the head script in
 * lib/launch.ts, before first paint) — so neither the gate nor the site
 * flashes on arrival. After the launch instant the attribute is never set,
 * this component unmounts itself on its first effect, and nothing is left
 * behind.
 */
export function LaunchGate() {
  const pathname = usePathname();
  const gated = !pathname.startsWith("/admin");

  const rootRef = useRef<HTMLDivElement>(null);
  // `locked` is undefined until the first effect has read the document, so the
  // server markup and the first client render agree.
  const [locked, setLocked] = useState<boolean | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("idle");
  const [left, setLeft] = useState<Remaining>(null);
  const [showDev, setShowDev] = useState(false);
  const [flash, setFlash] = useState(false);
  /** True once the page behind the gate has fully loaded (lib/site-ready). */
  const [warm, setWarm] = useState(0);
  const [holding, setHolding] = useState(false);
  const readyRef = useRef(false);
  const timers = useRef<number[]>([]);
  const launchedRef = useRef(false);

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  /** Give scrolling, pointer events and the accessibility tree back. */
  const releasePage = useCallback(() => {
    const page = document.querySelector<HTMLElement>(".fq-page");
    if (page) {
      page.removeAttribute("aria-hidden");
      if ("inert" in page) page.inert = false;
    }
    try {
      window.__fqLenis?.start();
    } catch {
      /* smooth scroll is optional; native scrolling is already back */
    }
  }, []);

  /** The whole reveal. Safe to call twice — the second call does nothing. */
  const launch = useCallback(() => {
    if (launchedRef.current) return;
    launchedRef.current = true;

    const html = document.documentElement;
    const beats = prefersReducedMotion() ? BEATS.reduced : BEATS.full;

    setPhase("arm");

    after(beats.arm, () => setPhase("mark"));

    // The quadrants part onto the live site, so it had better be finished.
    // The gate has normally been up long enough for lib/site-ready.ts to
    // have warmed everything; if not, 11:11 holds on screen until it has.
    const openUp = () => {
      setPhase("split");
      // The site is uncovered, so hand it back: scrolling, pointers, focus and
      // the arrival animation all start with the quadrants parting.
      html.setAttribute("data-launch", "arriving");
      releasePage();
      setFlash(true);

      after(beats.split, () => {
        setPhase("done");
        html.removeAttribute("data-launch");
        setFlash(false);
        // The page was laid out under a locked scrollbar; one resize puts
        // ScrollTrigger and Lenis back in agreement with it.
        window.dispatchEvent(new Event("resize"));
        // Land the keyboard at the top of the page the gate just opened.
        const main = document.getElementById("main");
        if (main) main.focus({ preventScroll: true });
      });
    };

    after(beats.arm + beats.mark, () => {
      if (readyRef.current) {
        openUp();
        return;
      }
      // Hold, and say so, until the page is warm or the ceiling is reached.
      setHolding(true);
      const deadline = performance.now() + HOLD_CEILING_MS;
      const poll = window.setInterval(() => {
        if (readyRef.current || performance.now() > deadline) {
          window.clearInterval(poll);
          setHolding(false);
          openUp();
        }
      }, 120);
      timers.current.push(poll);
    });
  }, [after, releasePage]);

  // ── Decide, on arrival, whether this visitor is held back ───────────────
  useEffect(() => {
    const html = document.documentElement;
    const isLocked = gated && html.getAttribute("data-launch") === "locked";

    if (!isLocked) {
      // Either the launch has passed, this is /admin, or ?skiplaunch was used.
      if (html.getAttribute("data-launch") === "locked") html.removeAttribute("data-launch");
      releasePage();
      setLocked(false);
      return;
    }

    setLocked(true);
    setLeft(remainingAt(Date.now()));

    // Nothing behind the gate is reachable — by pointer, by tab or by a
    // screen reader — until it opens.
    const page = document.querySelector<HTMLElement>(".fq-page");
    if (page) {
      page.setAttribute("aria-hidden", "true");
      if ("inert" in page) page.inert = true;
    }
    try {
      window.__fqLenis?.stop();
    } catch {
      /* not running yet; the CSS scroll lock is holding the page anyway */
    }
    rootRef.current?.focus({ preventScroll: true });

    // The page is mounted and idle behind the gate, which is the best chance
    // it will ever get to load: pull the whole hero film, every image and the
    // 3D scenes down now, so the reveal opens onto a page that scrolls
    // without a stutter.
    const stopWatching = watchSiteReady((state) => {
      readyRef.current = state.ready;
      setWarm(state.progress);
    });
    return stopWatching;
  }, [gated, releasePage]);

  // ── The clock ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!locked || phase !== "idle") return;

    const tick = () => {
      const now = Date.now();
      setLeft(remainingAt(now));
      if (now >= LAUNCH_AT_MS) launch();
    };

    tick();
    const id = window.setInterval(tick, 1000);
    // A backgrounded or sleeping tab drifts; re-read the clock on return so
    // the countdown never shows a stale number (or misses the launch).
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [locked, phase, launch]);

  // ── The studio's own trigger: the dev button, and ⇧⌥L ───────────────────
  useEffect(() => {
    if (!locked) return;
    const isDev =
      process.env.NODE_ENV !== "production" ||
      new URLSearchParams(window.location.search).has("dev");
    setShowDev(isDev);
    if (!isDev) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.altKey && e.code === "KeyL") {
        e.preventDefault();
        launch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, launch]);

  // Clear every pending beat if the gate goes away mid-sequence.
  useEffect(
    () => () => {
      timers.current.forEach((id) => {
        window.clearTimeout(id);
        window.clearInterval(id);
      });
      timers.current = [];
    },
    [],
  );

  if (locked === false || phase === "done") {
    return flash ? <div className="fq-lg-flash" aria-hidden="true" /> : null;
  }

  return (
    <>
      {flash && <div className="fq-lg-flash" aria-hidden="true" />}
      <div
        ref={rootRef}
        className="fq-lg"
        data-phase={phase}
        role="dialog"
        aria-modal="true"
        aria-label={`${SITE.shortName} launches at ${LAUNCH_TIME_LABEL}`}
        tabIndex={-1}
      >
        {/* The quad: four sheets, each clipping its own corner of one grid */}
        <div className="fq-lg-panels" aria-hidden="true">
          {(["tl", "tr", "bl", "br"] as const).map((q) => (
            <div className="fq-lg-panel" data-q={q} key={q}>
              <div className="fq-lg-sheet" />
            </div>
          ))}
        </div>

        <div className="fq-lg-veil" aria-hidden="true" />
        <div className="fq-lg-light" aria-hidden="true" />

        <div className="fq-lg-cross" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="fq-lg-rings" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="fq-lg-sweep" aria-hidden="true" />

        {/* The hour itself, on the way out */}
        <div className="fq-lg-mark" aria-hidden={phase === "idle"}>
          <b>11:11</b>
          <em>{holding ? "One moment — setting the room" : "Welcome home"}</em>
        </div>

        <div className="fq-lg-shell">
          <span className="fq-lg-brand">
            <span className="fq-lg-brand-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fquad-icon.svg" alt="" width={68} height={68} />
            </span>
            <span className="fq-lg-brand-text">
              <span className="fq-lg-brand-name">F.QUAD</span>
              <span className="fq-lg-brand-tag">Architecture &amp; Interior Design Studio</span>
              <span className="fq-lg-brand-by">By</span>
              <span className="fq-lg-brand-founders">AMIT &amp; ASHMI</span>
            </span>
          </span>

          <div className="fq-lg-main">
            <p className="fq-lg-eyebrow fq-lg-in" style={{ "--i": 0 } as React.CSSProperties}>
              Hyderabad · Est. 2005
            </p>

            <h1 className="fq-lg-head fq-lg-in" style={{ "--i": 1 } as React.CSSProperties}>
              <span>Almost</span>
              <span>Home</span>
            </h1>

            <p className="fq-lg-line fq-lg-in" style={{ "--i": 2 } as React.CSSProperties}>
              <b>11:11 is the minute people stop to make a wish.</b> We spent twenty-one years
              building ours — and it is about to open its doors.
            </p>

            <div className="fq-lg-count fq-lg-in" style={{ "--i": 3 } as React.CSSProperties} role="timer">
              <div className="fq-lg-unit">
                <Digits value={left?.d ?? 0} />
                <span className="fq-lg-lbl">Days</span>
              </div>
              <div className="fq-lg-unit">
                <Digits value={left?.h ?? 0} />
                <span className="fq-lg-lbl">Hours</span>
              </div>
              <div className="fq-lg-unit">
                <Digits value={left?.m ?? 0} />
                <span className="fq-lg-lbl">Minutes</span>
              </div>
              <div className="fq-lg-unit">
                <Digits value={left?.s ?? 0} />
                <span className="fq-lg-lbl">Seconds</span>
              </div>
            </div>

            <p className="fq-lg-stamp fq-lg-in" style={{ "--i": 4 } as React.CSSProperties}>
              Doors open {LAUNCH_STAMP}
            </p>

            {/* How much of the site is already standing behind the gate.
                It only shows once there is something real to show. */}
            <div
              className="fq-lg-warm fq-lg-in"
              style={{ "--i": 5 } as React.CSSProperties}
              data-on={warm > 0.02 ? "true" : "false"}
              aria-hidden="true"
            >
              <span style={{ transform: `scaleX(${warm.toFixed(4)})` }} />
            </div>

            {/* Announced once, not on every tick. */}
            <p className="fq-lg-sr" aria-live="polite">
              {left ? `${left.d} days until F.QUAD opens.` : ""}
            </p>
          </div>

          <footer className="fq-lg-foot">
            <span>© {new Date(LAUNCH_AT_MS).getFullYear()} F.QUAD Studio</span>

            {showDev && (
              <button
                type="button"
                className="fq-lg-dev"
                onClick={launch}
                title="Developer only — plays the full launch sequence (⇧ + ⌥ + L)"
              >
                <span aria-hidden="true" />
                Dev · run launch sequence
              </button>
            )}

            <a href={`mailto:${SITE.fallback.email}`}>{SITE.fallback.email}</a>
          </footer>
        </div>
      </div>
    </>
  );
}
