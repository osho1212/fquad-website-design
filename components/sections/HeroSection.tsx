"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStartProjectModal } from "@/components/ui/StartProjectModalContext";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { openModal } = useStartProjectModal();

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const frameCount = 114;
    const images: HTMLImageElement[] = [];
    const seq = { frame: 0 };

    const render = () => {
      const frameIdx = Math.min(frameCount - 1, Math.max(0, Math.round(seq.frame)));
      const img = images[frameIdx] || images[0];
      if (img && img.complete && img.naturalWidth) {
        if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }
        ctx.drawImage(img, 0, 0);
      }
    };

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.onload = () => {
        if (i === 1 || Math.round(seq.frame) === i - 1) {
          render();
        }
      };
      img.src = `/assets/hero-sequence/ezgif-frame-${i.toString().padStart(3, "0")}.jpg`;
      images.push(img);
    }

    // Try initial draw immediately in case first image is cached
    if (images[0] && images[0].complete) {
      render();
    }

    // GSAP ScrollTrigger:
    // 0.0 -> 0.45: frame scrubs 0 -> 150 (construction animation completes)
    // 0.45 -> 1.0: holds completely on frame 150 (the finished building)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      },
    });

    tl.to(seq, {
      frame: frameCount - 1,
      ease: "none",
      duration: 0.45,
      onUpdate: render,
    });

    // Hold on final frame for the remainder of the timeline
    tl.to({}, { duration: 0.55 });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  // 1. Initial State (SPACE IS OUR MEDIUM + CTAs):
  // Stays visible for at least 60% of the scroll timeline (0.00 -> 0.58), then fades out smoothly (0.58 -> 0.70)
  const initialTextOpacity =
    scrollProgress <= 0.58
      ? 1
      : Math.max(0, Math.min(1, 1 - (scrollProgress - 0.58) / 0.12));

  const initialTextTranslate =
    scrollProgress <= 0.58
      ? 0
      : Math.max(-30, Math.min(0, -(scrollProgress - 0.58) * 70));

  // 2. Surrounding Screen Darkening (Stationary Stencil):
  // Phase 1 (0.0 -> 0.45): Full construction animation scrubs on full-screen canvas
  // Phase 2 (0.45 -> 0.68): Full-screen final finished building holds with SPACE IS OUR MEDIUM overlay
  // Phase 3 (0.68 -> 0.88): Surrounding stage darkens into pitch-black around centered F.QUAD stencil
  let surroundingDarkness = 0;
  if (scrollProgress > 0.68) {
    surroundingDarkness = Math.min(1, Math.max(0, (scrollProgress - 0.68) / 0.2));
  }

  // 3. Settled Stencil Subtitle ("DISCOVER THE PRACTICE")
  const cueOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.86) / 0.12));

  return (
    <section id="top" ref={containerRef} className="relative h-[420vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black bg-[url('/assets/hero-sequence/ezgif-frame-001.jpg')] bg-cover bg-center flex flex-col justify-center items-center">
        {/* Layer 0: 114-Frame Construction Canvas (Full Screen Background) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover block z-0"
        />

        {/* Layer 1: Initial Full-Screen Hero View (SPACE IS OUR MEDIUM - +10% Font Size + Stays for 60% of Scroll) */}
        <div
          style={{
            opacity: initialTextOpacity,
            transform: `translateY(${initialTextTranslate}px)`,
            display: initialTextOpacity <= 0.01 ? "none" : "flex",
          }}
          className={`absolute bottom-0 left-0 right-0 z-10 w-full px-6 sm:px-11 pb-12 sm:pb-16 flex flex-col items-center justify-center text-center transition-all duration-75 ease-out ${initialTextOpacity > 0.3 ? "pointer-events-auto" : "pointer-events-none"
            }`}
        >
          <h1 className="m-0 font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl whitespace-nowrap leading-none tracking-tight text-white uppercase drop-shadow-[0_4px_35px_rgba(0,0,0,0.95)]">
            SPACE IS OUR MEDIUM
          </h1>

          <div className="flex items-center gap-3.5 mt-5 sm:mt-6">
            <a
              href="#work"
              className="btn-metallic text-[11px] sm:text-xs py-2 px-6 tracking-[0.2em] uppercase font-semibold"
            >
              EXPLORE WORK ↓
            </a>
            <button
              type="button"
              onClick={() => openModal()}
              className="text-[9.5px] tracking-[0.2em] px-4 py-2 border border-white/40 hover:border-white text-white rounded-none transition-colors uppercase bg-black/50 backdrop-blur-md cursor-pointer"
            >
              START A PROJECT
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 text-white/50 text-[9.5px] tracking-[0.24em] uppercase mt-7 pointer-events-none">
            <span>SCROLL TO EXPLORE</span>
            <div className="w-[1px] h-5 bg-gradient-to-b from-white/60 to-transparent animate-bounce" />
          </div>
        </div>

        {/* Layer 1.5: White Illumination Overlay behind Stencil to make F.QUAD Pop */}
        <div
          style={{
            opacity: surroundingDarkness * 0.0,
            display: surroundingDarkness <= 0.01 ? "none" : "block",
          }}
          className="absolute inset-0 z-15 pointer-events-none transition-opacity duration-75 ease-out bg-white"
        />
        <div
          style={{
            opacity: surroundingDarkness * 0.67,
            display: surroundingDarkness <= 0.01 ? "none" : "block",
          }}
          className="absolute inset-0 z-15 pointer-events-none transition-opacity duration-75 ease-out bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.4)_45%,transparent_75%)]"
        />

        {/* Layer 2: Pitch-Black Stencil Mask Layer (Full Screen Cover on ALL Screen Sizes) */}
        <div
          style={{
            opacity: surroundingDarkness,
            display: surroundingDarkness <= 0.01 ? "none" : "block",
          }}
          className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-75 ease-out w-full h-full overflow-hidden"
        >
          {/* SVG Stationary Stencil Mask: Solid Black Stage */}
          <svg
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full absolute inset-0 block"
          >
            <defs>
              <mask id="fquad-stationary-stencil">
                {/* White background: keeps surrounding black stage visible */}
                <rect x="-2000" y="-2000" width="6000" height="5000" fill="white" />

                {/* Black centered cutout: punches transparent hole showing finished building canvas inside */}
                <text
                  x="960"
                  y="480"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="black"
                  fontFamily="Good Times, sans-serif"
                  fontWeight="bold"
                  fontSize="150"
                  letterSpacing="0.08em"
                >
                  F.QUAD
                </text>
                <text
                  x="960"
                  y="585"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="black"
                  fontFamily="Good Times, sans-serif"
                  fontWeight="500"
                  fontSize="24"
                  letterSpacing="0.18em"
                >
                  ARCHITECTURE &amp; INTERIOR DESIGN STUDIO
                </text>
                <text
                  x="960"
                  y="635"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="black"
                  fontFamily="Good Times, sans-serif"
                  fontWeight="500"
                  fontSize="18"
                  letterSpacing="0.22em"
                >
                  BY AMIT &amp; ASHMI
                </text>
              </mask>
            </defs>

            {/* Oversized Solid Black Stage */}
            <rect
              x="-2000"
              y="-2000"
              width="6000"
              height="5000"
              fill="#000000"
              mask="url(#fquad-stationary-stencil)"
            />
          </svg>

          {/* Subtle Golden Blueprint Arcs & Architectural Grid on the Dark Stage */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-[75vw] max-w-4xl aspect-square border border-[#c39a5f]/25 rounded-full animate-pulse" />
            <div className="w-[50vw] max-w-2xl aspect-square border border-[#c39a5f]/20 rounded-full" />
            <div className="w-[30vw] max-w-md aspect-square border border-dashed border-[#c39a5f]/25 rounded-full" />
          </div>
        </div>

        {/* Layer 3: Settled Subtitle Navigation Cue */}
        <div
          style={{
            opacity: cueOpacity,
            display: cueOpacity <= 0.01 ? "none" : "flex",
          }}
          className="absolute bottom-10 z-30 pointer-events-none flex flex-col items-center gap-2 text-white/60 text-[10px] tracking-[0.24em] uppercase transition-opacity duration-150"
        >
          <span className="text-[#c39a5f] font-medium">DISCOVER THE PRACTICE</span>
          <div className="w-[1px] h-6 bg-gradient-to-b from-[#c39a5f] to-transparent animate-bounce" />
        </div>
      </div>
    </section>
  );
}
