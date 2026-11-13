/* Portraits come from the CMS upload store, already resized (see
   responsiveImage in components/pages/blog/helpers). */
/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Art } from "@/components/parallax/art";

export interface Person {
  id: string;
  name: string;
  role: string;
  bio?: string | null;
  image?: { src: string; srcSet?: string } | null;
  /** Alt text from the media library, when an editor wrote one. */
  alt?: string | null;
  linkedIn?: string | null;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const SIZES = {
  lead: "(min-width: 768px) 45vw, 100vw",
  grid: "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw",
};

/**
 * A portrait mounted on a drawing sheet (corner ticks sit just outside the
 * photo), with name, role and bio beneath. `lead` is the large two-up used
 * for the principals; `grid` is the compact three-up for everyone else.
 */
export function PersonCard({
  person,
  variant = "grid",
  index = 0,
}: {
  person: Person;
  variant?: "lead" | "grid";
  /** Stagger position within its row. */
  index?: number;
}) {
  const lead = variant === "lead";

  return (
    <article
      className="fq-fade group flex flex-col min-w-0"
      style={{ ["--i" as string]: index }}
    >
      {/* p-3.5 = the 14px tick size, so the ticks frame the photo instead of covering it. */}
      <figure className="fq-frame m-0 p-3.5">
        <div className="relative overflow-hidden bg-zinc-900 aspect-[4/5]">
          {person.image ? (
            <img
              src={person.image.src}
              srcSet={person.image.srcSet}
              sizes={lead ? SIZES.lead : SIZES.grid}
              alt={person.alt?.trim() || `Portrait of ${person.name}, ${person.role}`}
              loading="lazy"
              decoding="async"
              className="fq-img absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.03]"
            />
          ) : (
            // No photo yet: a hatched sheet with initials, so the grid keeps its rhythm.
            <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
              {/* Opacity, not a text-white/NN tier: the light theme turns those into solid greys. */}
              <div className="absolute inset-[12%] text-white opacity-[0.14] [&>svg]:block [&>svg]:w-full [&>svg]:h-full">
                <Art name="hatch" />
              </div>
              <span className="relative font-display text-4xl sm:text-5xl tracking-[0.1em] text-white/60">
                {initials(person.name)}
              </span>
            </div>
          )}
        </div>
        <span className="fq-frame-b" aria-hidden="true" />
      </figure>

      <div className="px-3.5 pt-6">
        <h3
          className={`m-0 uppercase leading-tight tracking-tight text-white break-words ${
            lead ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
          }`}
        >
          {person.name}
        </h3>
        {person.role && (
          <p className="m-0 mt-2.5 text-[11px] tracking-[0.2em] uppercase text-white/60">
            {person.role}
          </p>
        )}

        {person.bio && (
          <p
            className={`m-0 mt-5 max-w-[52ch] leading-relaxed text-white/70 ${
              lead ? "text-sm sm:text-base" : "text-sm"
            }`}
          >
            {person.bio}
          </p>
        )}

        {person.linkedIn && (
          <a
            href={person.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="fq-link inline-block py-1.5 mt-3 text-[11px] tracking-[0.18em] uppercase text-white/80 hover:text-white transition-colors"
          >
            LinkedIn <span aria-hidden="true">↗</span>
            <span className="sr-only"> profile of {person.name} (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}
