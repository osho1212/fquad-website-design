import React from "react";
import { InView } from "@/components/motion/InView";

export interface AwardRecord {
  id: string;
  year: number;
  title: string;
  body: string;
}

export interface YearGroup {
  year: number;
  items: AwardRecord[];
}

/** The records arrive newest-year first; grouping keeps that order. */
export function groupByYear(awards: AwardRecord[]): YearGroup[] {
  const groups: YearGroup[] = [];
  for (const award of awards) {
    const last = groups[groups.length - 1];
    if (last && last.year === award.year) last.items.push(award);
    else groups.push({ year: award.year, items: [award] });
  }
  return groups;
}

/**
 * A ledger of recognition: one ruled row per year, the year set large on the
 * left and that year's awards on the right.
 *
 * Each row owns its InView. A single observer around the whole list would
 * need 15% of a very tall element on screen at once, which a long history of
 * awards could never satisfy, leaving every row invisible.
 */
export function AwardsByYear({ groups }: { groups: YearGroup[] }) {
  return (
    <ol role="list" className="m-0 p-0 list-none">
      {groups.map((group) => (
        <InView
          as="li"
          key={group.year}
          className="relative grid grid-cols-1 md:grid-cols-[minmax(0,0.34fr)_minmax(0,1fr)] gap-x-12 gap-y-6 py-10 sm:py-14"
        >
          <span
            aria-hidden="true"
            className="fq-rule absolute top-0 left-0 right-0 h-px bg-white/25"
          />

          {/* Sticks beside its awards while a long year scrolls past. */}
          <h3 className="fq-outline fq-fade m-0 self-start md:sticky md:top-28 font-light text-5xl sm:text-6xl md:text-7xl leading-none tracking-tight tabular-nums">
            {group.year}
          </h3>

          <ul role="list" className="m-0 p-0 list-none divide-y divide-white/15 min-w-0">
            {group.items.map((award, i) => (
              <li
                key={award.id}
                className="fq-fade py-6 first:pt-0 last:pb-0"
                style={{ ["--i" as string]: i + 1 }}
              >
                <h4 className="m-0 text-lg sm:text-2xl leading-snug tracking-tight text-white break-words">
                  {award.title}
                </h4>
                {award.body && (
                  <p className="m-0 mt-3 max-w-[60ch] text-sm sm:text-base leading-relaxed text-white/70">
                    {award.body}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </InView>
      ))}
    </ol>
  );
}
