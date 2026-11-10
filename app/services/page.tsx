import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { pageMetadata } from "@/lib/seo";
import { getServices } from "@/lib/services";
import { getPage } from "@/lib/cms/content";
import { fill, toLines } from "@/lib/cms/schema";
import { getSiteSettings } from "@/lib/public-content";
import { responsive } from "@/lib/img";
import { SOCIAL_FALLBACKS } from "@/lib/social";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description:
    "Architecture, interior design, interior styling and farmhouse projects by F.QUAD Studio in Hyderabad — planned from the first sketch to the last cushion.",
  path: "/services",
});

interface Stage {
  num: string;
  title: string;
  desc: string;
}

interface Metric {
  value: string;
  label: string;
  note?: string;
}

export default async function ServicesPage() {
  const [content, global, services, settings] = await Promise.all([
    getPage("services"),
    getPage("global"),
    getServices(),
    getSiteSettings().catch(() => null),
  ]);

  const hero = content.hero;
  const rows = content.index_rows;
  const stages = content.stages;
  const metrics = content.metrics;
  const types = content.project_types;
  const cta = content.cta;

  const email = settings?.email || "admin@fquad.com";
  const address = settings?.address || "HYDERABAD, TELANGANA, INDIA";
  const waDigits = (settings?.whatsapp || SOCIAL_FALLBACKS.whatsapp).replace(/[^0-9]/g, "");
  const typeList: string[] = types.items ?? [];

  return (
    <PageShell>

      {/* Services Hero */}
      <section className="pt-40 sm:pt-48 pb-20 px-6 sm:px-14 grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-12 lg:gap-16 items-end border-b border-white/15">
        <div>
          <div className="flex items-center gap-3 text-[11px] tracking-[0.22em] text-[#a09d94] mb-8 uppercase font-medium">
            <span className="w-12 h-[1px] bg-white/30" />
            {hero.eyebrow}
          </div>
          <h1 className="m-0 font-normal uppercase text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-white">
            {toLines(hero.title).map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </h1>
          <p className="mt-8 max-w-[46ch] text-base sm:text-lg leading-relaxed text-white/70">
            {hero.intro}
          </p>
        </div>

        {hero.image && (
          <figure className="m-0 overflow-hidden h-[45vh] lg:h-[55vh] rounded-none bg-zinc-900 border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              {...responsive(hero.image, "(min-width: 1024px) 50vw, 100vw")}
              alt={hero.imageAlt}
              className="w-full h-full object-cover block transition-transform duration-700 hover:scale-105"
            />
          </figure>
        )}
      </section>

      {/* Detailed Services Breakdown */}
      <section className="px-6 sm:px-14 py-16">
        <div className="divide-y divide-white/15">
          {services.map((svc) => (
            <article
              key={svc.slug}
              className="grid grid-cols-1 lg:grid-cols-[70px_1fr_1.2fr] gap-8 lg:gap-12 py-14 items-start"
            >
              <div className="text-[11px] tracking-[0.2em] text-[#a9a9a9] font-medium">
                {svc.num}
              </div>

              <div>
                <h2 className="m-0 font-normal text-3xl sm:text-4xl md:text-5xl leading-tight text-white">
                  {svc.title}
                </h2>
                <p className="mt-5 text-sm sm:text-base leading-relaxed text-white/65 max-w-[38ch]">
                  {svc.desc}
                </p>
                <Link
                  href={`/services/${svc.slug}`}
                  className="inline-flex items-center gap-2.5 mt-5 min-h-[32px] text-[11px] tracking-[0.16em] uppercase text-white/90 hover:text-white border-b border-white/40 hover:border-white pb-1 transition-colors"
                >
                  {fill(rows.ctaTemplate, { title: svc.title.toUpperCase() })}
                </Link>
              </div>

              <Link
                href={`/services/${svc.slug}`}
                className="block group"
                aria-label={svc.title}
              >
                <figure className="m-0 overflow-hidden aspect-[16/10] rounded-none bg-zinc-900 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    {...responsive(svc.image, "(min-width: 1024px) 40vw, 100vw")}
                    alt={svc.alt}
                    className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-105"
                  />
                </figure>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* How We Work - 4 Stages */}
      <section className="px-6 sm:px-14 py-24 bg-zinc-950 border-t border-white/15">
        <div className="flex flex-col md:flex-row justify-between md:items-baseline gap-4 mb-16 pb-6 border-b border-white/15">
          <div className="text-[11px] tracking-[0.22em] text-white/45 uppercase">
            {stages.eyebrow}
          </div>
          <h2 className="m-0 font-normal uppercase text-2xl sm:text-4xl md:text-5xl text-white">
            {stages.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
          {(stages.items as Stage[]).map((stg, i) => (
            <div key={i} className="pt-6 sm:pt-0 sm:px-8 first:sm:pl-0 last:sm:pr-0">
              <div className="font-light text-5xl sm:text-6xl tracking-tighter text-[#c0c0c0]">
                {stg.num}
              </div>
              <h3 className="m-0 mt-5 font-normal uppercase text-xl sm:text-2xl text-white">
                {stg.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                {stg.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Metrics */}
      <section className="px-6 sm:px-14 py-20 border-t border-white/15">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-16 border-b border-white/15">
          {(metrics.items as Metric[]).map((metric, i) => (
            <div key={i} className={i > 0 ? "md:border-l md:border-white/15 md:pl-10" : undefined}>
              <div className="font-light text-5xl sm:text-7xl leading-none text-white">
                {metric.value}
              </div>
              <div className="text-[11px] tracking-[0.2em] text-white/45 mt-3 uppercase">
                {metric.label}
              </div>
              {metric.note && (
                <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-[32ch]">
                  {metric.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Spaces We Design */}
      <section className="px-6 sm:px-14 py-20 grid grid-cols-1 lg:grid-cols-[0.4fr_1fr] gap-10 border-b border-white/15">
        <div className="text-[11px] tracking-[0.22em] text-white/45 uppercase font-medium">
          {types.eyebrow}
        </div>
        <div>
          <h2 className="m-0 mb-10 font-normal uppercase text-3xl sm:text-5xl md:text-6xl text-white">
            {types.title}
          </h2>
          <div className="flex flex-wrap gap-y-4 text-xl sm:text-3xl md:text-4xl text-white/80 font-normal">
            {typeList.map((type, idx) => (
              <React.Fragment key={type}>
                <span className="hover:text-white transition-colors cursor-default">
                  {type}
                </span>
                {idx < typeList.length - 1 && (
                  <span className="px-5 text-white/30 font-light">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Services CTA Banner */}
      <section id="svc-cta" className="px-6 sm:px-14 py-28 bg-black">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-end pb-20 border-b border-white/15">
          <div>
            <h2 className="m-0 font-normal uppercase text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] text-white">
              {toLines(cta.title).map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </h2>
            <p className="mt-8 text-base sm:text-lg text-white/65 max-w-[38ch]">
              {cta.body}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] tracking-[0.18em] px-6 py-4 border border-white/35 hover:border-white text-white rounded-none transition-colors uppercase font-medium"
            >
              {cta.whatsappLabel}
            </a>
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
