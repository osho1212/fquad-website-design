import { SITE } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { pageMetadata, jsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { ProjectCarousel } from "@/components/ui/ProjectCarousel";
import RevealOnScroll from "@/app/components/RevealOnScroll";
import { getPastProjects, getPastProject, defaultPastProjects } from "@/lib/past-projects";
import { getPage } from "@/lib/cms/content";
import { getSiteSettings } from "@/lib/public-content";

export const revalidate = 60;
// A project added in the CMS after a build is rendered on demand rather than 404ing.
export const dynamicParams = true;

export function generateStaticParams() {
  // Build time: the database may not be reachable, so pre-render the shipped
  // catalogue and let anything newer fall through to on-demand rendering.
  return defaultPastProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const project = await getPastProject(params.slug);
  if (!project) return pageMetadata({ title: "Projects", description: "Our projects.", path: "/past-projects", noIndex: true });
  return pageMetadata({
    title: project.name,
    description: project.tagline || `${project.name} — a ${project.type || "project"} by F.QUAD Studio, Hyderabad.`,
    path: `/past-projects/${project.slug}`,
    image: project.images[0] ?? null,
  });
}

export default async function PastProjectDetailPage(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  const [projects, content, global, settings] = await Promise.all([
    getPastProjects(),
    getPage("past_projects"),
    getPage("global"),
    getSiteSettings().catch(() => null),
  ]);

  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  const labels = content.detail;
  const index = projects.findIndex((p) => p.slug === project.slug);
  const prev = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;

  const email = settings?.email || SITE.fallback.email;
  const address = settings?.address || "HYDERABAD, TELANGANA, INDIA";

  const heroFacts = [
    { label: labels.typeLabel, value: project.type },
    { label: labels.areaLabel, value: project.area },
    { label: labels.locationLabel, value: project.location },
  ].filter((f) => f.value);

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.name,
            description: project.tagline,
            url: `${siteUrl()}/past-projects/${project.slug}`,
            creator: { "@type": "ProfessionalService", name: "F.QUAD Studio", url: siteUrl() },
            ...(project.images[0]
              ? { image: project.images[0].startsWith("/") ? `${siteUrl()}${project.images[0]}` : project.images[0] }
              : {}),
            ...(project.location ? { locationCreated: { "@type": "Place", name: project.location } } : {}),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd(
              [
                { name: "Home", path: "/" },
                { name: "Projects", path: "/past-projects" },
                { name: project.name, path: `/past-projects/${project.slug}` },
              ],
              siteUrl()
            )
          ),
        }}
      />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="pt-40 sm:pt-48 pb-14 px-6 sm:px-14 border-b border-white/15">
        <Link
          href="/past-projects"
          className="fq-link inline-flex items-center gap-2 min-h-[32px] text-[11px] tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors mb-8"
        >
          {labels.backLabel}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16">
          <div>
            <div className="text-[11px] tracking-[0.22em] text-[#a09d94] mb-6 uppercase font-medium">
              {project.type}
            </div>

            <h1 className="m-0 font-normal uppercase text-4xl sm:text-6xl md:text-7xl leading-[0.96] tracking-tight text-white max-w-[18ch]">
              {project.name}
            </h1>

            {project.altName && (
              <div className="mt-3 text-sm sm:text-base text-white/40 italic font-sans">
                {labels.altNamePrefix} {project.altName}
              </div>
            )}

            <p className="mt-8 max-w-[54ch] text-base sm:text-lg leading-relaxed text-white/70">
              {project.tagline}
            </p>
          </div>

          {/* Project facts — Type / Area / Location, right of the title on
              desktop and beneath it on mobile. Replaces both the old inline
              meta line and the separate "Project Facts" section further
              down the page. */}
          {heroFacts.length > 0 && (
            <dl className="flex flex-row flex-wrap lg:flex-col gap-x-10 gap-y-6 lg:gap-y-8 lg:min-w-[200px] lg:pl-2">
              {heroFacts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[11px] tracking-[0.2em] uppercase text-white/40">
                    {fact.label}
                  </dt>
                  <dd className="mt-2 m-0 font-display text-base sm:text-lg leading-snug text-white">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* ── Gallery ─────────────────────────────────────────────── */}
      {project.images.length > 0 && (
        <section className="px-6 sm:px-14 py-14">
          <ProjectCarousel
            images={project.images}
            alt={project.name}
            aspect="aspect-[16/9]"
            sizes="100vw"
          />
        </section>
      )}

      {/* ── Chapters ────────────────────────────────────────────── */}
      <section className="px-6 sm:px-14">
        {project.chapters.map((chapter, chapterIndex) => (
          <RevealOnScroll key={chapterIndex} delay={0.05}>
            <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_1fr] gap-6 lg:gap-12 py-16 border-t border-white/15">
              <div className="flex items-start gap-4">
                <span className="font-display text-[11px] tracking-[0.24em] text-white/30 pt-1">
                  {chapter.num}
                </span>
                <h2 className="m-0 font-normal uppercase text-[11px] tracking-[0.22em] text-white/55 pt-1">
                  {chapter.title}
                </h2>
              </div>

              <div className="max-w-[62ch]">
                {chapter.body.map((para, i) => (
                  <p
                    key={i}
                    className={`text-base sm:text-lg leading-relaxed text-white/70 ${
                      i > 0 ? "mt-6" : ""
                    }`}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        ))}
      </section>

      {/* ── Prev / Next ─────────────────────────────────────────── */}
      <section className="px-6 sm:px-14 py-16 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          {prev && (
            <Link href={`/past-projects/${prev.slug}`} className="group block">
              <div className="text-[11px] tracking-[0.2em] uppercase text-white/35 mb-3">
                {labels.prevLabel}
              </div>
              <div className="font-display uppercase text-xl sm:text-2xl text-white/70 group-hover:text-white transition-colors">
                {prev.name}
              </div>
            </Link>
          )}
        </div>
        <div className="sm:text-right">
          {next && (
            <Link href={`/past-projects/${next.slug}`} className="group block">
              <div className="text-[11px] tracking-[0.2em] uppercase text-white/35 mb-3">
                {labels.nextLabel}
              </div>
              <div className="font-display uppercase text-xl sm:text-2xl text-white/70 group-hover:text-white transition-colors">
                {next.name}
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-14 py-28 bg-black border-t border-white/15">
        <div className="pb-16 border-b border-white/15">
          <p className="font-display m-0 font-normal uppercase text-3xl sm:text-5xl md:text-6xl leading-tight max-w-[24ch] text-white">
            {labels.ctaHeading}
          </p>
          <div className="flex flex-wrap gap-4 mt-12">
            <Link
              href="/past-projects"
              className="text-[11px] tracking-[0.16em] px-7 py-4 border border-white/40 hover:border-white text-white transition-colors uppercase font-medium inline-flex items-center"
            >
              {labels.ctaPrimaryLabel}
            </Link>
            {/* Opened by the global data-start-project listener. */}
            <button
              type="button"
              data-start-project="true"
              className="btn-primary text-xs uppercase font-medium cursor-pointer"
            >
              {labels.ctaSecondaryLabel}
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
