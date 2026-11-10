"use client";

import React, { useEffect, useRef, useState } from "react";
import AccordionGallery from "../ui/AccordionGallery";
import { ProjectSwipe } from "../ui/ProjectSwipe";
import { withDefaults } from "@/lib/cms/schema";
import { InView } from "@/components/motion/InView";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";

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

  // The section is pinned: progress through it opens each accordion panel in
  // turn on desktop, and slides the phone carousel sideways (ProjectSwipe
  // reads the same element).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || deskCount === 0) return;
    let raf = 0;
    let last = -1;
    const read = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / span));
      const i = Math.min(deskCount - 1, Math.floor(p * deskCount));
      if (i !== last) {
        last = i;
        setActive(i);
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [deskCount]);

  if (items.length === 0) return null;

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative w-full bg-transparent h-[calc(100svh_+_var(--fp-m)_*_30svh)] md:h-[calc(100vh_+_var(--fp-d)_*_55vh)]"
      style={{ ["--fp-m" as string]: items.length, ["--fp-d" as string]: deskCount } as React.CSSProperties}
    >
      {/* Background drafting marks, drifting at their own depth */}
      <ParallaxField items={WORK_ART} range={120} />

      {/* Pinned one-screen stage */}
      <div className="sticky top-0 w-full flex flex-col px-4 sm:px-8 md:px-12 h-[100svh] min-h-[560px] pt-[72px] pb-4 md:min-h-[640px] md:pt-24 md:pb-7">

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
      <div className="relative z-10 md:hidden flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0">
          <ProjectSwipe items={items} drivenBy={sectionRef} />
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
      <div className="relative z-10 w-full hidden md:block md:flex-1 md:min-h-0" data-cursor-label="View project">
        <AccordionGallery
          items={items.slice(0, ACCORDION_COUNT)}
          defaultIndex={0}
          activeIndex={active}
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
