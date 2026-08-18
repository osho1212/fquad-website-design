"use client";

import React from "react";
import AccordionGallery from "../ui/AccordionGallery";

const recentProjects = [
  {
    image: "/assets/images/a3.jpg",
    label: "Jubilee Hills Residence",
    category: "Farmhouse & Estate",
    link: "#work",
    alt: "Private Farmhouse Residence Deck and Grounds at Dusk",
  },
  {
    image: "/assets/images/b25.jpg",
    label: "Barkatpura Residence",
    category: "Interior Architecture",
    link: "#work",
    alt: "Formal Seating at Barkatpura Residence",
  },
  {
    image: "/assets/images/a1.jpg",
    label: "Banjara Hills Villa",
    category: "Architecture & Facade",
    link: "#work",
    alt: "Residence Facade in Daylight",
  },
  {
    image: "/assets/images/b22.jpg",
    label: "Madhapur Penthouse",
    category: "Bespoke Interiors",
    link: "#work",
    alt: "Contemporary Dining and Living Space",
  },
  {
    image: "/assets/images/b61.jpg",
    label: "Gachibowli Estate",
    category: "Courtyard Villa",
    link: "#work",
    alt: "Minimalist Courtyard Residence",
  },
];

export function RecentWorks() {
  return (
    <section className="px-6 sm:px-11 pb-8 bg-transparent">
      {/* Section Header */}
      <div className="flex justify-between items-baseline border-t border-white/15 pt-6 mb-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-none bg-[#c39a5f]" />
          <span className="text-[10px] tracking-[0.24em] text-white/60 uppercase font-medium">
            FEATURED PROJECTS · RECENT WORKS
          </span>
        </div>
        <a
          href="/#work"
          className="text-[10px] tracking-[0.2em] text-[#c39a5f] hover:text-white transition-colors uppercase font-medium"
        >
          EXPLORE PORTFOLIO →
        </a>
      </div>

      {/* React Bits AccordionGallery Component */}
      <div className="max-w-7xl mx-auto">
        <AccordionGallery
          items={recentProjects}
          defaultIndex={1}
          expandRatio={0.48}
          height={520}
          gap={14}
          radius={0}
          accentColor="#c39a5f"
          overlayColor="#000000"
          textColor="#ffffff"
          duration={0.65}
          ease="power3.out"
          tilt={6}
          parallax={0.4}
          trigger="hover"
          grayscale={false}
          showLabels={true}
        />
      </div>

      {/* Bottom Subtext */}
      <div className="max-w-7xl mx-auto mt-6 flex flex-col sm:flex-row justify-between items-center text-[9.5px] tracking-[0.2em] text-white/40 uppercase">
        <span>INTERACTIVE ARCHITECTURAL SHOWCASE · HOVER TO EXPAND</span>
        <span>HYDERABAD · 2005 — PRESENT</span>
      </div>
    </section>
  );
}
