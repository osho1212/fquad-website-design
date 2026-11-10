import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { InView } from "@/components/motion/InView";
import { Magnetic, RevealText, ScrollWords } from "@/components/motion/Reveal";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";
import { getPage } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo";
import { Stats, type StatItem } from "@/components/pages/about/Stats";
import { Pillars, type Pillar } from "@/components/pages/about/Pillars";
import { FounderCard, type Founder } from "@/components/pages/about/FounderCard";

export const revalidate = 60;

export const metadata = pageMetadata({
  title: "About",
  description:
    "Founded in 2005 by Amit Shah and Ashmi Shah, F.QUAD is an award-winning architecture and interior design studio in Hyderabad, with 500+ projects behind it.",
  path: "/about",
});

/* Atmosphere only: low opacity, and kept to the margins or behind headings so
   no motif sits under body copy at more than a whisper. */
const STORY_ART: ParallaxItem[] = [
  { art: "plan", x: "-6%", y: "6%", w: 520, depth: -0.3, rotate: -4, opacity: 0.08 },
  { art: "chair", x: "88%", y: "56%", w: 90, depth: 0.5, rotate: 5, opacity: 0.12, desktopOnly: true },
  { art: "dimension", x: "46%", y: "90%", w: 240, depth: 0.3, opacity: 0.13, desktopOnly: true },
  { art: "cross", x: "95%", y: "6%", w: 28, depth: 0.9, spin: 90, opacity: 0.2 },
];

const CLOSING_ART: ParallaxItem[] = [
  { art: "pendant", x: "86%", y: "-6%", w: 80, depth: 0.5, opacity: 0.15, desktopOnly: true },
  { art: "armchair", x: "70%", y: "48%", w: 220, depth: 0.35, opacity: 0.1, desktopOnly: true },
  { art: "plant", x: "94%", y: "60%", w: 90, depth: -0.3, opacity: 0.1, desktopOnly: true },
  { art: "cross", x: "3%", y: "86%", w: 28, depth: 0.9, spin: 90, opacity: 0.2 },
];

// `.btn-primary` pins its own 10px type, so the 11px floor needs `!`.
const OUTLINE_BTN =
  "btn-secondary min-h-[44px] px-6 text-[11px] tracking-[0.18em] uppercase font-medium";
const PRIMARY_BTN =
  "btn-primary !text-[11px] min-h-[44px] uppercase font-medium cursor-pointer";

