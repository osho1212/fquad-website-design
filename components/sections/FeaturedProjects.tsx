"use client";

import React, { useEffect, useRef, useState } from "react";
import AccordionGallery from "../ui/AccordionGallery";
import { ProjectSwipe } from "../ui/ProjectSwipe";
import { withDefaults } from "@/lib/cms/schema";
import { InView } from "@/components/motion/InView";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";
import { prefersReducedMotion } from "@/lib/motion";

const WORK_ART: ParallaxItem[] = [
  { art: "compass", x: "90%", y: "2%", w: 96, depth: 0.5, spin: 40, opacity: 0.3, desktopOnly: true },
  { art: "cross", x: "3%", y: "9%", w: 30, depth: 0.8, spin: 90, opacity: 0.3 },
  { art: "dimension", x: "34%", y: "-1%", w: 220, depth: 0.3, opacity: 0.22, desktopOnly: true },
];

/**
 * Desktop is the React Bits accordion: one row in which the hovered panel
 * opens to about half the width and the rest tilt back and desaturate. A
 * row is shared by every panel, so it holds the lead projects — at 16 each
 * collapsed panel would be a 30px sliver; at 7 they stay readable. The full
 * set is one click away (Explore portfolio) and on the phone carousel.
 */
const ACCORDION_COUNT = 7;
/** How long each project stays open before the next one opens. */
const AUTOPLAY_MS = 1400;
const IMAGE_SIZES = "(min-width: 1024px) 55vw, 70vw";

export interface FeaturedProject {
  slug: string;
  name: string;
  type: string;
  images: string[];
}

/**
 * Featured projects as a single full-page accordion. Hovering a panel expands
 * it; clicking opens that project's detail page. Carries the `#work` anchor
 * that the navbar, hero, footer, studio and services pages all link to.
 */
