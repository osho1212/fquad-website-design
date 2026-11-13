import { SITE } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { pageMetadata } from "@/lib/seo";
import { CategoryToggle } from "@/components/pages/projects/CategoryToggle";
import { ProjectList } from "@/components/pages/projects/ProjectList";
import { getPastProjects, getProjectGroups } from "@/lib/past-projects";
import { getPage } from "@/lib/cms/content";
import { fill } from "@/lib/cms/schema";
import { getSiteSettings } from "@/lib/public-content";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Our Projects",
  description:
    "Residential, commercial and hospitality spaces designed and delivered by F.QUAD Studio, Hyderabad — each shaped by its brief, its site and the people who use it.",
  path: "/past-projects",
});

export default async function PastProjectsPage() {
  const [content, global, pastProjects, groups, settings] = await Promise.all([
    getPage("past_projects"),
    getPage("global"),
    getPastProjects(),
    getProjectGroups(),
    getSiteSettings().catch(() => null),
  ]);

  const hero = content.hero;
  const groupSettings = content.groups;
  const detail = content.detail;
  const cta = content.cta;

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
      >
        {/* Only categories that have projects, so Ongoing stays hidden until there is one. */}
        {groups.length > 1 && (
          <CategoryToggle
            groups={groups.map((g) => ({
              ...g,
              count: pastProjects.filter((p) => p.category === g.id).length,
            }))}
          />
        )}
      </PageHero>

      {/* ── Project list: one category at a time, chosen by the toggle above ── */}
      <ProjectList
        groups={groups}
        projects={pastProjects}
        labels={{
          countSingular: groupSettings.countSingular,
          countPlural: groupSettings.countPlural,
          exploreLabel: groupSettings.exploreLabel,
          altNamePrefix: detail.altNamePrefix,
        }}
      />

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
