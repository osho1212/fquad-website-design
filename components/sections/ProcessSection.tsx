"use client";

import React from "react";
import { withDefaults } from "@/lib/cms/schema";

interface Step {
  num: string;
  title: string;
  desc: string;
}

export function ProcessSection({ content }: { content?: Record<string, any> }) {
  const c = withDefaults("home", "process", content);
  const steps: Step[] = c.steps ?? [];

  return (
    <section className="px-6 sm:px-11 pb-28 bg-transparent">
      <div className="flex justify-between items-baseline border-t border-white/15 pt-6 mb-16">
        <div className="text-[10px] tracking-[0.24em] text-white/45 uppercase">
          {c.eyebrow}
        </div>
        <div className="text-[10px] tracking-[0.18em] text-white/45 uppercase">
          {c.label}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`lg:px-7 first:lg:pl-0 last:lg:pr-0 ${
              idx < steps.length - 1 ? "lg:border-r lg:border-white/15" : ""
            }`}
          >
            <div className="font-light text-3xl sm:text-4xl tracking-tighter text-white/30">
              {step.num}
            </div>
            <h3 className="m-0 mt-3 text-[11px] tracking-[0.22em] text-[#c0c0c0] uppercase font-semibold">
              {step.title}
            </h3>
            <p className="m-0 mt-2.5 text-xs sm:text-[13px] leading-relaxed text-white/60">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
