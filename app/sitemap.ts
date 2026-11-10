import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getServices } from "@/lib/services";
import { getPastProjects } from "@/lib/past-projects";
import { getBlogPosts } from "@/lib/public-content";

export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/studio", priority: 0.8 },
  { path: "/services", priority: 0.9 },
  { path: "/past-projects", priority: 0.9 },
  { path: "/about", priority: 0.7 },
  { path: "/team", priority: 0.5 },
  { path: "/awards", priority: 0.5 },
  { path: "/testimonials", priority: 0.5 },
  { path: "/blog", priority: 0.5 },
  { path: "/contact", priority: 0.8 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
];

/** A failing data source must never take the whole sitemap down with it. */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl();
  const now = new Date();

  const [services, projects, posts] = await Promise.all([
    safe(getServices, []),
    safe(getPastProjects, []),
    safe(getBlogPosts, []),
  ]);

  return [
    ...STATIC_ROUTES.map((r) => ({
      url: `${origin}${r.path}`,
      lastModified: now,
      priority: r.priority,
    })),
    ...services.map((s) => ({
      url: `${origin}/services/${s.slug}`,
      lastModified: now,
      priority: 0.7,
    })),
    ...projects.map((p) => ({
      url: `${origin}/past-projects/${p.slug}`,
      lastModified: now,
      priority: 0.7,
    })),
    ...posts.map((b) => ({
      url: `${origin}/blog/${b.slug}`,
      lastModified: b.publishedAt ?? now,
      priority: 0.5,
    })),
  ];
}
