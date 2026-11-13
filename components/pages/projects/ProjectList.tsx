"use client";

import { Suspense } from "react";
import Link from "next/link";
import RevealOnScroll from "@/app/components/RevealOnScroll";
import { ProjectCarousel } from "@/components/ui/ProjectCarousel";
import { useActiveGroup, type Group } from "./useActiveGroup";

export interface ListProject {
  slug: string;
  name: string;
  category: string;
  altName?: string;
  location: string;
  type: string;
  area: string;
  tagline: string;
  images: string[];
}

export interface ListLabels {
  countSingular: string;
  countPlural: string;
  exploreLabel: string;
  altNamePrefix: string;
}

interface Props {
  groups: Group[];
  projects: ListProject[];
  labels: ListLabels;
}

function ListView({ groups, projects, labels, active }: Props & { active: string }) {
  const group = groups.find((g) => g.id === active);
  if (!group) return null;
  const grouped = projects.filter((p) => p.category === group.id);
  if (grouped.length === 0) return null;

  return (
    <section
      key={group.id}
      id="projects-panel"
      role="tabpanel"
      aria-labelledby={`tab-${group.id}`}
      className="px-6 sm:px-14 scroll-mt-24"
    >
      {/* Category subheading */}
      <div className="flex items-baseline justify-between gap-6 border-b border-white/15 pt-20 pb-6">
        <h2 className="m-0 font-normal uppercase text-2xl sm:text-4xl md:text-5xl tracking-tight text-white">
          {group.label}
        </h2>
        <span className="text-[11px] tracking-[0.2em] uppercase text-[#a09d94] whitespace-nowrap">
          {String(grouped.length).padStart(2, "0")}{" "}
          {grouped.length === 1 ? labels.countSingular : labels.countPlural}
        </span>
      </div>

      {grouped.map((project, i) => (
        <RevealOnScroll key={project.slug} delay={0.05}>
          <article className="group grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-center py-16 sm:py-20 border-b border-white/15">
            {/* Text column */}
            <div className="lg:pr-6">
              <div className="text-[11px] tracking-[0.24em] text-white/35 mb-6 font-display">
                {String(i + 1).padStart(2, "0")}
              </div>

              <h2 className="m-0 font-normal uppercase text-3xl sm:text-4xl md:text-[2.75rem] leading-[1.06] tracking-tight text-white">
                {project.name}
              </h2>

              {project.altName && (
                <div className="mt-2 text-sm text-white/40 italic font-sans">
                  {labels.altNamePrefix} {project.altName}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] tracking-[0.2em] uppercase text-[#a09d94]">
                <span>{project.location || project.type}</span>
                {project.location && (
                  <>
                    <span className="text-white/20">/</span>
                    <span>{project.type}</span>
                  </>
                )}
                {project.area && (
                  <>
                    <span className="text-white/20">/</span>
                    <span>{project.area}</span>
                  </>
                )}
              </div>

              <p className="mt-6 text-sm sm:text-base leading-relaxed text-white/65 max-w-[42ch]">
                {project.tagline}
              </p>

              <Link
                href={`/past-projects/${project.slug}`}
                className="inline-flex items-center mt-9 text-[11px] tracking-[0.16em] px-7 py-4 border border-white/40 hover:border-white hover:bg-white hover:text-black text-white transition-all duration-300 uppercase font-medium"
              >
                {labels.exploreLabel}
              </Link>
            </div>

            {/* Image column */}
            <div>
              <ProjectCarousel
                images={project.images}
                alt={project.name}
                href={`/past-projects/${project.slug}`}
              />
            </div>
          </article>
        </RevealOnScroll>
      ))}
    </section>
  );
}

function LiveList(props: Props) {
  const { active } = useActiveGroup(props.groups);
  return <ListView {...props} active={active} />;
}

/** The projects of whichever category is selected (see CategoryToggle). */
export function ProjectList(props: Props) {
  if (props.groups.length === 0) return null;
  return (
    <Suspense fallback={<ListView {...props} active={props.groups[0].id} />}>
      <LiveList {...props} />
    </Suspense>
  );
}
