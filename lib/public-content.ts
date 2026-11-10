// Database-backed reads for the public site.
//
// Page copy and imagery come from the CMS (lib/cms/content.ts). What lives
// here is the record-shaped content the studio maintains as rows: team,
// awards, testimonials, journal posts, and the studio's own contact details.

import { cache } from 'react';
import { awards, blogPosts, siteSettings, teamMembers, testimonials } from '@/lib/db';

// Wrapped in cache() so the layout, generateMetadata and the page itself share
// one query per request instead of each hitting the database.
export const getSiteSettings = cache(async () => siteSettings.get());

export function mediaUrl(
  media: { variants: { label: string; path: string }[]; path: string } | null,
  label: string
): string | null {
  if (!media) return null;
  return media.variants.find((v) => v.label === label)?.path || media.path;
}

export async function getTestimonials() {
  return testimonials.list();
}

export async function getFeaturedTestimonial() {
  return testimonials.featured();
}

export async function getAwards() {
  return awards.list();
}

export async function getTeamMembers() {
  return teamMembers.list();
}

export async function getBlogPosts() {
  return blogPosts.published();
}

export async function getBlogPostBySlug(slug: string) {
  return blogPosts.bySlug(slug);
}
