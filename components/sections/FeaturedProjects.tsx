"use client";

import React from "react";
import AccordionGallery from "../ui/AccordionGallery";
import { withDefaults } from "@/lib/cms/schema";
import { InView } from "@/components/motion/InView";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";

const WORK_ART: ParallaxItem[] = [
  { art: "compass", x: "90%", y: "2%", w: 96, depth: 0.5, spin: 40, opacity: 0.3, desktopOnly: true },
  { art: "cross", x: "3%", y: "9%", w: 30, depth: 0.8, spin: 90, opacity: 0.3 },
  { art: "dimension", x: "34%", y: "-1%", w: 220, depth: 0.3, opacity: 0.22, desktopOnly: true },
];

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
  const items = projects
    .filter((project) => project.images.length > 0)
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
      className="relative w-full min-h-screen md:h-screen flex flex-col px-4 sm:px-8 md:px-12 pt-24 pb-8 bg-transparent"
    >
      {/* Background drafting marks, drifting at their own depth */}
      <ParallaxField items={WORK_ART} range={120} />

      {/* Section header */}
      <InView className="relative z-10 flex justify-between items-baseline pt-6 mb-6 w-full shrink-0">
        <span
          aria-hidden="true"
          className="fq-rule absolute top-0 left-0 right-0 h-px bg-white/25"
        />
        <div className="fq-fade flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-none bg-accent" />
          <span className="text-[11px] tracking-[0.24em] text-white/60 uppercase font-medium">
            {c.eyebrow}
          </span>
        </div>
        <a
          href={c.linkHref}
          className="fq-fade fq-link text-[11px] tracking-[0.2em] text-accent hover:text-white transition-colors uppercase font-medium"
          style={{ ["--i" as string]: 1 }}
        >
          {c.linkLabel}
        </a>
      </InView>

      {/* Accordion fills the remaining viewport height */}
      <div className="relative z-10 w-full flex-1 min-h-0" data-cursor-label="Open">
        <AccordionGallery
          items={items}
          defaultIndex={1}
          expandRatio={0.46}
          height="100%"
          visibleCount={3}
          loop
          gap={14}
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

      {/* Bottom subtext */}
      <div className="w-full mt-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] tracking-[0.2em] text-white/40 uppercase shrink-0">
        <span>{c.footnoteLeft}</span>
        <span>{c.footnoteRight}</span>
      </div>
    </section>
  );
}
