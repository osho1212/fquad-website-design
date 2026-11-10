"use client";

import React, { useEffect, useRef, useState } from "react";
import { defaultsFor, withDefaults } from "@/lib/cms/schema";
import { InView } from "@/components/motion/InView";
import { SketchFrame, sketchImageFromSrc, type SketchFrameImage } from "@/components/ui/SketchFrame";
import { clamp, onFrame, prefersReducedMotion } from "@/lib/motion";

interface Step {
  num: string;
  title: string;
  desc: string;
  /** The step's photograph (Homepage → How We Work in the CMS). */
  image?: string;
  imageAlt?: string;
}

/** The steps and photographs that ship with the site. */
const SHIPPED_STEPS = (defaultsFor("home", "process").steps ?? []) as Step[];

/**
 * The photograph for a step, drawn in pencil as it comes into view. It is the
 * one chosen in the CMS; a photo that ships with the site brings its own rough
 * sketch and pencil drawing (built by `npm run sketch:images`), while an upload
 * is drawn as a graphite print of itself. A step with no photograph (or whose
 * picture was deleted) takes the shipped one for its position.
 */
function stepImage(step: Step, idx: number): SketchFrameImage {
  const shipped = SHIPPED_STEPS.length ? SHIPPED_STEPS[idx % SHIPPED_STEPS.length] : undefined;
  const chosen = step.image?.trim();
  if (!chosen && shipped?.image) {
    return sketchImageFromSrc(shipped.image, shipped.imageAlt ?? `${step.title}: a project photograph`);
  }
  return sketchImageFromSrc(
    chosen || "",
    step.imageAlt?.trim() || `${step.title}: a project photograph`
  );
}

/**
 * "How we work": the section pins and, step by step, each step's
 * photo is drawn in pencil as you scroll (a rough sketch, then the finished
 * drawing, then colour). On desktop all four steps sit beside the frame with a
 * vertical progress spine; on phones the active step crossfades beneath the
 * pinned frame with a horizontal progress rule so the whole stage fits 100svh.
 */
