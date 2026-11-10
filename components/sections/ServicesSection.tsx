"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { withDefaults } from "@/lib/cms/schema";
import { scrollToY } from "@/lib/motion";
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
 * Each service owns an equal share of the pinned scroll. Within its share
 * the model plays from 0 to 1, then holds fully lit for the last stretch
 * so the finished state is seen before the next practice takes over.
 */
const PLAY = 0.86;

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * What We Do — one pinned viewport. The services are a live index on the
 * left; the right is a single 3D canvas whose model and light follow the
 * scroll: the residence goes from concept to lit dusk, the salon from noon
 * to lamplight, the suite from sketch to styled, the farmhouse from
 * morning to lanterns.
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

  const n = services.length;
  const models = useMemo(
    () => services.map((s, i) => MODEL_FOR_SLUG[s.slug] ?? FALLBACK_ORDER[i % FALLBACK_ORDER.length]),
    [services]
  );

  // Which service the scroll is in. The model's own (eased) progress drives
  // the bars and readouts, via onState below.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || n === 0) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const P = Math.min(1, Math.max(0, -r.top / span));
      const i = Math.min(n - 1, Math.floor(P * n));
      if (i !== activeRef.current) {
        activeRef.current = i;
        setActive(i);
      }
      // Bars for the services already passed / not yet reached.
      barRefs.current.forEach((b, k) => {
        if (b && k !== i) b.style.transform = `scaleX(${k < i ? 1 : 0})`;
      });
      segRefs.current.forEach((b, k) => {
        if (b && k !== i) b.style.transform = `scaleX(${k < i ? 1 : 0})`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [n]);

  const mapProgress = useCallback(
    (P: number) => {
      if (n === 0) return P;
      const i = Math.min(n - 1, Math.floor(P * n));
      return (P * n - i) / PLAY;
    },
    [n]
  );

  const jumpTo = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    scrollToY(top + (i / n) * span + 4, { duration: 1.2 });
  };

  if (n === 0) return null;

  const svc = services[active];
  const model = models[active];

  return (
    <section
      id="services"
      ref={sectionRef}
      className="wwd relative"
      style={{ height: `${n * 95 + 100}vh` }}
    >
      <div className="wwd-stage sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* The model */}
        <figure className="wwd-figure m-0">
          <RoomScene
            variant={model}
            trackRef={sectionRef}
            mapProgress={mapProgress}
            preload={models.filter((m, i) => i !== 0 && models.indexOf(m) === i)}
            label={MODEL_LABEL[model]}
            onState={({ p, label }) => {
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
