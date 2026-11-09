// Database-backed reads for the public site.
//
// Page copy and imagery come from the CMS (lib/cms/content.ts). What lives
// here is the record-shaped content the studio maintains as rows: team,
// awards, testimonials, journal posts, and the studio's own contact details.

import { cache } from 'react';
import { prisma } from '@/lib/prisma';

// Wrapped in cache() so the layout, generateMetadata and the page itself share
// one query per request instead of each hitting the database.
export const getSiteSettings = cache(async () => {
  return prisma.siteSettings.findUnique({
    where: { id: 'default' },
    include: { ogImage: { include: { variants: true } } },
  });
});

export function mediaUrl(
  media: { variants: { label: string; path: string }[]; path: string } | null,
  label: string
): string | null {
  if (!media) return null;
  return media.variants.find((v) => v.label === label)?.path || media.path;
}

export async function getTestimonials() {
  return prisma.testimonial.findMany({
    orderBy: { order: 'asc' },
    include: { media: { include: { variants: true } } },
  });
}

export async function getFeaturedTestimonial() {
  return prisma.testimonial.findFirst({
    where: { featured: true },
    include: { media: { include: { variants: true } } },
  });
}

export async function getAwards() {
  return prisma.award.findMany({ orderBy: [{ year: 'desc' }, { order: 'asc' }] });
}

export async function getTeamMembers() {
  return prisma.teamMember.findMany({
    orderBy: { order: 'asc' },
    include: { media: { include: { variants: true } } },
  });
}

export async function getBlogPosts() {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    include: { media: { include: { variants: true } } },
  });
}

export async function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug, published: true },
    include: { media: { include: { variants: true } } },
  });
}
