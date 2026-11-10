"use client";

import React, { useEffect, useRef, useState } from "react";
import { withDefaults } from "@/lib/cms/schema";
import { InView } from "@/components/motion/InView";
import Magnet, { FRAME_MAGNET } from "@/components/ui/Magnet";
import { clamp, onFrame, prefersReducedMotion } from "@/lib/motion";

/**
 * Project photos shown as the process advances. They are spread across however
 * many steps the CMS defines (one image per step, first to last).
 */
const PROCESS_IMAGES = [
  { src: "/assets/images/b21.jpg", alt: "A living room with a carved ceiling and a tufted sofa" },
  { src: "/assets/images/b49.jpg", alt: "A blue-panelled living room with an arched mural" },
  { src: "/assets/images/b23.jpg", alt: "Carved timber and amber-glass doors opening onto a stone floor" },
  { src: "/assets/images/b61.jpg", alt: "A living room with curtains, a curved sofa and a marble floor" },
  { src: "/assets/images/a2.jpg", alt: "The finished residence at dusk, its lights on" },
];

/** The image for step `i` of `n`, spread evenly across the list. */
function imageForStep(i: number, n: number) {
  const k = n <= 1 ? 0 : Math.round((i * (PROCESS_IMAGES.length - 1)) / (n - 1));
  return PROCESS_IMAGES[Math.min(PROCESS_IMAGES.length - 1, k)];
}

interface Step {
  num: string;
  title: string;
  desc: string;
}

/**
 * "How we work", with the process made physical: on desktop the section pins
 * and a 3D tower rises floor by floor, one stage per step, as you scroll. On
 * smaller screens it relaxes to a plain stacked list with the model above.
 */
export function ProcessSection({ content }: { content?: Record<string, any> }) {
  const c = withDefaults("home", "process", content);
  const steps: Step[] = c.steps ?? [];

  const trackRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const [wide, setWide] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Without the pin (phones/tablets) the steps stack, so the photo follows
  // whichever step is crossing the middle of the screen.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || wide || steps.length === 0) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-step]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    items.forEach((it) => io.observe(it));
    return () => io.disconnect();
  }, [wide, steps.length]);

  // Drives the step highlight, progress rule and readout from the pinned
  // section's scroll progress. Runs only while the section is on screen.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !wide || steps.length === 0) return;

    let stop: (() => void) | null = null;
    let lastIdx = -1;

    const run = () => {
      const vh = window.innerHeight;
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
  }, [wide, steps.length]);

  const reduced = typeof window !== "undefined" && prefersReducedMotion();

  return (
    <section
      id="process"
      ref={trackRef}
      className="relative px-6 sm:px-11 pb-24 lg:pb-0 lg:h-[420vh] bg-transparent"
    >
      <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col lg:py-12">
        <InView className="relative flex justify-between items-baseline pt-6 mb-10 lg:mb-6 shrink-0">
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

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-16 items-center">
          {/* Steps */}
          <ol className="relative m-0 p-0 list-none order-2 lg:order-1 flex flex-col gap-9 lg:gap-0 lg:justify-between lg:h-[min(62vh,560px)]">
            {/* progress spine (desktop) */}
            <span
              aria-hidden="true"
              className="hidden lg:block absolute left-[-20px] top-0 bottom-0 w-px bg-white/15"
            />
            <div
              ref={fillRef}
              aria-hidden="true"
              className="hidden lg:block absolute left-[-20px] top-0 bottom-0 w-px bg-white origin-top"
              style={{ transform: "scaleY(0)" }}
            />

            {steps.map((step, idx) => {
              const on = !wide || reduced || idx === active;
              return (
                <li
                  key={idx}
                  data-step={idx}
                  aria-current={wide && idx === active ? "step" : undefined}
                  className="relative grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-7 transition-opacity duration-500 ease-out"
                  style={{ opacity: on ? 1 : 0.32 }}
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
                    <p className="m-0 mt-2.5 text-xs sm:text-[13px] leading-relaxed text-white/65 max-w-[44ch]">
                      {step.desc}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* The tower */}
          <Magnet
            {...FRAME_MAGNET}
            wrapperClassName="order-1 lg:order-2"
            style={{ display: "block", width: "100%" }}
          >
          <figure className="fq-frame relative m-0 h-[52vh] sm:h-[58vh] lg:h-[min(72vh,680px)]">
            <div className="absolute inset-0 overflow-hidden bg-[#0a0a0a]">
              {steps.map((_, idx) => {
                const img = imageForStep(idx, steps.length);
                const on = idx === active;
                return (
                  <img
                    key={idx}
                    src={img.src}
                    alt={on ? img.alt : ""}
                    aria-hidden={on ? undefined : true}
                    draggable={false}
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      opacity: on ? 1 : 0,
                      transform: on ? "scale(1)" : "scale(1.07)",
                      transition: "opacity 800ms ease, transform 1600ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                );
              })}
            </div>
            <span className="fq-frame-b" aria-hidden="true" />
            <figcaption className="absolute left-3 right-3 bottom-3 flex justify-between gap-3 text-[11px] tracking-[0.22em] uppercase text-white/70 pointer-events-none">
              {/* Single-string children: these nodes are rewritten from the
                  frame loop, so React must own exactly one text node each.
                  The live readout only exists where the section pins; on
                  phones it would show stale numbers, so it's a plain label. */}
              {wide ? (
                <>
                  <span ref={stageRef}>{`Stage 01 / ${String(steps.length).padStart(2, "0")}`}</span>
                  <span>Fig. 02 — Process</span>
                </>
              ) : (
                <>
                  <span>Fig. 02 — Process</span>
                  <span>Scroll to build</span>
                </>
              )}
            </figcaption>
          </figure>
          </Magnet>
        </div>
      </div>
    </section>
  );
}
