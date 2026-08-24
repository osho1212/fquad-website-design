import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/ui/mini-navbar";
import RevealOnScroll from "@/app/components/RevealOnScroll";
import { services, getService } from "@/lib/services";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const service = getService(params.slug);
  if (!service) return { title: "Services — F.QUAD Studio" };
  return {
    title: `${service.title} — F.QUAD Studio`,
    description: service.desc,
  };
}

export default function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = getService(params.slug);
  if (!service) notFound();

  const index = services.findIndex((s) => s.slug === service.slug);
  const next = services[(index + 1) % services.length];

  return (
    <div className="relative bg-transparent text-white min-h-screen selection:bg-white selection:text-black">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="pt-40 sm:pt-48 pb-16 px-6 sm:px-14 border-b border-white/15">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/45 hover:text-white transition-colors mb-10"
        >
          <span aria-hidden>←</span> All Services
        </Link>

        <div className="text-[10.5px] tracking-[0.22em] text-[#a09d94] mb-6 uppercase font-medium">
          {service.num} · What We Do
        </div>

        <h1 className="m-0 font-normal uppercase text-4xl sm:text-6xl md:text-7xl leading-[0.96] tracking-tight text-white max-w-[16ch]">
          {service.title}
        </h1>

        <p className="mt-8 max-w-[54ch] text-base sm:text-lg leading-relaxed text-white/70">
          {service.intro}
        </p>
      </section>

      {/* ── Image ───────────────────────────────────────────────── */}
      <section className="px-6 sm:px-14 py-14">
        <figure className="m-0 overflow-hidden aspect-[16/9] bg-zinc-900 border border-white/10 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={service.image}
            alt={service.alt}
            className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-105"
          />
        </figure>
      </section>

      {/* ── Approach + offerings ────────────────────────────────── */}
      <RevealOnScroll delay={0.05}>
        <section className="px-6 sm:px-14 py-16 grid grid-cols-1 lg:grid-cols-[0.4fr_1fr] gap-8 lg:gap-12 border-t border-white/15">
          <h2 className="m-0 font-normal uppercase text-[11px] tracking-[0.22em] text-white/55">
            The Approach
          </h2>
          <div className="max-w-[62ch]">
            {service.body.map((para, i) => (
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
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={0.05}>
        <section className="px-6 sm:px-14 py-16 grid grid-cols-1 lg:grid-cols-[0.4fr_1fr] gap-8 lg:gap-12 border-t border-white/15">
          <h2 className="m-0 font-normal uppercase text-[11px] tracking-[0.22em] text-white/55">
            What&apos;s Included
          </h2>
          <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
            {service.offerings.map((item) => (
              <li
                key={item}
                className="flex items-baseline gap-3 py-4 border-b border-white/10 text-sm sm:text-base text-white/70"
              >
                <span className="text-[#c0c0c0] text-[10px]" aria-hidden>
                  ◆
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </RevealOnScroll>

      {/* ── Services ────────────────────────────────────────────── */}
      <section className="px-6 sm:px-14 py-16 border-t border-white/15">
        <div className="text-[10px] tracking-[0.22em] text-white/45 uppercase font-medium mb-10">
          Services
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-white/15 border border-white/15">
          {services.map((svc) => {
            const isCurrent = svc.slug === service.slug;
            return (
              <Link
                key={svc.slug}
                href={`/services/${svc.slug}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`block p-8 transition-colors group ${
                  isCurrent
                    ? "bg-white/[0.07]"
                    : "bg-black hover:bg-white/[0.04]"
                }`}
              >
                <div className="text-[10px] text-[#c0c0c0] tracking-[0.2em]">
                  {svc.num}
                </div>
                <h3
                  className={`m-0 mt-4 font-normal uppercase text-lg sm:text-xl transition-colors ${
                    isCurrent
                      ? "text-white"
                      : "text-white/80 group-hover:text-white"
                  }`}
                >
                  {svc.title}
                </h3>
                {isCurrent && (
                  <div className="mt-3 text-[9px] tracking-[0.2em] uppercase text-[#c39a5f]">
                    Currently viewing
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-14 py-28 bg-black border-t border-white/15">
        <div className="pb-16 border-b border-white/15">
          <p className="font-display m-0 font-normal uppercase text-3xl sm:text-5xl md:text-6xl leading-tight max-w-[22ch] text-white">
            Planning a {service.title.toLowerCase()} project?
          </p>
          <div className="flex flex-wrap gap-4 mt-12">
            <Link
              href={`/services/${next.slug}`}
              className="text-[10.5px] tracking-[0.16em] px-7 py-4 border border-white/40 hover:border-white text-white transition-colors uppercase font-medium inline-flex items-center"
            >
              Next: {next.title}
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
