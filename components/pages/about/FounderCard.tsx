import React from "react";
import { responsive } from "@/lib/img";

export interface Founder {
  name: string;
  role: string;
  portrait?: string;
  bio: string;
}

/** Pencil-hatching in the theme's ink, so the placeholder reads as a drawing, not a grey box. */
const HATCH =
  "repeating-linear-gradient(135deg, rgb(var(--fq-fg) / 0.07) 0, rgb(var(--fq-fg) / 0.07) 1px, transparent 1px, transparent 11px)";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * A founder: portrait (or a hatched initials plate until one is uploaded),
 * name, role and bio. Server-rendered — the reveal is the `.fq-fade` class,
 * driven by the Section's InView.
 */
export function FounderCard({ person, index }: { person: Founder; index: number }) {
  return (
    <article className="fq-fade min-w-0" style={{ ["--i" as string]: index + 1 }}>
      {/* Corner ticks sit just outside the portrait, like a viewfinder. */}
      <div className="fq-frame w-full max-w-[320px] p-2.5">
        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
          {person.portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              {...responsive(person.portrait, "320px", [640, 828])}
              alt={`Portrait of ${person.name}, ${person.role}`}
              width={600}
              height={800}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 block h-full w-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundImage: HATCH }}
            >
              <span className="fq-outline select-none font-display text-6xl sm:text-7xl tracking-tight">
                {initialsOf(person.name)}
              </span>
            </div>
          )}
        </div>
        <span className="fq-frame-b" aria-hidden="true" />
      </div>

      <h3 className="m-0 mt-7 font-normal uppercase text-xl sm:text-2xl lg:text-3xl tracking-tight text-white">
        {person.name}
      </h3>
      <p className="m-0 mt-2.5 text-[11px] tracking-[0.2em] text-white/60 uppercase">
        {person.role}
      </p>
      <span aria-hidden="true" className="my-5 block h-px w-full max-w-[320px] bg-white/15" />
      <p className="m-0 max-w-[54ch] text-sm sm:text-[15px] leading-[1.85] text-white/75">
        {person.bio}
      </p>
    </article>
  );
}
