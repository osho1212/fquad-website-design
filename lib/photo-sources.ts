// lib/photo-sources.ts
// The smaller copies of a photograph that sit beside its JPEG. A browser reads
// the first one it understands and falls back to the JPEG, so every visitor
// gets the smallest file their browser can show.
//
//   /assets/images/<name>.jpg            → .avif and .webp beside them
//                                           (node scripts/encode-photo-formats.mjs)
//   /uploads/<id>/full.jpg               → full.webp beside it
//                                           (lib/media.ts writes one for every upload)
//
// Shipped photos come in one size, so format is the only saving available to
// them — which is why they are worth routing through <picture>. Uploads have
// three sizes (lib/img.ts), and picking the right size beats picking the right
// format, so a caller that supplies a width srcSet wins: see ModernImage.
//
// Safe on the server and in the browser: it only builds addresses.

export interface PhotoSource {
  type: string;
  srcSet: string;
}

// Every photograph under /assets/images, not just the wwd-/hww- sets: the
// stock photos behind the four faces and the services pages are the heaviest
// files the site ships, and they had been going out as bare JPEGs.
const SHIPPED = /^(\/assets\/images\/[a-z0-9-]+)\.jpg$/;
const UPLOADED = /^(\/uploads\/[A-Za-z0-9_-]+\/full)\.jpg$/;

/** AVIF and WebP copies of a JPEG address, best first; none for any other address. */
export function modernSources(src: string): PhotoSource[] {
  const shipped = SHIPPED.exec(src);
  if (shipped) {
    return [
      { type: "image/avif", srcSet: `${shipped[1]}.avif` },
      { type: "image/webp", srcSet: `${shipped[1]}.webp` },
    ];
  }
  const uploaded = UPLOADED.exec(src);
  if (uploaded) return [{ type: "image/webp", srcSet: `${uploaded[1]}.webp` }];
  return [];
}

/** The single best address for places that cannot offer a choice (an SVG <image>). */
export function bestSingleSource(src: string): string {
  const webp = modernSources(src).find((s) => s.type === "image/webp");
  return webp ? webp.srcSet : src;
}
