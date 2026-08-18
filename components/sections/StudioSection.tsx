"use client";

import React from "react";

export function StudioSection() {
  return (
    <section
      id="studio"
      className="relative overflow-hidden py-32 px-6 sm:px-11 border-t border-white/15 bg-transparent"
    >
      {/* Content */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[0.4fr_1fr] gap-11 max-w-7xl mx-auto">
        <div className="text-[10px] tracking-[0.24em] text-white/60 uppercase">
          THE STUDIO
        </div>

        <div>
          <p className="font-display m-0 font-light text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-[1.3] tracking-tight max-w-[32ch] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
            Founded in 2005, F.Quad Studio is an award-winning architecture and interior design practice based in Hyderabad.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 sm:gap-10 mt-10 max-w-[900px]">
            <p className="m-0 text-xs sm:text-sm leading-[1.8] text-white/75 drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]">
              Over the past two decades, we have delivered more than 500 residential, commercial, hospitality, retail, and institutional projects, combining thoughtful design with practical solutions and a client-first approach.
            </p>
            <p className="m-0 text-xs sm:text-sm leading-[1.8] text-white/75 drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]">
              Built on the principles of Functionality, Futuristic thinking, Friendly collaboration, and Flexibility, we create spaces that are purposeful, timeless, and tailored to the people who use them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
