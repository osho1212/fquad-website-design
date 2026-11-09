"use client";

import React, { useEffect, useRef, useState } from "react";
import { withDefaults } from "@/lib/cms/schema";
import { InView } from "@/components/motion/InView";
import { RoomScene } from "@/components/three/RoomScene";
import { BEDROOM_PIECES, bedroomPlaced } from "@/components/three/lux/suiteStages";
import { clamp, onFrame, prefersReducedMotion } from "@/lib/motion";

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
  const piecesRef = useRef<HTMLSpanElement>(null);
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
      if (piecesRef.current) {
        const placed = bedroomPlaced(p);
        piecesRef.current.textContent = `${String(placed).padStart(2, "0")} / ${BEDROOM_PIECES}`;
      }
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
          <figure className="fq-frame relative m-0 order-1 lg:order-2 h-[52vh] sm:h-[58vh] lg:h-[min(72vh,680px)]">
            <RoomScene
              variant="bedroom"
              trackRef={wide ? trackRef : undefined}
              // On phones there is no pin: finish building while the frame is
              // still near the middle of the screen.
              range={wide ? undefined : [0.05, 0.5]}
              className="absolute inset-0"
              label="A 3D bedroom that moves from a bare shell, to clay massing, to real furniture, to a fully styled room as the design-process stages scroll by"
            />
            <span className="fq-frame-b" aria-hidden="true" />
            <figcaption className="absolute left-3 right-3 bottom-3 flex justify-between text-[11px] tracking-[0.22em] uppercase text-white/55 pointer-events-none">
              {/* Single-string children: these nodes are rewritten from the
                  frame loop, so React must own exactly one text node each.
                  The live readout only exists where the section pins; on
                  phones it would show stale numbers, so it's a plain label. */}
              {wide ? (
                <>
                  <span ref={stageRef}>{`Stage 01 / ${String(steps.length).padStart(2, "0")}`}</span>
                  <span>
                    Pieces{" "}
                    <span ref={piecesRef} className="tabular-nums">
                      {`00 / ${BEDROOM_PIECES}`}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <span>Fig. 02 — Process</span>
                  <span>Scroll to build</span>
                </>
              )}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
