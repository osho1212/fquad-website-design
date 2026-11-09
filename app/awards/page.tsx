import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { AwardsByYear, groupByYear } from "@/components/pages/awards/AwardsByYear";
import { RecognitionList } from "@/components/pages/awards/RecognitionList";
import { ClosingBand } from "@/components/pages/blog/ClosingBand";
import { countLabel, orEmpty } from "@/components/pages/blog/helpers";
import { PrimaryAction, TextAction } from "@/components/pages/blog/ui";
import { getPage } from "@/lib/cms/content";
import { getAwards } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Awards & Recognition",
  description:
    "The awards and institutions that have recognised F.QUAD Studio's architecture and interior design work in Hyderabad.",
  path: "/awards",
});

/**
 * Merge several lists of names, dropping repeats ("IIID" appears on both the
 * home marquee and the About page) while keeping the first spelling and order.
 */
function mergeNames(...lists: unknown[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const raw of list) {
      if (typeof raw !== "string") continue;
      const name = raw.trim().replace(/\s+/g, " ");
      const key = name.normalize("NFKC").toLowerCase();
      if (!name || seen.has(key)) continue;
      seen.add(key);
      out.push(name);
    }
  }
  return out;
}

export default async function AwardsPage() {
  const [awards, content, home, about] = await Promise.all([
    // An unreachable database falls through to the CMS recognitions below.
    orEmpty(getAwards()),
    getPage("awards"),
    getPage("home"),
    getPage("about"),
  ]);

  const hero = content.hero;
  const groups = groupByYear(awards);
  const hasRecords = awards.length > 0;

  // With no award rows the recognitions already written elsewhere in the CMS
  // are the content. They carry no dates, so none are shown.
  const names = mergeNames(home.awards_marquee?.items, about.recognition?.items);

  // The About page's headline award count ("22+ Design Awards"), when present.
  const stat = ((about.stats?.items ?? []) as { number?: number | string; suffix?: string; label?: string }[]).find(
    (s) => s?.label && /award/i.test(s.label)
  );

  const intro =
    (typeof hero.intro === "string" && hero.intro) ||
    (hasRecords
      ? "Awards earned by F.QUAD Studio's architecture and interior design work, year by year."
      : about.recognition?.intro ||
        "The institutions and publications that have recognised F.QUAD Studio's work.");

  return (
    <PageShell>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} intro={intro} art="dining">
        <PrimaryAction action={{ label: "Start a project", startProject: true }} />
        <TextAction action={{ label: "See past projects →", href: "/past-projects" }} />
      </PageHero>

      {hasRecords ? (
        <>
          {/* Header only: the list below reveals row by row (see AwardsByYear). */}
          <Section
            eyebrow="Recognition by year"
            aside={
              <span className="text-white/60">
                {countLabel(awards.length, "award", "awards")} / {countLabel(groups.length, "year", "years")}
              </span>
            }
            className="!pb-0"
          >
            {null}
          </Section>
          <div className="px-6 sm:px-14 pb-20 sm:pb-28">
            <div className="max-w-[1500px]">
              <AwardsByYear groups={groups} />
            </div>
          </div>
        </>
      ) : (
        names.length > 0 && (
          <Section
            eyebrow="Recognised by"
            aside={
              <span className="text-white/60">
                {countLabel(names.length, "institution", "institutions")}
              </span>
            }
          >
            <div
              className={`max-w-[1500px] ${
                stat ? "grid grid-cols-1 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,1fr)] gap-10 lg:gap-16" : ""
              }`}
            >
              {stat && (
                // dt first for assistive tech; the figure is displayed above its label.
                <dl className="fq-fade m-0 flex flex-col-reverse gap-3 lg:sticky lg:top-28 self-start">
                  <dt className="text-[11px] tracking-[0.2em] uppercase text-white/60">{stat.label}</dt>
                  <dd className="fq-outline m-0 font-display font-light text-6xl sm:text-7xl leading-none tabular-nums">
                    {stat.number}
                    {stat.suffix}
                  </dd>
                </dl>
              )}
              <RecognitionList items={names} />
            </div>
          </Section>
        )
      )}

      <ClosingBand
        eyebrow="Our work"
        title={"See the work\nbehind it."}
        body="Browse the projects, or tell us about the space you have in mind."
        primary={{ label: "Start a project", startProject: true }}
        secondary={{ label: "Read our story →", href: "/about" }}
      />
    </PageShell>
  );
}
