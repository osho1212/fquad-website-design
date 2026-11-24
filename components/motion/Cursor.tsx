"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

/**
 * The site's pointer is the brand arrow (public/assets/cursor), applied as a
 * real CSS cursor: no lag, exact hotspot, and the native cursor stays in
 * charge (text fields keep their I-beam). `data-fq-cursor` on <html> turns it
 * on for fine pointers outside /admin; see "Cursor" in globals.css.
 *
 * Beside it, a square label tag ("Click to view") sits to the right of the
 * pointer over elements that opt in with `data-cursor-label="…"` (the
 * featured project cards). It is pinned to the pointer with no easing.
 * Fine pointers only — never rendered for touch.
 */
const OFFSET_X = 22;

export function Cursor() {
  const pathname = usePathname();
  const tagRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const hidden = pathname.startsWith("/admin");

  // The brand arrow: touch devices and the admin keep their normal pointer.
  useEffect(() => {
    if (hidden || !hasFinePointer()) return;
    const root = document.documentElement;
    root.setAttribute("data-fq-cursor", "");
    return () => root.removeAttribute("data-fq-cursor");
  }, [hidden]);

  useEffect(() => {
    const tag = tagRef.current;
    const label = labelRef.current;
    if (!tag || !label || hidden) return;
    if (!hasFinePointer() || prefersReducedMotion()) return;

    let tx = -100;
    let ty = -100;
    let visible = false;
    let currentLabel = "";

    const place = () => {
      tag.style.transform = `translate3d(${tx + OFFSET_X}px, ${ty}px, 0) translate(0, -50%)`;
    };

    const setState = (el: Element | null) => {
      const labelled = el?.closest<HTMLElement>("[data-cursor-label]");
      const text = labelled?.dataset.cursorLabel ?? "";
      if (text !== currentLabel) {
        currentLabel = text;
        if (text) label.textContent = text;
      }
      tag.dataset.mode = text ? "label" : "idle";
    };

    const onMove = (e: PointerEvent) => {
      // Pinned to the pointer, no easing, so it never trails behind.
      tx = e.clientX;
      ty = e.clientY;
      visible = true;
      place();
      setState(e.target instanceof Element ? e.target : null);
    };
    const onLeave = () => {
      visible = false;
      currentLabel = "";
      tag.dataset.mode = "idle";
    };
    // Scrolling moves the page under a still pointer; re-check what it is
    // over, or the tag lingers on whatever scrolls in next.
    let scrollRaf = 0;
    const onScroll = () => {
      if (!visible || scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        setState(document.elementFromPoint(tx, ty));
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(scrollRaf);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div ref={tagRef} aria-hidden="true" data-mode="idle" className="fq-cursor">
      <span ref={labelRef} className="fq-cursor-label" />
    </div>
  );
}