/** "Residential • Commercial • Retail" → ["Residential", "Commercial", "Retail"]. */
function splitSectors(line: unknown): string[] {
  return String(line ?? "")
    .split(/\s*[•·|]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** A two-line CMS heading (line 1 / line 2) as one RevealText string. */
function joinLines(...lines: unknown[]): string {
  return lines
    .map((l) => String(l ?? "").trim())
    .filter(Boolean)
    .join("\n");
}

export default async function AboutPage() {
  const content = await getPage("about");

  const hero = content.hero;
  const intro = content.intro;
  const statsSection = content.stats;
  const story = content.story;
  const pillars = content.pillars;
  const founders = content.founders;
  const recognition = content.recognition;
  const closing = content.closing;

  const introParas: string[] = intro.body ?? [];
  const statItems: StatItem[] = statsSection.items ?? [];
  const sectors = splitSectors(statsSection.sectorLine);
  const storyParas: string[] = story.body ?? [];
  const pillarItems: Pillar[] = pillars.items ?? [];
  const people: Founder[] = founders.people ?? [];
  const awards: string[] = Array.isArray(recognition.items) ? recognition.items : [];

  // The reveal primitives split their text, and an emptied CMS field must not
  // leave an empty heading behind, so each title is normalised and guarded.
  const storyTitle = joinLines(story.title);
  const pillarsTitle = joinLines(pillars.title);
  const recognitionTitle = joinLines(recognition.titleLine1, recognition.titleLine2);
  const closingStatement = String(closing.statement ?? "").trim();

  return (
    <PageShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={joinLines(hero.titleLine1, hero.titleLine2)}
        intro={hero.subtitle}
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        art="studio"
      />

      {/* ── Intro: the one-line claim, then the longer account ───────────── */}
      <section className="relative px-6 sm:px-14 py-16 sm:py-24">
        <InView className="grid max-w-[1500px] grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12">
          <p className="fq-fade m-0 min-w-0 font-display font-light text-xl sm:text-3xl xl:text-4xl leading-[1.3] tracking-tight text-white lg:col-span-7">
            {intro.lead}
          </p>
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-5">
            {introParas.map((para, i) => (
              <p
                key={i}
                className="fq-fade m-0 text-sm sm:text-base leading-[1.85] text-white/75"
                style={{ ["--i" as string]: i + 1 }}
              >
                {para}
              </p>
            ))}
          </div>
        </InView>
      </section>

      {/* ── Numbers + sectors ────────────────────────────────────────────── */}
      {(statItems.length > 0 || sectors.length > 0) && (
        <InView as="section" aria-label="The studio in numbers" className="px-6 sm:px-14">
          <div className="relative border-b border-white/15">
            {/* The rule draws across the top as the numbers arrive. */}
            <span
              aria-hidden="true"
              className="fq-rule absolute left-0 right-0 top-0 h-px bg-white/30"
            />
            <Stats items={statItems} />

            {sectors.length > 1 ? (
              <ul
                role="list"
                className="fq-fade m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/15 px-0 py-6 text-[11px] sm:gap-x-6 sm:py-7 sm:text-xs font-medium uppercase tracking-[0.22em] text-white/70"
                style={{ ["--i" as string]: 4 }}
              >
                {sectors.map((s, i) => (
                  <li key={s} className="flex items-center gap-4 sm:gap-6">
                    {s}
                    {i < sectors.length - 1 && (
                      <span aria-hidden="true" className="h-1 w-1 bg-accent" />
                    )}
                  </li>
                ))}
              </ul>
            ) : sectors.length === 1 ? (
              <p
                className="fq-fade m-0 border-t border-white/15 py-6 sm:py-7 text-[11px] sm:text-xs font-medium uppercase tracking-[0.22em] text-white/70"
                style={{ ["--i" as string]: 4 }}
              >
                {sectors[0]}
              </p>
            ) : null}
          </div>
        </InView>
      )}

      {/* ── Our story ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <ParallaxField items={STORY_ART} />
        <Section id="story" eyebrow={story.eyebrow} className="relative z-10 scroll-mt-24">
          <div className="grid max-w-[1500px] grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12">
            {storyTitle && (
              <RevealText
                as="h3"
                text={storyTitle}
                className="m-0 min-w-0 font-normal uppercase text-2xl sm:text-4xl lg:text-[2.6rem] leading-[1.08] tracking-tight text-white lg:col-span-5"
              />
            )}
            <div className="flex min-w-0 max-w-[62ch] flex-col gap-6 lg:col-span-7">
              {storyParas.map((para, i) => (
                <p
                  key={i}
                  className="fq-fade m-0 text-sm sm:text-base leading-[1.9] text-white/75"
                  style={{ ["--i" as string]: i + 2 }}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* ── The Four F's ─────────────────────────────────────────────────── */}
      <Section id="four-fs" eyebrow={pillars.eyebrow} className="scroll-mt-24">
        {pillarsTitle && (
          <RevealText
            as="h3"
            text={pillarsTitle}
            className="m-0 mb-10 sm:mb-14 font-normal text-3xl sm:text-5xl md:text-6xl leading-none tracking-tight text-white"
          />
        )}
        <Pillars items={pillarItems} />
      </Section>

      {/* ── Founders ─────────────────────────────────────────────────────── */}
      {people.length > 0 && (
        <Section id="founders" eyebrow={founders.eyebrow} className="scroll-mt-24">
          {founders.groupPhoto && (
            <figure className="fq-fade m-0 mb-14 max-w-[1300px] sm:mb-20">
              <div className="fq-frame w-full p-2.5">
                <div className="relative aspect-[3/2] overflow-hidden bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={founders.groupPhoto}
                    srcSet={`${String(founders.groupPhoto).replace("-1800.webp", "-900.webp")} 900w, ${founders.groupPhoto} 1800w`}
                    sizes="(min-width: 1300px) 1280px, 100vw"
                    alt={founders.groupPhotoAlt || "The founders of F.QUAD Studio"}
                    width={1800}
                    height={1200}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 block h-full w-full object-cover object-[50%_30%]"
                  />
                </div>
                <span className="fq-frame-b" aria-hidden="true" />
              </div>
            </figure>
          )}
          <div className="grid max-w-[1300px] grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-2">
            {people.map((person, i) => (
              <FounderCard key={`${person.name}-${i}`} person={person} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* ── Recognition ──────────────────────────────────────────────────── */}
      <Section
        id="recognition"
        eyebrow={recognition.eyebrow}
        className="scroll-mt-24"
        aside={
          <Link
            href="/awards"
            className="fq-link inline-block py-1.5 text-white/70 hover:text-white transition-colors"
          >
            View all awards
          </Link>
        }
      >
        <div className="grid max-w-[1500px] grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-5">
            {recognitionTitle && (
              <RevealText
                as="h3"
                text={recognitionTitle}
                className="m-0 font-normal uppercase text-3xl sm:text-5xl leading-[1.02] tracking-tight text-white"
              />
            )}
            <p
              className="fq-fade m-0 mt-7 max-w-[44ch] text-sm sm:text-base leading-[1.85] text-white/75"
              style={{ ["--i" as string]: 3 }}
            >
              {recognition.intro}
            </p>
          </div>

          {awards.length > 0 && (
            <ul role="list" className="m-0 min-w-0 list-none p-0 lg:col-span-7">
              {awards.map((name, i) => (
                <li
                  key={`${name}-${i}`}
                  className="fq-fade group flex items-baseline gap-5 border-b border-white/15 py-5 first:border-t sm:gap-8 sm:py-6"
                  style={{ ["--i" as string]: i + 1 }}
                >
                  <span
                    aria-hidden="true"
                    className="w-7 shrink-0 text-[11px] tracking-[0.18em] text-white/55 tabular-nums"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 break-words font-display text-base sm:text-xl md:text-2xl text-white/80 transition-transform duration-500 ease-out group-hover:translate-x-1.5 group-hover:text-white">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      {/* ── Closing ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/15 px-6 sm:px-14 py-24 sm:py-36">
        <ParallaxField items={CLOSING_ART} />
        <InView className="relative z-10 max-w-[1500px]">
          {closingStatement && (
            <ScrollWords
              as="h2"
              text={closingStatement}
              className="font-display m-0 max-w-[26ch] font-light text-2xl sm:text-4xl md:text-5xl leading-[1.22] tracking-tight text-white"
            />
          )}
          <p
            className="fq-fade m-0 mt-8 max-w-[52ch] text-base leading-relaxed text-white/70"
            style={{ ["--i" as string]: 2 }}
          >
            {closing.body}
          </p>
          <div
            className="fq-fade mt-10 flex flex-wrap items-center gap-5"
            style={{ ["--i" as string]: 3 }}
          >
            <Magnetic>
              <Link href={closing.primaryHref || "/past-projects"} className={OUTLINE_BTN}>
                {closing.primaryLabel}
              </Link>
            </Magnetic>
            <Magnetic>
              {/* Opened by the global data-start-project listener. */}
              <button type="button" data-start-project="true" className={PRIMARY_BTN}>
                {closing.secondaryLabel}
              </button>
            </Magnetic>
          </div>
        </InView>
      </section>
    </PageShell>
  );
}
