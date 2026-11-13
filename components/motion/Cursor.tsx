"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { damp, hasFinePointer, onFrame, prefersReducedMotion } from "@/lib/motion";

/**
 * The site's pointer is the brand arrow (public/assets/cursor), applied as a
 * real CSS cursor: no lag, exact hotspot, and the native cursor stays in
 * charge (text fields keep their I-beam). `data-fq-cursor` on <html> turns it
 * on for fine pointers outside /admin; see "Cursor" in globals.css.
 *
 * The follower element survives only as the label badge: elements can opt in
 * with `data-cursor-label="View"` and it trails the pointer on a spring.
 * Fine pointers only — never rendered for touch.
 */
export function Cursor() {
  const pathname = usePathname();
  const ringRef = useRef<HTMLDivElement>(null);
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
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!ring || !label || hidden) return;
    if (!hasFinePointer() || prefersReducedMotion()) return;

    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let scale = 1;
    let targetScale = 1;
    let visible = false;
    let currentLabel = "";

    const setState = (el: Element | null) => {
      const labelled = el?.closest<HTMLElement>("[data-cursor-label]");
      const interactive = el?.closest("a, button, [role='button'], summary, label");
      const text = labelled?.dataset.cursorLabel ?? "";
      if (text !== currentLabel) {
        currentLabel = text;
        label.textContent = text;
      }
      ring.dataset.mode = text ? "label" : interactive ? "link" : "idle";
      // A labelled target swaps the ring for a real-size badge (sized in CSS),
      // so its text is crisp rather than an 8px label blown up 4×.
      targetScale = text ? 1 : interactive ? 1.9 : 1;
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        x = tx;
        y = ty;
        ring.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
        ring.style.opacity = "1";
      }
      setState(e.target instanceof Element ? e.target : null);
    };
    const onLeave = () => {
      visible = false;
      ring.style.opacity = "0";
    };
    const onDown = () => (targetScale *= 0.82);
    const onUp = () => setState(document.elementFromPoint(tx, ty));
    // Scrolling moves the page under a still pointer; re-check what it is
    // over, or a label ("View project") lingers on whatever scrolls in next.
    let scrollRaf = 0;
    const onScroll = () => {
      if (!visible || scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        setState(document.elementFromPoint(tx, ty));
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    // Settled ring = no style writes: the loop idles instead of restyling
    // the ring 60 times a second while the pointer is still.
    const stop = onFrame((_, dt) => {
      if (
        Math.abs(tx - x) < 0.05 &&
        Math.abs(ty - y) < 0.05 &&
        Math.abs(targetScale - scale) < 0.001
      ) {
        return;
      }
      x = damp(x, tx, 16, dt);
      y = damp(y, ty, 16, dt);
      scale = damp(scale, targetScale, 14, dt);
      ring.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      // Counter-scale the label so the text doesn't grow with the ring.
      label.style.transform = `scale(${1 / scale})`;
    });

    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(scrollRaf);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      data-mode="idle"
      className="fq-cursor"
      style={{ opacity: 0 }}
    >
      <span ref={labelRef} className="fq-cursor-label" />
    </div>
  );
}
