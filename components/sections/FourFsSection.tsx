"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { FourFacesStage, type FaceSlide } from "../ui/FourFacesStage";
import { withDefaults } from "@/lib/cms/schema";
import { scrollToY } from "@/lib/motion";

interface FaceContent {
  title: string;
  subtitle: string;
  accent: string;
  image: string;
}

/**
 * The studio's line for each face, used when the CMS face has no body copy
 * of its own (the CMS stores a title, subtitle, accent and image).
 */
const FACE_COPY: Record<string, string> = {
  FUNCTIONAL:
    "Every design should serve a purpose. Our spaces are planned to be efficient, comfortable and intuitive, with a strong identity of their own.",
  FUTURISTIC:
    "Design should look forward. Modern materials, sustainable systems and smart planning keep a space relevant for decades.",
  FRIENDLY:
    "Architecture is for people. Warmth, light and natural connection make places where people feel welcome and at ease.",
  FLEXIBLE:
    "Spaces evolve as lives change. Our layouts adapt, moving between work, entertaining and quiet with ease.",
  "F.QUAD":
    "Function, foresight, warmth and flexibility, converging into purposeful, enduring spaces.",
};

function toSlide(face: FaceContent): FaceSlide {
  const title = face.title ?? "";
  return {
    title,
    subtitle: face.subtitle,
    description: FACE_COPY[title.trim().toUpperCase()],
    accent: face.accent,
    imageUrl: face.image,
  };
}

/** How long each face holds before advancing on its own. */
const AUTOPLAY_DELAY_MS = 2500;
/** Quiet period after a manual scroll before autoplay takes over again. */
const RESUME_AFTER_INPUT_MS = 1200;

export function FourFsSection({ content }: { content?: Record<string, any> }) {
  const c = withDefaults("home", "four_fs", content);
  const slides = useMemo(
    () => ((c.slides ?? []) as FaceContent[]).map(toSlide),
    [c.slides]
  );

  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  // Autoplay only runs while the section is pinned and filling the viewport.
  const [isPinned, setIsPinned] = useState(false);
  const activeIndexRef = useRef(0);
  const lastInputRef = useRef(0);

  const numSlides = slides.length;

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    // Read on the next frame, at most once per frame, and only re-render when
    // the face or a whole percent of progress changes (it used to set state
    // on every scroll event, re-rendering the stage dozens of times a second).
    let raf = 0;
    let lastPinned: boolean | null = null;
    let lastIdx = -1;
    let lastPct = -1;
    const measure = () => {
      raf = 0;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = stageRef.current?.clientHeight || window.innerHeight;
      const pinned = rect.top <= 1 && rect.bottom >= vh - 1;
      if (pinned !== lastPinned) {
        lastPinned = pinned;
        setIsPinned(pinned);
      }
      const totalScrollable = rect.height - vh;
      if (totalScrollable <= 0) return;

      // Scroll progress from 0.0 to 1.0
      const p = Math.max(0, Math.min(1, -rect.top / totalScrollable));

      // Calculate active slide index (0, 1, 2, 3)
      const exactIndex = p * numSlides;
      const currentIdx = Math.min(numSlides - 1, Math.floor(exactIndex));
      if (currentIdx !== lastIdx) {
        lastIdx = currentIdx;
        setActiveIndex(currentIdx);
      }

      // Calculate progress percentage within the active slide (0% -> 100%)
      const segmentProgress = (exactIndex - currentIdx) * 100;
      const pct = Math.round(Math.max(0, Math.min(100, segmentProgress)));
      if (pct !== lastPct) {
        lastPct = pct;
        setSlideProgress(pct);
      }
    };
    const handleScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    measure();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [numSlides]);

  const handleNavigate = useCallback(
    (targetIndex: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = stageRef.current?.clientHeight || window.innerHeight;
      const totalScrollable = el.offsetHeight - vh;
      const currentScrollY = window.scrollY || window.pageYOffset;
      const sectionTop = currentScrollY + rect.top;

      // Calculate scroll position corresponding to target slide
      const targetScrollY =
        sectionTop + (targetIndex / numSlides) * totalScrollable + 20;

      // Through Lenis when it's running, so the glide shares its easing.
      scrollToY(targetScrollY, { duration: 1.1 });
    },
    [numSlides]
  );

  // Manual scrolling wins: note when the visitor drives so autoplay can wait.
  // Only real input counts — a smooth programmatic scroll fires `scroll`, never
  // `wheel`/`touchmove`/`keydown`, so autoplay never mistakes itself for input.
  useEffect(() => {
    const mark = () => {
      lastInputRef.current = Date.now();
    };
    const opts = { passive: true } as const;
    window.addEventListener("wheel", mark, opts);
    window.addEventListener("touchmove", mark, opts);
    window.addEventListener("keydown", mark);
    return () => {
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchmove", mark);
      window.removeEventListener("keydown", mark);
    };
  }, []);

  // Advance to the next face on a timer while the section is pinned. Stops on
  // the last face rather than looping, so the visitor is free to scroll onward.
  useEffect(() => {
    if (!isPinned) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      if (Date.now() - lastInputRef.current < RESUME_AFTER_INPUT_MS) return;
      const next = activeIndexRef.current + 1;
      if (next >= numSlides) return;
      handleNavigate(next);
    }, AUTOPLAY_DELAY_MS);

    return () => window.clearInterval(id);
  }, [isPinned, numSlides, handleNavigate]);

  // Every face was removed in the CMS — drop the pinned section entirely
  // rather than pin an empty 480vh viewport.
  if (slides.length === 0) return null;

  return (
    <section
      id="philosophy"
      ref={containerRef}
      className="relative h-[480vh] bg-transparent text-white"
    >
      {/* Pinned full-bleed stage: the photograph is the backdrop, the words
          and the index sit on it. */}
      <div ref={stageRef} className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <FourFacesStage
          slides={slides}
          index={activeIndex}
          progress={slideProgress}
          eyebrow={c.eyebrow}
          hint={c.hint}
          onNavigate={handleNavigate}
        />
      </div>
    </section>
  );
}
