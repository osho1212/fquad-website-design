"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { onFrame, prefersReducedMotion } from "@/lib/motion";

/** Hairline reading-progress rule at the very top of the viewport. */
export function ScrollProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const hidden = pathname.startsWith("/admin");

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || hidden || prefersReducedMotion()) return;
    let last = -1;
    return onFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (Math.abs(p - last) < 0.0004) return;
      last = p;
      bar.style.transform = `scaleX(${p})`;
    });
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-white"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
