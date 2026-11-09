"use client";

import { scrollToY } from "@/lib/motion";

/** Footer control: glides to the top through Lenis when it's running. */
export function BackToTop({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => scrollToY(0, { duration: 1.4 })}
      className={`fq-link inline-flex items-center gap-2 min-h-[28px] cursor-pointer ${className}`}
    >
      Back to top
      <span aria-hidden="true">↑</span>
    </button>
  );
}
