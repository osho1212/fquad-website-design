import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/mini-navbar";
import { getPage } from "@/lib/cms/content";
import { toLines } from "@/lib/cms/schema";
import { getSiteSettings } from "@/lib/public-content";

export const revalidate = 60;

interface Metric {
  value: string;
  label: string;
}

interface Principle {
  num: string;
  title: string;
  desc: string;
}

interface Founder {
  name: string;
  role: string;
  portrait: string;
  bio: string;
}

export default async function StudioPage() {
  const [studio, global, settings] = await Promise.all([
    getPage("studio"),
    getPage("global"),
    getSiteSettings().catch(() => null),
  ]);

  const hero = studio.hero;
  const showcase = studio.showcase;
  const story = studio.story;
  const fourFs = studio.four_fs;
  const founders = studio.founders;
  const recognition = studio.recognition;
  const cta = studio.cta;

  const email = settings?.email || "admin@fquad.com";
  const address = settings?.address || "HYDERABAD, TELANGANA, INDIA";

  return (
    <div className="relative bg-transparent text-white min-h-screen selection:bg-white selection:text-black">
      {/* Floating Pill Navbar */}
      <Navbar content={global.nav} />

      {/* Studio Hero */}
      <section className="pt-40 sm:pt-48 pb-20 px-6 sm:px-14 border-b border-white/15">
        <div className="text-[10.5px] tracking-[0.22em] text-[#a09d94] mb-8 uppercase font-medium">
          {hero.eyebrow}
        </div>
        <h1 className="m-0 font-normal uppercase text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.96] tracking-tight max-w-[24ch] text-white">
          {hero.title}
        </h1>
        <p className="mt-10 max-w-[60ch] text-base sm:text-lg leading-relaxed text-white/70">
          {hero.intro}
        </p>
      </section>

      {/* Studio Image & Metrics */}
      <section className="px-6 sm:px-14 py-16">
        {showcase.image && (
          <figure className="m-0 overflow-hidden h-[50vh] sm:h-[65vh] rounded-none bg-zinc-900 border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={showcase.image}
              alt={showcase.imageAlt}
              className="w-full h-full object-cover block"
            />
          </figure>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/15 border-b border-white/15 py-12">
          {(showcase.metrics as Metric[]).map((metric, i) => (
            <div key={i} className={`py-6 md:py-0 ${i > 0 ? "md:pl-10" : ""}`}>
              <div className="font-light text-5xl sm:text-7xl leading-none text-white">
                {metric.value}
              </div>
              <div className="text-[10px] tracking-[0.2em] text-white/45 mt-3 uppercase">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 text-[10px] tracking-[0.2em] text-white/50 uppercase">
          {showcase.sectorLine}
        </div>
      </section>

      {/* Our Story */}
      <section className="px-6 sm:px-14 py-24 grid grid-cols-1 lg:grid-cols-[0.4fr_1fr] gap-12 border-t border-white/15">
        <div className="text-[10px] tracking-[0.22em] text-white/45 uppercase font-medium">
          {story.eyebrow}
        </div>
        <div>
          <p className="font-display m-0 font-normal uppercase text-2xl sm:text-4xl md:text-5xl leading-snug max-w-[28ch] text-white">
            {story.title}
          </p>
          {(story.body as string[]).map((para, i) => (
            <p
              key={i}
              className={`${i === 0 ? "mt-8" : "mt-6"} text-base sm:text-lg leading-relaxed text-white/70 max-w-[62ch]`}
            >
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* The Four F's Grid */}
      <section className="px-6 sm:px-14 py-24 bg-zinc-950 border-t border-white/15">
        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-4 mb-16 pb-6 border-b border-white/15">
          <div className="text-[10px] tracking-[0.22em] text-white/45 uppercase">
            {fourFs.eyebrow}
          </div>
          <h2 className="m-0 font-normal uppercase text-3xl sm:text-4xl md:text-5xl text-white">
            {fourFs.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
          {(fourFs.items as Principle[]).map((item, i) => (
            <div key={i} className="pt-6 sm:pt-0 sm:px-8 first:sm:pl-0 last:sm:pr-0">
              <div className="text-[10px] tracking-[0.2em] text-[#c0c0c0]">
                {item.num}
              </div>
              <h3 className="m-0 mt-4 font-normal uppercase text-2xl sm:text-3xl text-white">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Meet the Founders */}
      <section className="px-6 sm:px-14 py-28 border-t border-white/15">
        <div className="text-[10px] tracking-[0.22em] text-white/45 mb-14 uppercase font-medium">
          {founders.eyebrow}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {(founders.people as Founder[]).map((person, i) => (
            <article key={i} className={i % 2 === 1 ? "md:mt-12" : undefined}>
              {person.portrait ? (
                <figure className="m-0 w-4/5 aspect-[4/5] overflow-hidden rounded-none bg-zinc-900 border border-white/15">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={person.portrait}
                    alt={person.name}
                    className="w-full h-full object-cover block"
                  />
                </figure>
              ) : (
                <div className="w-4/5 aspect-[4/5] rounded-none bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.06)_0_8px,transparent_8px_16px)] border border-white/15 flex items-center justify-center p-6 text-center">
                  <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase leading-relaxed">
                    FOUNDER PORTRAIT
                    <br />
                    {person.name}
                  </span>
                </div>
              )}
              <h3 className="m-0 mt-8 font-normal uppercase text-3xl sm:text-4xl text-white">
                {person.name}
              </h3>
              <div className="text-[10px] tracking-[0.2em] text-[#a9a9a9] mt-2.5 uppercase">
                {person.role}
              </div>
              <p className="mt-5 text-sm sm:text-base leading-relaxed text-white/70 max-w-[46ch]">
                {person.bio}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Recognition */}
      <section className="px-6 sm:px-14 py-24 border-t border-white/15 grid grid-cols-1 lg:grid-cols-[0.4fr_1fr] gap-12">
        <div className="text-[10px] tracking-[0.22em] text-white/45 uppercase font-medium">
          {recognition.eyebrow}
        </div>
        <div>
          <h2 className="m-0 font-normal uppercase text-3xl sm:text-5xl md:text-6xl leading-tight text-white">
            {toLines(recognition.title).map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </h2>
          <p className="mt-6 mb-12 text-sm sm:text-base text-white/65 max-w-[46ch]">
            {recognition.intro}
          </p>

          <div className="divide-y divide-white/15 border-t border-b border-white/15">
            {(recognition.items as string[]).map((rec, i) => (
              <div key={i} className="flex justify-between items-center py-6 group">
                <span className="text-xl sm:text-2xl md:text-3xl font-normal uppercase text-white transition-colors">
                  {rec}
                </span>
                <span className="text-[9.5px] tracking-[0.18em] text-[#a09d94] uppercase">
                  {recognition.itemLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio CTA Banner */}
      <section id="studio-cta" className="px-6 sm:px-14 py-28 bg-black border-t border-white/15">
        <div className="pb-16 border-b border-white/15">
          <p className="font-display m-0 font-normal uppercase text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight max-w-[26ch] text-white">
            {cta.statement}
          </p>
          <p className="mt-8 text-base sm:text-lg leading-relaxed text-white/65 max-w-[60ch]">
            {cta.body}
          </p>

          <div className="flex flex-wrap gap-4 mt-12">
            <Link
              href={cta.primaryHref}
              className="text-[10.5px] tracking-[0.16em] px-7 py-4 border border-white/40 hover:border-white text-white rounded-none transition-colors uppercase font-medium inline-flex items-center"
            >
              {cta.primaryLabel}
            </Link>
            {/* The provider in StartProjectModalContext opens the modal for
                anything carrying data-start-project, so this stays server-rendered. */}
            <button
              type="button"
              data-start-project="true"
              className="btn-metallic text-xs uppercase font-medium cursor-pointer"
            >
              {cta.secondaryLabel}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-10 text-[9.5px] tracking-[0.16em] text-white/40 uppercase">
          <span>© {new Date().getFullYear()} F.QUAD STUDIO · {address}</span>
          <a href={`mailto:${email}`} className="hover:text-white">
            {email.toUpperCase()}
          </a>
        </div>
      </section>
    </div>
  );
}
