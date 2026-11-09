"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { damp, hasFinePointer, onFrame, prefersReducedMotion } from "@/lib/motion";

/**
 * A quiet follower ring. The native cursor stays (hiding it hurts precision
 * and accessibility); the ring trails it on a spring and grows over anything
 * clickable. Elements can opt in to a label with `data-cursor-label="View"`.
 * Fine pointers only — never rendered for touch.
 */
export function Cursor() {
  const pathname = usePathname();
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const hidden = pathname.startsWith("/admin");

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
      targetScale = text ? 4.2 : interactive ? 1.9 : 1;
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        x = tx;
        y = ty;
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

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);

    const stop = onFrame((_, dt) => {
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
