"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { withDefaults } from "@/lib/cms/schema";
import { prefersReducedMotion } from "@/lib/motion";
import { RoomScene } from "@/components/three/RoomScene";
import type { SceneVariant } from "@/components/three/RoomSceneImpl";
import "./ServicesSection.css";

export interface ServiceCard {
  slug: string;
  num: string;
  title: string;
  desc: string;
}

/** Which model tells each practice's story. */
const MODEL_FOR_SLUG: Record<string, SceneVariant> = {
  architecture: "residence",
  "interior-design": "skylounge",
  "interior-styling": "atelier",
  farmhouse: "farmhouse",
};
const FALLBACK_ORDER: SceneVariant[] = ["residence", "skylounge", "atelier", "farmhouse"];

const MODEL_NAME: Record<SceneVariant, string> = {
  residence: "The Residence",
  living: "The Salon",
  bedroom: "The Suite",
  farmhouse: "The Farmhouse",
  lounge: "Material Library",
  skylounge: "The Sky Lounge",
  atelier: "The Atelier",
};

const MODEL_LABEL: Record<SceneVariant, string> = {
  residence:
    "A site model of a contemporary two-storey residence turning from a white concept model into real materials, then to dusk as its lights come on one by one",
  living:
    "A cut-away living room whose light moves from midday sun to golden hour to a lamplit evening",
  bedroom:
    "A bedroom suite built in four stages — line drawing, white model, materials, then styled and lit for the evening",
  farmhouse:
    "A weekend farmhouse estate lit from morning to a lantern-lit evening",
  lounge: "A material library of stone, timber, metal and fabric swatches",
  skylounge:
    "A penthouse living room behind a glazed wall onto the city — Nero marble floor with inlaid light lines, a floating stair, a halo light and a calacatta bar — from afternoon sun to a night of city lights as its own lights come on one by one",
  atelier:
    "A dark gallery room being styled — an onyx wall, lit arched niches and a glass cabinet — first empty, then furnished, then filled object by object, then lit for the evening by track spots",
};

/** The suite reports no caption of its own; name its stage from progress. */
function suiteStage(p: number) {
  return p < 0.25 ? "Line drawing" : p < 0.5 ? "White model" : p < 0.77 ? "Materials" : "Styled & lit";
}

/**
 * Each practice plays its model's story over PLAY_MS (concept to dusk, noon
 * to lamplight, sketch to styled, morning to lanterns), holds the finished,
 * fully lit state for HOLD_MS, then hands over to the next.
 */
const PLAY_MS = 2350;
const HOLD_MS = 600;

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * What We Do — one viewport. The services are a live index on the left; the
 * right is a single 3D canvas that runs through the four practices on its
 * own clock (only while the section is on screen). Choosing a practice in
 * the index jumps to it.
 */
