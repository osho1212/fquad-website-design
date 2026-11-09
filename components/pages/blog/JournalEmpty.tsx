import React from "react";
import { Section } from "@/components/layout/Section";
import { Art, type ArtName } from "@/components/parallax/art";
import { TextAction } from "./ui";

/**
 * What the journal will be about. These are topics, not fake articles: each is
 * drawn from what the studio already does (see the project write-ups and the
 * Services page) and carries no date, author or link.
 */
const TOPICS: { title: string; body: string; art: ArtName }[] = [
  {
    title: "Materials and finishes",
    body: "How we choose, pair and detail veneer, stone and textured plaster, and which of them still look right after years of daily use.",
    art: "vase",
  },
  {
    title: "Small-space planning",
    body: "Circulation, storage and furniture that earns its footprint: how a compact flat or a tight floor plate can feel generous.",
    art: "plan",
  },
  {
    title: "Working with light",
    body: "Reading a room's daylight before placing a single fitting, then layering pendants, lamps and concealed profile lights on top.",
    art: "pendant",
  },
  {
    title: "Reuse and heritage",
    body: "Giving reclaimed arches, doors and old furniture a new role in a contemporary interior, without turning them into decoration.",
    art: "mirror",
  },
];

/**
 * The /blog page before any entry is published: an editorial note and the
 * topics the studio means to write about, so the page still gives a visitor
 * something real to read and somewhere to go.
 */
export function JournalEmpty() {
  return (
    <>
      <Section eyebrow="From the studio">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-10 max-w-[1500px]">
          <p className="fq-fade m-0 lg:col-span-7 font-display font-light text-2xl sm:text-3xl md:text-4xl leading-[1.3] tracking-tight text-white max-w-[26ch]">
            The details are where a room is won or lost. We are writing them down.
          </p>

          <div className="lg:col-span-5 lg:pt-3 max-w-[52ch]">
            <p
              className="fq-fade m-0 text-base leading-relaxed text-white/70"
              style={{ ["--i" as string]: 1 }}
            >
              This journal will collect what we learn on site and at the drawing board: how a finish
              ages, how light moves through a room across the day, how a plan can be made to work
              harder. Plain notes from the people who design, specify and supervise the work, with
              no trend lists.
            </p>
            <p
              className="fq-fade m-0 mt-5 text-base leading-relaxed text-white/70"
              style={{ ["--i" as string]: 2 }}
            >
              The first entries are still being written. Until then, our projects are the fullest
              record of how we think: each one is set out as a brief, a concept, a plan, a palette
              and an outcome.
            </p>
            <div className="fq-fade mt-4" style={{ ["--i" as string]: 3 }}>
              <TextAction action={{ label: "How we work →", href: "/services" }} />
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="What we will write about"
        aside={
          <span className="text-white/60">{String(TOPICS.length).padStart(2, "0")} topics</span>
        }
        className="!pt-0"
      >
        <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/15 border border-white/15">
          {TOPICS.map((topic, i) => (
            <li
              key={topic.title}
              className="fq-fade min-w-0 bg-black/60 backdrop-blur-md p-7 sm:p-9"
              style={{ ["--i" as string]: i }}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-[11px] tracking-[0.2em] uppercase text-white/60 tabular-nums">
                  Topic {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden="true"
                  className="block w-12 shrink-0 text-white/60 [&>svg]:block [&>svg]:w-full [&>svg]:h-auto"
                >
                  <Art name={topic.art} />
                </span>
              </div>
              <h3 className="m-0 mt-8 font-semibold text-lg sm:text-xl md:text-2xl tracking-tight text-white">
                {topic.title}
              </h3>
              <p className="m-0 mt-3 max-w-[46ch] text-sm sm:text-base leading-relaxed text-white/70">
                {topic.body}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
