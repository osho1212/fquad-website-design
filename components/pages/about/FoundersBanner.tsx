import React from "react";
import { InView } from "@/components/motion/InView";

export interface Founder {
  name: string;
  role: string;
  bio: string;
}

/** "Amit Shah" → "Amit": the small label above each description. */
const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/**
 * One banner for the founders together: their joint photo beside both names
 * and both descriptions. Replaces the separate portrait cards, which showed
 * placeholders because there is no photo of each person on their own.
 *
 * Wraps itself in `InView` so the `.fq-fade` reveal works wherever it is used
 * (the About page's Section already has one; the Studio page does not).
 */
export function FoundersBanner({
  photo,
  photoAlt,
  people,
}: {
  photo?: string;
  photoAlt?: string;
  people: Founder[];
}) {
  const names = people.map((p) => p.name).filter(Boolean);
  const withPhoto = Boolean(photo);

  return (
    <InView
      as="article"
      className={`grid max-w-[1300px] grid-cols-1 items-center gap-10 ${
        withPhoto ? "lg:grid-cols-[1.2fr_1fr] lg:gap-16" : ""
      }`}
    >
      {withPhoto && (
        <figure className="fq-fade m-0 min-w-0">
          <div className="fq-frame w-full p-2.5">
            <div className="relative aspect-[3/2] overflow-hidden bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                srcSet={`${String(photo).replace("-1800.webp", "-900.webp")} 900w, ${photo} 1800w`}
                sizes="(min-width: 1300px) 700px, (min-width: 1024px) 55vw, 100vw"
                alt={photoAlt || `${names.join(" and ")}, founders of F.QUAD Studio`}
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

      <div className="min-w-0">
        <h3
          className="fq-fade m-0 font-normal uppercase tracking-tight text-white leading-[1.08] text-3xl sm:text-4xl lg:text-5xl"
          style={{ ["--i" as string]: 1 }}
        >
          {names.map((n, i) => (
            <span key={`${n}-${i}`} className="block">
              {i > 0 ? `& ${n}` : n}
            </span>
          ))}
        </h3>

        <span
          aria-hidden="true"
          className="fq-fade my-7 block h-px w-full max-w-[320px] bg-white/15"
          style={{ ["--i" as string]: 2 }}
        />

        <div className="flex flex-col gap-7">
          {people.map((person, i) => (
            <div key={`${person.name}-${i}`} className="fq-fade min-w-0" style={{ ["--i" as string]: i + 3 }}>
              <p className="m-0 text-[11px] tracking-[0.2em] text-white/60 uppercase">
                {firstName(person.name)} · {person.role}
              </p>
              <p className="m-0 mt-3 max-w-[56ch] text-sm sm:text-[15px] leading-[1.85] text-white/75">
                {person.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </InView>
  );
}
