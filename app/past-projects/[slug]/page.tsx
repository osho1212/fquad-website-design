import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/ui/mini-navbar";
import { ProjectCarousel } from "@/components/ui/ProjectCarousel";
import RevealOnScroll from "@/app/components/RevealOnScroll";
import { pastProjects, getPastProject } from "@/lib/past-projects";

export function generateStaticParams() {
  return pastProjects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getPastProject(params.slug);
  if (!project) return { title: "Project — F.QUAD Studio" };
  return {
    title: `${project.name} — F.QUAD Studio`,
    description: project.tagline,
  };
}

export default function PastProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getPastProject(params.slug);
  if (!project) notFound();

  const index = pastProjects.findIndex((p) => p.slug === project.slug);
  const prev = index > 0 ? pastProjects[index - 1] : null;
  const next =
    index < pastProjects.length - 1 ? pastProjects[index + 1] : null;

  // `type` is already shown as the eyebrow above the title, so it is omitted here.
  const meta = [project.location, project.area].filter(Boolean);
  const knownFacts = project.facts.filter((f) => f.value);

  return (
    <div className="relative bg-transparent text-white min-h-screen selection:bg-white selection:text-black">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="pt-40 sm:pt-48 pb-14 px-6 sm:px-14 border-b border-white/15">
        <Link
          href="/past-projects"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/45 hover:text-white transition-colors mb-10"
        >
          <span aria-hidden>←</span> All Projects
        </Link>

        <div className="text-[10.5px] tracking-[0.22em] text-[#a09d94] mb-6 uppercase font-medium">
          {project.type}
        </div>

        <h1 className="m-0 font-normal uppercase text-4xl sm:text-6xl md:text-7xl leading-[0.96] tracking-tight text-white max-w-[18ch]">
          {project.name}
        </h1>

        {project.altName && (
          <div className="mt-3 text-sm sm:text-base text-white/40 italic font-sans">
            also known as {project.altName}
          </div>
        )}

        <p className="mt-8 max-w-[54ch] text-base sm:text-lg leading-relaxed text-white/70">
          {project.tagline}
        </p>

        {meta.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] tracking-[0.2em] uppercase text-white/45">
            {meta.map((m, i) => (
              <span key={m} className="flex items-center gap-4">
                {i > 0 && <span className="text-white/20">/</span>}
                {m}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── Gallery ─────────────────────────────────────────────── */}
      <section className="px-6 sm:px-14 py-14">
        <ProjectCarousel
          images={project.images}
          alt={project.name}
          aspect="aspect-[16/9]"
        />
      </section>

      {/* ── Chapters ────────────────────────────────────────────── */}
      <section className="px-6 sm:px-14">
        {project.chapters.map((chapter) => (
          <RevealOnScroll key={chapter.num} delay={0.05}>
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

      {/* ── Project facts ───────────────────────────────────────── */}
      {knownFacts.length > 0 && (
        <section className="px-6 sm:px-14 py-20 border-t border-white/15">
          <div className="text-[10px] tracking-[0.22em] text-white/45 uppercase font-medium mb-12">
            Project Facts
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/15 border border-white/15">
            {knownFacts.map((fact) => (
              <div key={fact.label} className="bg-black p-7">
                <dt className="text-[9.5px] tracking-[0.2em] uppercase text-white/40">
                  {fact.label}
                </dt>
                <dd className="mt-3 m-0 font-display text-base sm:text-lg leading-snug text-white">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* ── Prev / Next ─────────────────────────────────────────── */}
      <section className="px-6 sm:px-14 py-16 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          {prev && (
            <Link href={`/past-projects/${prev.slug}`} className="group block">
              <div className="text-[9.5px] tracking-[0.2em] uppercase text-white/35 mb-3">
                ← Previous
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
                Next →
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
            Looking to elevate the aesthetic of your space?
          </p>
          <div className="flex flex-wrap gap-4 mt-12">
            <Link
              href="/past-projects"
              className="text-[10.5px] tracking-[0.16em] px-7 py-4 border border-white/40 hover:border-white text-white transition-colors uppercase font-medium inline-flex items-center"
            >
              All Projects
            </Link>
            <a
              href="mailto:admin@fquad.com?subject=NEW%20PROJECT"
              className="btn-metallic text-xs uppercase font-medium"
            >
              START A PROJECT →
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-10 text-[9.5px] tracking-[0.16em] text-white/40 uppercase">
          <span>© 2026 F.QUAD STUDIO · HYDERABAD, TELANGANA, INDIA</span>
          <a href="mailto:admin@fquad.com" className="hover:text-white">
            ADMIN@FQUAD.COM
          </a>
        </div>
      </section>
    </div>
  );
}
