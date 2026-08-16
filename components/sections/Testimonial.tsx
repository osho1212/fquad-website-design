"use client";

import React from "react";

export function Testimonial() {
  return (
    <section className="px-6 sm:px-11 pb-32 grid grid-cols-1 md:grid-cols-[0.4fr_1fr] gap-8 md:gap-11 bg-transparent">
      <div className="text-[10px] tracking-[0.24em] text-white/45 uppercase">
        TESTIMONIAL
      </div>
      <div>
        <blockquote className="m-0 font-light text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-[1.24] tracking-tight max-w-[26ch] text-white">
          “F.QUAD transformed our home into a space that truly reflects who we are.”
        </blockquote>
        <div className="mt-7 text-[9.5px] tracking-[0.2em] text-[#c0c0c0] uppercase">
          CLIENT, JUBILEE HILLS RESIDENCE
        </div>
      </div>
    </section>
  );
}
