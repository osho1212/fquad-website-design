"use client";

import React from "react";

export function SignatureProject() {
  return (
    <section id="work" className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Full-Screen Background Photo (Zero Zoom / 100% Full Viewport) */}
      <img
        src="/assets/images/b21.jpg"
        alt="Barkatpura Residence living room"
        className="absolute inset-0 w-full h-full object-cover block z-0"
      />

      {/* Atmospheric Dark Gradient Overlay for Maximum Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none z-10" />

      {/* Content Overlay */}
      <div className="relative z-20 w-full h-full flex flex-col justify-between p-8 sm:p-14 pt-28 pb-14 max-w-7xl mx-auto">
        <div className="flex justify-between text-[9.5px] sm:text-[10px] tracking-[0.24em] text-white/70 uppercase">
          <span>SIGNATURE PROJECT</span>
          <span>01</span>
        </div>

        <div>
          <h2 className="m-0 font-semibold uppercase text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
            Barkatpura
            <br />
            Residence
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-5 sm:gap-8 justify-start mt-7 text-[9.5px] sm:text-[10px] tracking-[0.2em] text-white/80">
            <span>HYDERABAD</span>
            <span>INTERIORS</span>
            <span>RESIDENTIAL</span>
            <span>COMPLETED</span>
            <a
              href="#contact"
              className="text-[#c39a5f] font-medium hover:text-white transition-colors"
            >
              VIEW PROJECT →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
