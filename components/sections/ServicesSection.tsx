"use client";

import React from "react";

const servicesList = [
  {
    num: "01",
    title: "Architecture",
    desc: "Residential, commercial, and hospitality spaces designed around climate and context.",
  },
  {
    num: "02",
    title: "Interior Design",
    desc: "Material, light, and layout brought together with quiet precision.",
  },
  {
    num: "03",
    title: "Landscape",
    desc: "Outdoor spaces that extend the architecture into its surroundings.",
  },
  {
    num: "04",
    title: "Commercial Fit-out",
    desc: "Workplace and retail interiors built for how people actually use them.",
  },
  {
    num: "05",
    title: "Hospitality Design",
    desc: "Restaurants, cafes, and hotels designed for atmosphere and flow.",
  },
  {
    num: "06",
    title: "Space Planning",
    desc: "Layouts that resolve function first, so the design can follow.",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="pt-8 pb-20 px-6 sm:px-11 bg-transparent">
      <div className="flex justify-between items-baseline border-t border-white/15 pt-6 mb-8">
        <div className="text-[10px] tracking-[0.24em] text-white/45 uppercase">
          WHAT WE DO
        </div>
        <a
          href="#contact"
          className="text-[10px] tracking-[0.18em] text-[#c0c0c0] hover:text-white transition-colors"
        >
          ALL SERVICES →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/15 rounded-lg overflow-hidden border border-white/15">
        {servicesList.map((svc) => (
          <div
            key={svc.num}
            className="bg-black/60 backdrop-blur-md p-8 sm:p-10 hover:bg-black/40 transition-colors duration-300 group"
          >
            <div className="text-[10px] text-[#c0c0c0] tracking-[0.2em]">
              {svc.num}
            </div>
            <h3 className="m-0 mt-5 font-medium text-base sm:text-lg md:text-xl tracking-tight text-white group-hover:text-brass transition-colors">
              {svc.title}
            </h3>
            <p className="m-0 mt-2.5 text-xs sm:text-[13px] leading-relaxed text-white/60">
              {svc.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