export function ServicesSection({
  content,
  services = [],
}: {
  content?: Record<string, any>;
  services?: ServiceCard[];
}) {
  const c = withDefaults("home", "services", content);
  const sectionRef = useRef<HTMLElement>(null);
  const captionRef = useRef<HTMLSpanElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  /** The model's progress, 0–1, driven by the clock below. */
  const progress = useRef(0);
  /** Which model the canvas is actually showing (reported per frame). */
  const shownRef = useRef<SceneVariant | undefined>(undefined);
  const restartRef = useRef(false);

  const n = services.length;
  const models = useMemo(
    () => services.map((s, i) => MODEL_FOR_SLUG[s.slug] ?? FALLBACK_ORDER[i % FALLBACK_ORDER.length]),
    [services]
  );
  const modelsRef = useRef(models);
  modelsRef.current = models;

  const resetBars = (i: number) => {
    barRefs.current.forEach((el, k) => el && (el.style.transform = `scaleX(${k < i ? 1 : 0})`));
    segRefs.current.forEach((el, k) => el && (el.style.transform = `scaleX(${k < i ? 1 : 0})`));
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || n === 0) return;
    const reduced = prefersReducedMotion();
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(100, now - last);
      last = now;
      if (restartRef.current) {
        restartRef.current = false;
        elapsed = 0;
      }
      // The clock runs only while the section is seen and the right model
      // is on the canvas (a model that is still loading doesn't lose time).
      if (!visible || document.hidden || shownRef.current !== modelsRef.current[activeRef.current]) return;
      elapsed += dt;
      progress.current = reduced ? 1 : Math.min(1, elapsed / PLAY_MS);
      if (elapsed >= PLAY_MS + HOLD_MS && n > 1) {
        elapsed = 0;
        progress.current = 0;
        const next = (activeRef.current + 1) % n;
        activeRef.current = next;
        resetBars(next);
        setActive(next);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [n]);

  const jumpTo = (i: number) => {
    activeRef.current = i;
    progress.current = 0;
    restartRef.current = true;
    resetBars(i);
    setActive(i);
  };

  if (n === 0) return null;

  const svc = services[active];
  const model = models[active];

  return (
    <section
      id="services"
      ref={sectionRef}
      className="wwd relative mb-16 md:mb-24"
    >
      <div className="wwd-stage relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        {/* The model */}
        <figure className="wwd-figure m-0">
          <RoomScene
            variant={model}
            progressRef={progress}
            preload={models}
            label={MODEL_LABEL[model]}
            onState={({ p, label, variant }) => {
              shownRef.current = variant;
              const local = Math.min(1, Math.max(0, p));
              const i = activeRef.current;
              const bar = barRefs.current[i];
              if (bar) bar.style.transform = `scaleX(${local.toFixed(4)})`;
              const seg = segRefs.current[i];
              if (seg) seg.style.transform = `scaleX(${local.toFixed(4)})`;
              if (meterRef.current) meterRef.current.style.transform = `scaleX(${local.toFixed(4)})`;
              const text = models[i] === "bedroom" ? suiteStage(local) : label;
              if (text && captionRef.current && captionRef.current.textContent !== text) {
                captionRef.current.textContent = text;
              }
            }}
            className="absolute inset-0"
          />

          {/* HUD */}
          <div className="wwd-hud" aria-hidden="true">
            <span className="wwd-corner wwd-corner--tl" />
            <span className="wwd-corner wwd-corner--tr" />
            <span className="wwd-corner wwd-corner--bl" />
            <span className="wwd-corner wwd-corner--br" />
            <div className="wwd-hud-top">
              <span>Fig. 03 — {MODEL_NAME[model]}</span>
              <span className="wwd-hud-coords">17.3850° N · 78.4867° E</span>
            </div>
            <div className="wwd-hud-bottom">
              <span className="wwd-readout">
                <span className="wwd-readout-label">Light</span>
                <span className="wwd-meter">
                  <span ref={meterRef} />
                </span>
              </span>
              <span ref={captionRef} className="wwd-caption" />
            </div>
          </div>
        </figure>

        {/* The words */}
        <div className="wwd-panel">
          <div className="wwd-head">
            <span className="wwd-eyebrow">
              <i aria-hidden="true" />
              {c.eyebrow}
            </span>
            <Link href={c.linkHref} className="wwd-all fq-link">
              {c.linkLabel}
            </Link>
          </div>

          <div className="wwd-current" aria-live="polite">
            <div className="wwd-count">
              <b>{pad2(active + 1)}</b>
              <span>/ {pad2(n)}</span>
            </div>
            <h2 key={`t-${active}`} className="wwd-title">
              {svc.title}
            </h2>
            <p key={`d-${active}`} className="wwd-desc">
              {svc.desc}
            </p>
            <Link key={`l-${active}`} href={`/services/${svc.slug}`} className="wwd-cta">
              {c.cardCtaLabel}
            </Link>
          </div>

          {/* Index: every practice, with its share of the scroll */}
          <ol className="wwd-index">
            {services.map((s, i) => (
              <li key={s.slug}>
                <button
                  type="button"
                  onClick={() => jumpTo(i)}
                  aria-current={i === active ? "step" : undefined}
                  className={i === active ? "is-active" : i < active ? "is-done" : undefined}
                >
                  <span className="wwd-index-num">{pad2(i + 1)}</span>
                  <span className="wwd-index-name">{s.title}</span>
                  <span className="wwd-index-model">{MODEL_NAME[models[i]]}</span>
                  <span className="wwd-index-bar" aria-hidden="true">
                    <span
                      ref={(el) => {
                        barRefs.current[i] = el;
                      }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>

          {/* Phones: four tappable segments instead of the index */}
          <div className="wwd-segs">
            {services.map((s, i) => (
              <button key={s.slug} type="button" onClick={() => jumpTo(i)} aria-label={`Show ${s.title}`}>
                <span>
                  <span
                    ref={(el) => {
                      segRefs.current[i] = el;
                    }}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
