/**
 * Responsive URLs through Next's image optimiser for plain <img> tags.
 *
 * The site's photos are 350–650 KB JPEGs straight from the studio. Routed
 * through /_next/image they arrive as AVIF/WebP at the width the layout
 * actually draws (a 570 KB photo becomes ~70 KB at 828px). Only same-origin
 * paths are rewritten: remote URLs (CMS uploads on another host) and SVGs
 * pass through untouched, since the optimiser would refuse them.
 */

/** Widths Next serves by default (images.deviceSizes). */
export const IMG_WIDTHS = [640, 828, 1080, 1200, 1920] as const;

export function isOptimisable(src: string | undefined): src is string {
  return (
    typeof src === "string" &&
    src.startsWith("/") &&
    !src.startsWith("//") &&
    !src.startsWith("/_next/") &&
    !/\.svg(\?|$)/i.test(src)
  );
}

/** One optimised URL at a given width. */
export function optimised(src: string, width: number, quality = 72): string {
  if (!isOptimisable(src)) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

/**
 * `src`, `srcSet` and `sizes` for an <img>. `sizes` describes how wide the
 * image is drawn, so the browser picks the smallest adequate file.
 */
export function responsive(
  src: string,
  sizes: string,
  widths: readonly number[] = IMG_WIDTHS
): { src: string; srcSet?: string; sizes?: string } {
  if (!isOptimisable(src)) return { src };
  return {
    src: optimised(src, widths[Math.min(1, widths.length - 1)]),
    srcSet: widths.map((w) => `${optimised(src, w)} ${w}w`).join(", "),
    sizes,
  };
}
