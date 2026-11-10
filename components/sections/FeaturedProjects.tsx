"use client";

import React from "react";
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
 * Cards on screen at once: five on desktop, three on tablets, and on phones
 * one card with the next peeking in (a swipe carousel). Kept outside the
 * component so the gallery sees a stable object between renders.
 */
const VISIBLE = { base: 3, md: 3, lg: 5 } as const;
const IMAGE_SIZES = "(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 85vw";

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

  if (items.length === 0) return null;

  return (
    <section
      id="work"
      className="relative w-full flex flex-col px-4 sm:px-8 md:px-12 h-[100svh] min-h-[560px] pt-[72px] pb-4 md:h-auto md:min-h-0 md:pt-28 md:pb-24 bg-transparent"
    >
      {/* Background drafting marks, drifting at their own depth */}
      <ParallaxField items={WORK_ART} range={120} />

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
          <ProjectSwipe items={items} />
        </div>
        <a
          href={c.linkHref}
          className="mt-3 flex min-h-[48px] shrink-0 items-center justify-center gap-3 border border-white/30 text-[11px] tracking-[0.22em] uppercase text-white/90 active:bg-white/10"
        >
          {c.linkLabel}
        </a>
      </div>

      {/* Desktop and tablet: equal cards, five (or three) across, sized from
          their width so they stay a calm 2:3 rather than viewport-tall slivers. */}
      <div className="fq-work-track relative z-10 w-full hidden md:block" data-cursor-label="View project">
        <AccordionGallery
          items={items}
          defaultIndex={1}
          expandRatio={0.46}
          height="100%"
          visibleCount={VISIBLE}
          imageSizes={IMAGE_SIZES}
          loop
          grow={false}
          gap={16}
          radius={0}
          accentColor="var(--fq-accent)"
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

      <div className="hidden md:flex w-full mt-5 justify-between items-center gap-2 text-[11px] tracking-[0.2em] text-white/60 uppercase shrink-0">
        <span>{c.footnoteLeft}</span>
        <span>{c.footnoteRight}</span>
      </div>
    </section>
  );
}
