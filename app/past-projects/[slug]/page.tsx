import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/ui/mini-navbar";
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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getPastProject(params.slug);
  if (!project) return { title: "Project — F.QUAD Studio" };
  return {
    title: `${project.name} — F.QUAD Studio`,
    description: project.tagline,
  };
}

export default async function PastProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
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

  const email = settings?.email || "admin@fquad.com";
  const address = settings?.address || "HYDERABAD, TELANGANA, INDIA";

  const heroFacts = [
    { label: labels.typeLabel, value: project.type },
    { label: labels.areaLabel, value: project.area },
    { label: labels.locationLabel, value: project.location },
  ].filter((f) => f.value);

  return (
    <div className="relative bg-transparent text-white min-h-screen selection:bg-white selection:text-black">
      <Navbar content={global.nav} />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="pt-40 sm:pt-48 pb-14 px-6 sm:px-14 border-b border-white/15">
        <Link
          href="/past-projects"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/45 hover:text-white transition-colors mb-10"
        >
          {labels.backLabel}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16">
          <div>
            <div className="text-[10.5px] tracking-[0.22em] text-[#a09d94] mb-6 uppercase font-medium">
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
                  <dt className="text-[9.5px] tracking-[0.2em] uppercase text-white/40">
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
          />
        </section>
      )}

      {/* ── Chapters ────────────────────────────────────────────── */}
      <section className="px-6 sm:px-14">
        {project.chapters.map((chapter, chapterIndex) => (
          <RevealOnScroll key={chapterIndex} delay={0.05}>
            <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_1fr] gap-6 lg:gap-12 py-16 border-t border-white/15">
              <div className="flex items-start gap-4">
                <span className="font-display text-[10px] tracking-[0.24em] text-white/30 pt-1">
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
              <div className="text-[9.5px] tracking-[0.2em] uppercase text-white/35 mb-3">
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
              <div className="text-[9.5px] tracking-[0.2em] uppercase text-white/35 mb-3">
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
              className="text-[10.5px] tracking-[0.16em] px-7 py-4 border border-white/40 hover:border-white text-white transition-colors uppercase font-medium inline-flex items-center"
            >
              {labels.ctaPrimaryLabel}
            </Link>
            {/* Opened by the global data-start-project listener. */}
            <button
              type="button"
              data-start-project="true"
              className="btn-metallic text-xs uppercase font-medium cursor-pointer"
            >
              {labels.ctaSecondaryLabel}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-10 text-[9.5px] tracking-[0.16em] text-white/40 uppercase">
          <span>© {new Date().getFullYear()} F.QUAD STUDIO · {address.toUpperCase()}</span>
          <a href={`mailto:${email}`} className="hover:text-white">
            {email.toUpperCase()}
          </a>
        </div>
      </section>
    </div>
  );
}
