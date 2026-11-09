import React from "react";

/**
 * Recognitions as large type, one ruled row each, with no years: the CMS
 * lists who has recognised the studio, not when, and a made-up date would be
 * worse than none. Short enough to sit inside a Section's own InView.
 */
export function RecognitionList({ items }: { items: string[] }) {
  return (
    <ol role="list" className="m-0 p-0 list-none min-w-0">
      {items.map((name, i) => (
        <li
          key={name}
          className="fq-fade relative grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-5 sm:gap-x-10 py-6 sm:py-9"
          style={{ ["--i" as string]: i }}
        >
          <span
            aria-hidden="true"
            className="fq-rule absolute top-0 left-0 right-0 h-px bg-white/25"
            style={{ ["--i" as string]: i }}
          />
          <span
            aria-hidden="true"
            className="text-[11px] tracking-[0.2em] text-white/60 tabular-nums"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="font-display uppercase text-2xl sm:text-4xl md:text-5xl xl:text-6xl leading-[1.08] tracking-tight text-white break-words">
            {name}
          </span>
        </li>
      ))}
      {/* Closing rule under the last row. */}
      <li aria-hidden="true" className="relative h-px list-none">
        <span className="fq-rule absolute inset-0 bg-white/25" />
      </li>
    </ol>
  );
}
