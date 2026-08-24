"use client";

import React from "react";
import AccordionGallery from "../ui/AccordionGallery";
import { pastProjects } from "@/lib/past-projects";

/**
 * Featured projects as a single full-page accordion. Hovering a panel expands
 * it; clicking opens that project's detail page. Carries the `#work` anchor
 * that the navbar, hero, footer, studio and services pages all link to.
 */
const items = pastProjects.map((project) => ({
  image: project.images[0],
  label: project.name,
  category: project.type,
  link: `/past-projects/${project.slug}`,
  alt: `${project.name} — ${project.type}`,
}));

export function FeaturedProjects() {
  return (
    <section
      id="work"
      className="relative w-full min-h-screen md:h-screen flex flex-col px-4 sm:px-8 md:px-12 pt-24 pb-8 bg-transparent"
    >
      {/* Section header */}
      <div className="flex justify-between items-baseline border-t border-white/15 pt-6 mb-6 w-full shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-none bg-[#c39a5f]" />
          <span className="text-[10px] tracking-[0.24em] text-white/60 uppercase font-medium">
            FEATURED PROJECTS · RECENT WORKS
          </span>
        </div>
        <a
          href="/past-projects"
          className="text-[10px] tracking-[0.2em] text-[#c39a5f] hover:text-white transition-colors uppercase font-medium"
        >
          EXPLORE PORTFOLIO →
        </a>
      </div>

      {/* Accordion fills the remaining viewport height */}
      <div className="w-full flex-1 min-h-0">
        <AccordionGallery
          items={items}
          defaultIndex={1}
          expandRatio={0.46}
          height="100%"
          visibleCount={3}
          loop
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

      {/* Bottom subtext */}
      <div className="w-full mt-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[9.5px] tracking-[0.2em] text-white/40 uppercase shrink-0">
        <span>
          INTERACTIVE ARCHITECTURAL SHOWCASE · HOVER TO EXPAND · SCROLL FOR MORE
        </span>
        <span>HYDERABAD · 2005 — PRESENT</span>
      </div>
    </section>
  );
}
