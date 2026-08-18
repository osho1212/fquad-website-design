"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import ElegantCarousel, { SlideData } from "../ui/elegant-carousel";

const fourFsSlides: SlideData[] = [
  {
    title: "FUNCTIONAL",
    fPrefix: "F",
    suffix: "UNCTIONAL",
    subtitle: "Purposeful & Ergonomic Architecture",
    description:
      "We believe every design should serve a purpose. Our spaces are planned to be efficient, comfortable, and intuitive while maintaining a strong aesthetic identity.",
    accent: "#C39A5F",
    imageUrl: "/assets/images/b21.jpg",
  },
  {
    title: "FUTURISTIC",
    fPrefix: "F",
    suffix: "UTURISTIC",
    subtitle: "Modern Materials & Smart Spatial Systems",
    description:
      "Design should look forward. We integrate modern materials, sustainable systems, and smart spatial planning so that spaces remain relevant for decades.",
    accent: "#8BA7B8",
    imageUrl: "/assets/images/a1.jpg",
  },
  {
    title: "FRIENDLY",
    fPrefix: "F",
    suffix: "RIENDLY",
    subtitle: "Warmth, Natural Light & Collaboration",
    description:
      "Architecture is for people. We focus on warmth, light, and natural connectivity — creating environments where people feel welcome and at ease.",
    accent: "#A3B899",
    imageUrl: "/assets/images/a3.jpg",
  },
  {
    title: "FLEXIBLE",
    fPrefix: "F",
    suffix: "LEXIBLE",
    subtitle: "Adaptable Living & Timeless Spatial Balance",
    description:
      "Spaces evolve as lifestyles change. Our layouts are adaptable, allowing rooms to shift between work, entertaining, and quiet contemplation with ease.",
    accent: "#D4A955",
    imageUrl: "/assets/images/b25.jpg",
  },
  {
    title: "F.QUAD",
    fPrefix: "F",
    suffix: ".QUAD",
    subtitle: "Four Faces · One Unified Practice",
    description:
      "The culmination of our philosophy. Functionality, Futuristic vision, Friendly collaboration, and Flexibility converge into purposeful, timeless architectural design.",
    accent: "#E6C687",
    imageUrl: "/assets/images/b22.jpg",
  },
];

export function FourFsSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);

  const numSlides = fourFsSlides.length;

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalScrollable = rect.height - vh;
      if (totalScrollable <= 0) return;

      // Scroll progress from 0.0 to 1.0
      const p = Math.max(0, Math.min(1, -rect.top / totalScrollable));

      // Calculate active slide index (0, 1, 2, 3)
      const exactIndex = p * numSlides;
      const currentIdx = Math.min(numSlides - 1, Math.floor(exactIndex));
      setActiveIndex(currentIdx);

      // Calculate progress percentage within the active slide (0% -> 100%)
      const segmentProgress = (exactIndex - currentIdx) * 100;
      setSlideProgress(Math.max(0, Math.min(100, segmentProgress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [numSlides]);

  const handleNavigate = useCallback(
    (targetIndex: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalScrollable = el.offsetHeight - window.innerHeight;
      const currentScrollY = window.scrollY || window.pageYOffset;
      const sectionTop = currentScrollY + rect.top;

      // Calculate scroll position corresponding to target slide
      const targetScrollY =
        sectionTop + (targetIndex / numSlides) * totalScrollable + 20;

      window.scrollTo({
        top: targetScrollY,
        behavior: "smooth",
      });
    },
    [numSlides]
  );

  return (
    <section
      id="philosophy"
      ref={containerRef}
      className="relative h-[480vh] bg-transparent text-white"
    >
      {/* Pinned Full-Screen Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 py-5 overflow-hidden">
        {/* Section Top Header Pill Bar */}
        <div className="w-full flex justify-between items-center mb-3 px-1">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-none bg-[#c39a5f] animate-pulse" />
            <span className="text-[10px] tracking-[0.24em] text-white/70 uppercase font-medium">
              FOUR FACES · ONE PRACTICE
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-[#c39a5f] uppercase font-medium">
            <span>SCROLL TO EXPLORE PHILOSOPHY</span>
            <span className="text-white/40">↓</span>
          </div>
        </div>

        {/* Full-Screen Elegant Carousel */}
        <div className="w-full flex-1 flex flex-col justify-center min-h-0">
          <ElegantCarousel
            slides={fourFsSlides}
            controlledIndex={activeIndex}
            controlledProgress={slideProgress}
            onNavigate={handleNavigate}
          />
        </div>
      </div>
    </section>
  );
}
