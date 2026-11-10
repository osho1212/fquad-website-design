import type { Metadata } from "next";
import { SITE } from "./site";

interface PageMeta {
  /** Page name only — "Services". The studio name is appended. */
  title: string;
  description: string;
  /** Path of the page, e.g. "/services/architecture" (used for canonical + OG). */
  path: string;
  /** Absolute or root-relative image; falls back to the generated site card. */
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
}

/**
 * Every public page's <head>: title, description, canonical, Open Graph and
 * Twitter. Before this, six pages shipped the site-wide default for all of
 * these, so every share and every search result looked identical.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noIndex,
}: PageMeta): Metadata {
  const full = `${title} — ${SITE.name}`;
  // Passing `images` here replaces the site-wide card, so pages without a
  // picture of their own must name it explicitly or they share with none.
  const images = image
    ? [{ url: image }]
    : [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE.name }];
  return {
    title: full,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: full,
      description,
      url: path,
      siteName: SITE.name,
      locale: SITE.locale,
      type,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Serialises structured data for a <script type="application/ld+json">. */
export function jsonLd(data: Record<string, unknown>): string {
  // `<` is escaped so content can never close the script tag early.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function breadcrumbJsonLd(crumbs: { name: string; path: string }[], origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${origin}${c.path}`,
    })),
  };
}