export function ProcessSection({ content }: { content?: Record<string, any> }) {
  const c = withDefaults("home", "process", content);
  const steps: Step[] = c.steps ?? [];

  const trackRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const mobileFillRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  /** The active step's own progress (0–1), written by the frame loop below. */
  const stepProgress = useRef(0);
  const [wide, setWide] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Drives the step highlight, progress rule and readout from the pinned
  // section's scroll progress. Runs only while the section is on screen.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || steps.length === 0) return;

    let stop: (() => void) | null = null;
    let lastIdx = -1;

    const run = () => {
      const vh = stickyRef.current?.clientHeight || window.innerHeight;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
      if (idx !== lastIdx) {
        lastIdx = idx;
        setActive(idx);
        if (stageRef.current) {
          stageRef.current.textContent = `Stage ${String(idx + 1).padStart(2, "0")} / ${String(
            steps.length
          ).padStart(2, "0")}`;
        }
      }
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p.toFixed(4)})`;
      if (mobileFillRef.current) mobileFillRef.current.style.transform = `scaleX(${p.toFixed(4)})`;

      // The active step's own progress drives its sketch → photo. Step 01 gets
      // a lead-in: its rough sketch (the first quarter) is drawn while the
      // section scrolls into view, so the frame is never blank paper on arrival.
      const local = clamp(p * steps.length - idx);
      stepProgress.current =
        idx === 0 ? 0.25 * clamp(1 - r.top / vh) + 0.75 * local : local;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !stop) stop = onFrame(run);
        else if (!entry.isIntersecting && stop) {
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
  }, [steps.length]);

  const reduced = typeof window !== "undefined" && prefersReducedMotion();

  return (
    <section
      id="process"
      ref={trackRef}
      className="relative px-6 sm:px-11 h-[380vh] md:h-[420vh] bg-transparent"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-[100svh] md:h-screen flex flex-col py-6 sm:py-8 md:py-12 overflow-hidden"
      >
        <InView className="relative flex justify-between items-baseline pt-4 md:pt-6 mb-4 sm:mb-6 md:mb-6 shrink-0">
          <span
            aria-hidden="true"
            className="fq-rule absolute top-0 left-0 right-0 h-px bg-white/25"
          />
          <div className="fq-fade text-[11px] tracking-[0.24em] text-white/45 uppercase">
            {c.eyebrow}
          </div>
          <div
            className="fq-fade text-[11px] tracking-[0.18em] text-white/45 uppercase"
            style={{ ["--i" as string]: 1 }}
          >
            {c.label}
          </div>
        </InView>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1fr_1.05fr] grid-rows-[1fr_auto] md:grid-rows-1 gap-5 sm:gap-7 md:gap-10 lg:gap-16 items-center">
          {/* Steps */}
          <ol className="relative m-0 p-0 list-none order-2 md:order-1 grid md:flex md:flex-col md:gap-0 md:justify-between md:h-[min(62vh,560px)] pt-3 md:pt-0">
            {/* progress rule (mobile) */}
            <span
              aria-hidden="true"
              className="md:hidden absolute left-0 right-0 top-0 h-px bg-white/15"
            />
            <div
              ref={mobileFillRef}
              aria-hidden="true"
              className="md:hidden absolute left-0 right-0 top-0 h-px bg-white origin-left"
              style={{ transform: "scaleX(0)" }}
            />
            {/* progress spine (desktop) */}
            <span
              aria-hidden="true"
              className="hidden md:block absolute left-[-20px] top-0 bottom-0 w-px bg-white/15"
            />
            <div
              ref={fillRef}
              aria-hidden="true"
              className="hidden md:block absolute left-[-20px] top-0 bottom-0 w-px bg-white origin-top"
              style={{ transform: "scaleY(0)" }}
            />

            {steps.map((step, idx) => {
              const isCurrent = idx === active;
              const opacity = wide ? (reduced || isCurrent ? 1 : 0.32) : isCurrent ? 1 : 0;
              return (
                <li
                  key={idx}
                  data-step={idx}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`relative max-md:[grid-area:1/1] grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-7 transition-opacity duration-500 ease-out${
                    !wide && !isCurrent ? " pointer-events-none" : ""
                  }`}
                  style={{ opacity }}
                >
                  <span
                    className="font-light text-4xl sm:text-5xl lg:text-6xl leading-[0.9] tracking-tighter tabular-nums fq-outline"
                    aria-hidden="true"
                  >
                    {step.num}
                  </span>
                  <div>
                    <h3 className="m-0 text-[11px] tracking-[0.22em] text-[#c0c0c0] uppercase font-semibold">
                      {step.title}
                    </h3>
                    <p className="m-0 mt-2 sm:mt-2.5 text-xs sm:text-[13px] leading-relaxed text-white/65 max-w-[44ch]">
                      {step.desc}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* The tower */}
          <figure
            ref={figureRef}
            className="fq-frame relative m-0 order-1 md:order-2 w-full h-full min-h-[200px] max-h-[50svh] sm:max-h-[55svh] md:max-h-none md:h-[min(72vh,680px)]"
          >
            <SketchFrame
              images={steps.map(stepImage)}
              active={active}
              progressRef={stepProgress}
              onProgress={(_t, color) =>
                figureRef.current?.style.setProperty("--sketch-color", color.toFixed(3))
              }
            />
            <span className="fq-sketch-scrim" aria-hidden="true" />
            <span className="fq-frame-b" aria-hidden="true" />
            <figcaption className="fq-sketch-caption absolute left-3 right-3 bottom-3 flex justify-between gap-3 text-[11px] tracking-[0.22em] uppercase pointer-events-none">
              {/* Single-string children: these nodes are rewritten from the
                  frame loop, so React must own exactly one text node each. */}
              <span ref={stageRef}>{`Stage 01 / ${String(steps.length).padStart(2, "0")}`}</span>
              <span>Fig. 02 — Process</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
