// Small, dependency-free helpers shared by the journal, team and awards pages.

import { mediaUrl } from "@/lib/public-content";
import type { getBlogPosts } from "@/lib/public-content";

export type BlogPostRecord = Awaited<ReturnType<typeof getBlogPosts>>[number];

// The studio is in Hyderabad. Pinning the zone stops a post published late in
// the evening IST from showing yesterday's date when the page is built on a
// UTC server.
const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

/**
 * A failed query becomes an empty list. These pages are rendered ahead of time
 * and every one has a designed fallback for "no rows", so an unreachable
 * database should land there instead of failing the build or the request.
 */
export function orEmpty<T>(query: Promise<T[]>): Promise<T[]> {
  return query.catch(() => [] as T[]);
}

/** "02 people" / "01 person": the zero-padded count used in section headers. */
export const countLabel = (n: number, one: string, many: string) =>
  `${String(n).padStart(2, "0")} ${n === 1 ? one : many}`;

export const formatDate = (d: Date) => DATE.format(d);

/** Falls back to creation time for posts saved before being published. */
export const postDate = (p: { publishedAt: Date | null; createdAt: Date }) =>
  p.publishedAt ?? p.createdAt;

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(body: string): number {
  return Math.max(1, Math.ceil(wordCount(body) / 200));
}

/** The editor's excerpt, or a clean first sentence-ish slice of the body. */
export function excerptOf(post: { excerpt: string | null; body: string }, max = 160): string {
  const own = post.excerpt?.trim();
  if (own) return own;

  const flat = post.body
    .replace(/\r\n?/g, "\n")
    // Drop block markers (headings, quotes, bullets) so they don't leak into a meta description.
    .replace(/^\s*(#{1,3}\s+|>\s?|[-*•]\s+)/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  if (flat.length <= max) return flat;

  const cut = flat.slice(0, max);
  const space = cut.lastIndexOf(" ");
  const clean = (space > max / 2 ? cut.slice(0, space) : cut).replace(/[\s,.;:–—-]+$/, "");
  return `${clean}…`;
}

export function shorten(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

type MediaLike = {
  path: string;
  alt?: string | null;
  variants: { label: string; path: string; width?: number | null }[];
};

// Upload pipeline output (lib/media.ts): resize-only, so every variant shares
// one aspect ratio and is safe to offer as a srcset.
const NOMINAL: Record<string, number> = { thumb: 400, medium: 1000, full: 1920 };

/**
 * `src` + `srcSet` for a CMS image, so phones pull the 400w/1000w renditions
 * instead of the 1920w one.
 */
export function responsiveImage(
  media: MediaLike | null | undefined,
  prefer: "medium" | "full" = "medium"
): { src: string; srcSet?: string; alt?: string } | null {
  if (!media) return null;
  const src = mediaUrl(media, prefer);
  if (!src) return null;

  const seen = new Set<number>();
  const srcSet = media.variants
    .filter((v) => v.label in NOMINAL)
    .map((v) => ({ path: v.path, w: v.width ?? NOMINAL[v.label] }))
    .sort((a, b) => a.w - b.w)
    // Small sources aren't upscaled, so two labels can share a width.
    .filter((v) => (seen.has(v.w) ? false : (seen.add(v.w), true)))
    .map((v) => `${v.path} ${v.w}w`)
    .join(", ");

  return { src, srcSet: srcSet || undefined, alt: media.alt?.trim() || undefined };
}

/** Root-relative upload paths become absolute for Open Graph and JSON-LD. */
export function absoluteUrl(pathOrUrl: string, origin: string): string {
  try {
    return new URL(pathOrUrl, origin).toString();
  } catch {
    return pathOrUrl;
  }
}
