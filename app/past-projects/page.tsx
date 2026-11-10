import { SITE } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { pageMetadata } from "@/lib/seo";
import { ProjectCarousel } from "@/components/ui/ProjectCarousel";
import RevealOnScroll from "@/app/components/RevealOnScroll";
import { getPastProjects, type ProjectCategory } from "@/lib/past-projects";
import { getPage } from "@/lib/cms/content";
import { fill } from "@/lib/cms/schema";
import { getSiteSettings } from "@/lib/public-content";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Past Projects",
  description:
    "Residential, commercial and hospitality spaces designed and delivered by F.QUAD Studio, Hyderabad — each shaped by its brief, its site and the people who use it.",
  path: "/past-projects",
});

export default async function PastProjectsPage() {
  const [content, global, pastProjects, settings] = await Promise.all([
    getPage("past_projects"),
    getPage("global"),
    getPastProjects(),
    getSiteSettings().catch(() => null),
  ]);

  const hero = content.hero;
  const groupSettings = content.groups;
  const detail = content.detail;
  const cta = content.cta;
  const groups: { id: ProjectCategory; label: string }[] = groupSettings.items ?? [];

  const email = settings?.email || SITE.fallback.email;
  const address = settings?.address || "HYDERABAD, TELANGANA, INDIA";

  return (
    <PageShell>

      <PageHero
        eyebrow={fill(hero.eyebrow, {
          count: String(pastProjects.length).padStart(2, "0"),
        })}
        title={hero.title}
        intro={hero.intro}
        crumbs={[{ label: "Home", href: "/" }, { label: "Projects" }]}
        art="living"
      />

      {/* ── Project list, grouped by category ───────────────────── */}
      {groups.map(({ id, label }) => {
        const grouped = pastProjects.filter((p) => p.category === id);
        if (grouped.length === 0) return null;

        return (
          <section key={id} id={id} className="px-6 sm:px-14 scroll-mt-24">
            {/* Category subheading */}
            <div className="flex items-baseline justify-between gap-6 border-b border-white/15 pt-20 pb-6">
              <h2 className="m-0 font-normal uppercase text-2xl sm:text-4xl md:text-5xl tracking-tight text-white">
                {label}
              </h2>
              <span className="text-[11px] tracking-[0.2em] uppercase text-[#a09d94] whitespace-nowrap">
                {String(grouped.length).padStart(2, "0")}{" "}
                {grouped.length === 1
                  ? groupSettings.countSingular
                  : groupSettings.countPlural}
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
                        {detail.altNamePrefix} {project.altName}
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
                      {groupSettings.exploreLabel}
                    </Link>
                  </div>

                  {/* Image column */}
                  <div>
                    <ProjectCarousel
                      images={project.images}
                      alt={project.name}
                    />
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </section>
        );
      })}

      {/* ── Closing CTA ─────────────────────────────────────────── */}
      <section className="px-6 sm:px-14 py-28 bg-black border-t border-white/15">
        <div className="pb-16 border-b border-white/15">
          <p className="font-display m-0 font-normal uppercase text-3xl sm:text-5xl md:text-6xl leading-tight max-w-[24ch] text-white">
            {cta.heading}
          </p>
          <p className="mt-8 text-base sm:text-lg leading-relaxed text-white/65 max-w-[56ch]">
            {cta.body}
          </p>

          <div className="flex flex-wrap gap-4 mt-12">
            <Link
              href={cta.contactHref}
              className="text-[11px] tracking-[0.16em] px-7 py-4 border border-white/40 hover:border-white text-white transition-colors uppercase font-medium inline-flex items-center"
            >
              {cta.contactLabel}
            </Link>
            {/* Opened by the global data-start-project listener. */}
            <button
              type="button"
              data-start-project="true"
              className="btn-primary text-xs uppercase font-medium cursor-pointer"
            >
              {cta.ctaLabel}
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
