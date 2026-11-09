import React from "react";
import { InView } from "@/components/motion/InView";

/**
 * A page section with the site's standard header row: a hairline that draws
 * in, an eyebrow on the left and an optional aside (a link) on the right.
 * Children can use `.fq-fade` / `.fq-rule` to join the same reveal.
 */
export function Section({
  id,
  eyebrow,
  aside,
  children,
  className = "",
  bleed = false,
}: {
  id?: string;
  eyebrow?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Drop the horizontal padding for full-bleed content. */
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={`relative ${bleed ? "" : "px-6 sm:px-14"} py-16 sm:py-24 ${className}`}
    >
      <InView>
        {(eyebrow || aside) && (
          <div
            className={`relative flex justify-between items-baseline pt-6 mb-10 sm:mb-14 ${
              bleed ? "px-6 sm:px-14" : ""
            }`}
          >
            <span aria-hidden="true" className="fq-rule absolute top-0 left-0 right-0 h-px bg-white/25" />
            {eyebrow && (
              <h2 className="fq-fade m-0 font-medium text-[11px] tracking-[0.24em] text-white/60 uppercase">
                {eyebrow}
              </h2>
            )}
            {aside && (
              <div className="fq-fade text-[11px] tracking-[0.18em] uppercase" style={{ ["--i" as string]: 1 }}>
                {aside}
              </div>
            )}
          </div>
        )}
        {children}
      </InView>
    </section>
  );
}
