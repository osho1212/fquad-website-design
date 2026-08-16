"use client";

import React from "react";
import ElegantCarousel, { SlideData } from "../ui/elegant-carousel";

const fourFsSlides: SlideData[] = [
  {
    title: "FUNCTIONAL",
    subtitle: "Purposeful & Ergonomic Architecture",
    description:
      "We believe every design should serve a purpose. Our spaces are planned to be efficient, comfortable, and intuitive while maintaining a strong aesthetic identity.",
    accent: "#C39A5F",
    imageUrl: "/assets/images/b21.jpg",
  },
  {
    title: "FUTURISTIC",
    subtitle: "Modern Materials & Smart Spatial Systems",
    description:
      "Design should look forward. We integrate modern materials, sustainable systems, and smart spatial planning so that spaces remain relevant for decades.",
    accent: "#8BA7B8",
    imageUrl: "/assets/images/a1.jpg",
  },
  {
    title: "FRIENDLY",
    subtitle: "Warmth, Natural Light & Collaboration",
    description:
      "Architecture is for people. We focus on warmth, light, and natural connectivity — creating environments where people feel welcome and at ease.",
    accent: "#A3B899",
    imageUrl: "/assets/images/a3.jpg",
  },
  {
    title: "FLEXIBLE",
    subtitle: "Adaptable Living & Timeless Spatial Balance",
    description:
      "Spaces evolve as lifestyles change. Our layouts are adaptable, allowing rooms to shift between work, entertaining, and quiet contemplation with ease.",
    accent: "#D4A955",
    imageUrl: "/assets/images/b25.jpg",
  },
];

export function FourFsSection() {
  return (
    <section id="philosophy" className="pt-6 pb-12 px-6 sm:px-11 bg-transparent text-white">
      {/* Section Header */}
      <div className="flex justify-between items-baseline border-t border-white/15 pt-6 mb-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c39a5f]" />
          <span className="text-[10px] tracking-[0.24em] text-white/60 uppercase font-medium">
            FOUR FACES · ONE PRACTICE
          </span>
        </div>
        <span className="text-[10px] tracking-[0.2em] text-[#c39a5f] uppercase font-medium">
          WHAT'S BEHIND THE NAME →
        </span>
      </div>

      {/* Elegant Carousel Implementation */}
      <div className="max-w-7xl mx-auto">
        <ElegantCarousel slides={fourFsSlides} />
      </div>
    </section>
  );
}
