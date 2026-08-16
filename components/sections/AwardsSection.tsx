"use client";

import React from "react";

export function AwardsSection() {
  const awards = [
    "IIID",
    "Hafele Design Awards",
    "ELDORK India Architecture Awards",
    "Surfaces Reporter",
    "Times Design Icons South",
  ];

  return (
    <section id="awards" className="pb-28 bg-transparent">
      <div className="overflow-hidden border-t border-b border-white/15 py-5">
        <div className="animate-fq-marquee font-medium uppercase text-sm sm:text-base lg:text-lg tracking-tight whitespace-nowrap text-white">
          <div className="flex items-center gap-12 pr-12">
            {awards.map((award, i) => (
              <React.Fragment key={i}>
                <span>{award}</span>
                <span className="text-[#c0c0c0]">◇</span>
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-12 pr-12" aria-hidden="true">
            {awards.map((award, i) => (
              <React.Fragment key={`dup-${i}`}>
                <span>{award}</span>
                <span className="text-[#c0c0c0]">◇</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
