/**
 * Responsive URLs for plain <img> tags, built from renditions that already
 * exist on disk — nothing is resized on demand.
 *
 * This module used to point every photograph at Next's optimiser
 * (/_next/image?url=…&w=…). That asked Vercel to resize pictures the upload
 * pipeline had already resized, and in November 2026 the account's
 * transformation quota ran out: the optimiser began answering
 * 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED and every photo that was not
 * already in the edge cache broke on the live site.
 *
 * So the optimiser is out of the picture. lib/image-pipeline.mjs writes a
 * 400 px thumb, a 1000 px medium and a 1920 px full for every upload, which is
 * exactly the srcSet a browser needs to choose its own size — for free, and
 * without a server in the request path.
 *
 * Shipped photos under /assets have one size only. Their AVIF and WebP copies
 * are offered through <picture> (lib/photo-sources.ts, rendered by
 * ModernImage), not from here.
 */

/** The renditions lib/image-pipeline.mjs writes beside every upload. */
const UPLOAD_SIZES = [
  { file: "thumb.jpg", width: 400 },
  { file: "medium.jpg", width: 1000 },
  { file: "full.jpg", width: 1920 },
] as const;

/**
 * `/uploads/<id>/full.jpg` — the address a CMS photo is always referred to by,
 * and the one its smaller copies sit beside.
 */
const UPLOAD_FULL = /^(\/uploads\/[A-Za-z0-9_-]+\/)full\.jpg$/;

/** The widest a caller might draw a photo, when it does not say. */
export const IMG_WIDTHS = [640, 828, 1080, 1200, 1920] as const;

/** Whether this address has smaller copies beside it. */
export function hasRenditions(src: string | undefined): src is string {
  return typeof src === "string" && UPLOAD_FULL.test(src);
}

/**
 * `src`, `srcSet` and `sizes` for an <img>. `sizes` describes how wide the
 * picture is drawn, so the browser can pick the smallest copy that will do.
 *
 * `widths` is the caller's idea of the largest it will ever need. It caps the
 * set — a 96 px thumbnail has no use for the 1920 px rendition — but it no
 * longer invents widths, since only the three renditions above exist.
 *
 * An address with no renditions (a shipped /assets photo, an SVG, a remote
 * URL) comes back untouched.
 */
export function responsive(
  src: string,
  sizes: string,
  widths: readonly number[] = IMG_WIDTHS
): { src: string; srcSet?: string; sizes?: string } {
  const upload = UPLOAD_FULL.exec(src);
  if (!upload) return { src };
  const dir = upload[1];

  // Keep every rendition up to the cap, plus the first one past it, so a
  // high-density screen still has something larger than it draws.
  const cap = widths.length ? Math.max(...widths) : 1920;
  const picked: { file: string; width: number }[] = [];
  for (const size of UPLOAD_SIZES) {
    picked.push(size);
    if (size.width >= cap) break;
  }

  return {
    // The largest of the chosen set, for anything that ignores srcSet.
    src: `${dir}${picked[picked.length - 1].file}`,
    srcSet: picked.map((s) => `${dir}${s.file} ${s.width}w`).join(", "),
    sizes,
  };
}
