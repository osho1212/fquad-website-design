"use client";

import React from "react";

const processSteps = [
  {
    num: "01",
    title: "BRIEF",
    desc: "We listen first. Understanding your vision, site, and lifestyle before a single line is drawn.",
  },
  {
    num: "02",
    title: "CONCEPT",
    desc: "Ideas take shape through sketches, models, and material exploration.",
  },
  {
    num: "03",
    title: "DEVELOPMENT",
    desc: "Concepts are refined into detailed designs and construction documents.",
  },
  {
    num: "04",
    title: "DELIVERY",
    desc: "We oversee execution to ensure the built result matches the design intent.",
  },
];

export function ProcessSection() {
  return (
    <section className="px-6 sm:px-11 pb-28 bg-transparent">
      <div className="flex justify-between items-baseline border-t border-white/15 pt-6 mb-16">
        <div className="text-[10px] tracking-[0.24em] text-white/45 uppercase">
          HOW WE WORK
        </div>
        <div className="text-[10px] tracking-[0.18em] text-white/45 uppercase">
          OUR PROCESS
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
        {processSteps.map((step, idx) => (
          <div
            key={step.num}
            className={`lg:px-7 first:lg:pl-0 last:lg:pr-0 ${
              idx < 3 ? "lg:border-r lg:border-white/15" : ""
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
