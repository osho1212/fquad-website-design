"use client";

import { useEffect } from "react";

/**
 * Marks photographs as loaded so they can fade in over their skeleton.
 *
 * Photos opt in with the `fq-img` class. Until an image carries `data-loaded`
 * the CSS (globals.css, "Image loading") paints a shimmer on the image's own
 * box, so the frame is never an empty hole; once it loads, the shimmer goes
 * and the photo fades in.
 *
 *  - Images that were already on screen when the page hydrated are marked
 *    "ready" (no fade, so nothing flickers).
 *  - Images that finish afterwards are marked "fade".
 *  - A failed image is marked too, so its skeleton never shimmers forever.
 *
 * `load` and `error` don't bubble, so they are caught in the capture phase on
 * the document: one pair of listeners covers every image, including those
 * rendered by server components and by later client navigations.
 */
export function ImageLoader() {
  useEffect(() => {
    const mark = (img: HTMLImageElement, how: "ready" | "fade") => {
      if (img.dataset.loaded === undefined) img.dataset.loaded = how;
    };

    const onSettle = (e: Event) => {
      const t = e.target;
      if (t instanceof HTMLImageElement && t.classList.contains("fq-img")) {
        mark(t, e.type === "load" ? "fade" : "ready");
      }
    };
    document.addEventListener("load", onSettle, true);
    document.addEventListener("error", onSettle, true);

    // Images that settled before this ran (server-rendered, cached).
    document.querySelectorAll<HTMLImageElement>("img.fq-img").forEach((img) => {
      if (img.complete) mark(img, "ready");
    });

    return () => {
      document.removeEventListener("load", onSettle, true);
      document.removeEventListener("error", onSettle, true);
    };
  }, []);

  return null;
}