export function FeaturedProjects({
  content,
  projects = [],
}: {
  content?: Record<string, any>;
  projects?: FeaturedProject[];
}) {
  const c = withDefaults("home", "featured_projects", content);

  // Only projects with at least one image can fill an accordion panel.
  // Projects with their own photography lead; ones still on the shared
  // placeholder set (/assets/images/) follow, in their CMS order.
  const isPlaceholder = (p: FeaturedProject) => p.images[0]?.startsWith("/assets/images/") ?? true;
  const items = projects
    .filter((project) => project.images.length > 0)
    .map((project, i) => ({ project, i }))
    .sort((a, b) => Number(isPlaceholder(a.project)) - Number(isPlaceholder(b.project)) || a.i - b.i)
    .map(({ project }) => project)
    .map((project) => ({
      image: project.images[0],
      label: project.name,
      category: project.type,
      link: `/past-projects/${project.slug}`,
      alt: `${project.name} — ${project.type}`,
    }));

  const sectionRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const deskCount = Math.min(ACCORDION_COUNT, items.length);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  activeRef.current = active;
  const hoverRef = useRef(false);

  // The open project changes by itself every few seconds while the section
  // is on screen; hovering pauses it (and the hovered panel becomes the
  // place it carries on from). The footer line fills over each turn.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || deskCount < 2 || prefersReducedMotion()) return;
    let visible = false;
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    let shown = activeRef.current;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      last = performance.now();
    }, { threshold: 0.35 });
    io.observe(el);
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = now - last;
      last = now;
      if (activeRef.current !== shown) {
        shown = activeRef.current;
        elapsed = 0;
      }
      if (!visible || hoverRef.current || document.hidden) return;
      elapsed += dt;
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, elapsed / AUTOPLAY_MS).toFixed(4)})`;
      if (elapsed >= AUTOPLAY_MS) {
        elapsed = 0;
        shown = (activeRef.current + 1) % deskCount;
        setActive(shown);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [deskCount]);

  if (items.length === 0) return null;

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative w-full bg-transparent mb-20 md:mb-36"
    >
      {/* Background drafting marks, drifting at their own depth */}
      <ParallaxField items={WORK_ART} range={120} />

      {/* One screen */}
      <div className="relative w-full flex flex-col px-4 sm:px-8 md:px-12 h-[100svh] min-h-[560px] pt-[72px] pb-4 md:min-h-[640px] md:pt-24 md:pb-7">

      {/* Section header. Phones: the eyebrow alone on one line (the portfolio
          link moves to a full-width button under the carousel). */}
      <InView className="relative z-10 flex justify-between items-baseline gap-4 pt-5 mb-4 md:pt-6 md:mb-8 w-full shrink-0">
        <span
          aria-hidden="true"
          className="fq-rule absolute top-0 left-0 right-0 h-px bg-white/25"
        />
        <div className="fq-fade flex items-center gap-3 min-w-0">
          <span className="w-1.5 h-1.5 rounded-none bg-accent shrink-0" />
          <span className="text-[11px] tracking-[0.24em] text-white/70 uppercase font-medium">
            {c.eyebrow}
          </span>
        </div>
        <a
          href={c.linkHref}
          className="fq-fade fq-link hidden md:inline text-[11px] tracking-[0.2em] text-white/80 hover:text-white transition-colors uppercase font-medium whitespace-nowrap"
          style={{ ["--i" as string]: 1 }}
        >
          {c.linkLabel}
        </a>
      </InView>

      {/* Phones: one screen — header, a swipe carousel that takes the height
          that is left, its controls, and the portfolio button. */}
      <div className="relative z-10 md:hidden flex-1 min-h-0 min-w-0 flex flex-col">
        <div className="flex-1 min-h-0 min-w-0 flex flex-col">
          <ProjectSwipe items={items} autoplayMs={3600} />
        </div>
        <a
          href={c.linkHref}
          className="mt-3 flex min-h-[48px] shrink-0 items-center justify-center gap-3 border border-white/30 text-[11px] tracking-[0.22em] uppercase text-white/90 active:bg-white/10"
        >
          {c.linkLabel}
        </a>
      </div>

      {/* Desktop and tablet: equal cards, five (or three) across, filling the
          height the viewport leaves between header and footnote. */}
      <div
        className="relative z-10 w-full hidden md:block md:flex-1 md:min-h-0"
        data-cursor-label="View project"
        onPointerEnter={() => (hoverRef.current = true)}
        onPointerLeave={() => (hoverRef.current = false)}
      >
        <AccordionGallery
          items={items.slice(0, ACCORDION_COUNT)}
          defaultIndex={0}
          activeIndex={active}
          onActiveChange={setActive}
          expandRatio={0.52}
          height="100%"
          imageSizes={IMAGE_SIZES}
          gap={10}
          radius={0}
          accentColor="#ffffff"
          overlayColor="#060010"
          textColor="#ffffff"
          duration={0.6}
          ease="power3.out"
          tilt={8}
          parallax={0.5}
          stagger={0.06}
          trigger="hover"
          grayscale
          showLabels
        />
      </div>

      <div className="hidden md:grid grid-cols-[1fr_auto_1fr] w-full mt-5 items-center gap-6 text-[11px] tracking-[0.2em] text-white/60 uppercase shrink-0">
        <span>{c.footnoteLeft}</span>
        {/* Where the scroll is in the set */}
        <span className="flex items-center gap-4 text-white/80 tabular-nums" aria-live="polite">
          <span>{String(active + 1).padStart(2, "0")} / {String(deskCount).padStart(2, "0")}</span>
          <span className="relative block w-40 h-px bg-white/20 overflow-hidden" aria-hidden="true">
            <span ref={barRef} className="absolute inset-0 bg-white origin-left" style={{ transform: "scaleX(0)" }} />
          </span>
        </span>
        <span className="text-right">{c.footnoteRight}</span>
      </div>
      </div>
    </section>
  );
}
