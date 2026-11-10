import React from "react";

/**
 * Building blocks for the legal documents. Plain server components: a policy
 * is read, not performed, so there is no motion here beyond the shared hero.
 */

export interface LegalSectionDef {
  id: string;
  title: string;
  children: React.ReactNode;
}

/** Section numbering and the contents list are derived, so they can't drift. */
export function LegalDocument({
  updated,
  intro,
  sections,
}: {
  updated: string;
  intro?: React.ReactNode;
  sections: LegalSectionDef[];
}) {
  return (
    <section className="px-6 sm:px-14 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] gap-12 lg:gap-20 items-start">
      <nav aria-label="On this page" className="lg:sticky lg:top-28">
        <p className="m-0 mb-4 text-[11px] uppercase tracking-[0.22em] text-white/50 font-medium">
          Contents
        </p>
        <ol className="m-0 p-0 list-none flex flex-col">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="fq-link inline-flex gap-3 py-1.5 text-sm text-white/65 hover:text-white transition-colors"
              >
                <span className="tabular-nums text-white/40">{String(i + 1).padStart(2, "0")}</span>
                <span>{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="min-w-0 max-w-[74ch] [overflow-wrap:anywhere]">
        <p className="m-0 mb-8 text-[11px] uppercase tracking-[0.2em] text-white/50">
          Last updated: {updated}
        </p>
        {intro && <div className="mb-4">{intro}</div>}

        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-28">
            <h2 className="m-0 mt-14 mb-5 text-xl sm:text-2xl leading-snug tracking-tight uppercase text-white">
              <span className="mr-3 tabular-nums text-white/40">{String(i + 1).padStart(2, "0")}</span>
              {s.title}
            </h2>
            {s.children}
          </section>
        ))}
      </div>
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="m-0 mb-5 text-base sm:text-[17px] leading-[1.8] text-white/75">{children}</p>;
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="m-0 mt-8 mb-3 text-sm tracking-[0.12em] uppercase text-white">{children}</h3>
  );
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="m-0 mb-6 pl-6 list-disc marker:text-white/50 space-y-2 text-base sm:text-[17px] leading-[1.75] text-white/75">
      {children}
    </ul>
  );
}

/** A plain data table that stays readable on a phone (scrolls inside itself). */
export function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="mb-7 overflow-x-auto border border-white/15">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm leading-relaxed text-white/75">
        <thead>
          <tr className="border-b border-white/15 bg-white/[0.03]">
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white/60"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/10 last:border-b-0 align-top">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-3">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-white underline underline-offset-4 decoration-white/40 hover:decoration-white">
      {children}
    </a>
  );
}
