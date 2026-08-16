import { prisma } from '@/lib/prisma';

export async function getPageContent(page: string): Promise<Record<string, any>> {
  const blocks = await prisma.pageContent.findMany({ where: { page } });
  const result: Record<string, any> = {};
  for (const block of blocks) {
    result[block.section] = JSON.parse(block.data);
  }

  // Resolve any mediaId fields into actual URLs (and a poster URL for video)
  const mediaIds = new Set<string>();
  for (const section of Object.values(result)) {
    if (section?.mediaId) mediaIds.add(section.mediaId);
  }

  if (mediaIds.size > 0) {
    const mediaItems = await prisma.media.findMany({
      where: { id: { in: Array.from(mediaIds) } },
      include: { variants: true },
    });
    const byId = new Map(mediaItems.map((m) => [m.id, m]));

    for (const section of Object.values(result)) {
      if (section?.mediaId && byId.has(section.mediaId)) {
        const media = byId.get(section.mediaId)!;
        section.mediaUrl = mediaUrl(media, section.mediaType === 'video' ? 'compressed' : 'full');
        if (section.mediaType === 'video') {
          section.posterUrl = mediaUrl(media, 'poster');
        }
      }
    }
  }

  return result;
}

export async function getFeaturedProjects() {
  return prisma.project.findMany({
    where: { featured: true, published: true },
    include: {
      category: true,
      coverMedia: { include: { variants: true } },
    },
    orderBy: { order: 'asc' },
  });
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findUnique({
    where: { slug, published: true },
    include: {
      category: true,
      mainCategory: true,
      coverMedia: { include: { variants: true } },
      gallery: { include: { media: { include: { variants: true } } }, orderBy: { order: 'asc' } },
      testimonials: { include: { media: { include: { variants: true } } } },
    },
  });
}

async function getProjectsByCategory(mainSlug: string, sub?: string) {
  const cat = await prisma.mainCategory.findUnique({ where: { slug: mainSlug } });
  if (!cat) return [];
  return prisma.project.findMany({
    where: { mainCategoryId: cat.id, published: true, ...(sub ? { subCategory: sub } : {}) },
    include: {
      coverMedia: { include: { variants: true } },
      gallery: { include: { media: { include: { variants: true } } }, orderBy: { order: 'asc' } },
      testimonials: { include: { media: { include: { variants: true } } } },
    },
    orderBy: { order: 'asc' },
  });
}
export const getArchProjects = (sub?: string) => getProjectsByCategory('architecture', sub);
export const getIntProjects = (sub?: string) => getProjectsByCategory('interiors', sub);

export async function getProjectSlugById(id: string) {
  const project = await prisma.project.findUnique({ where: { id }, select: { slug: true } });
  return project?.slug || null;
}

export async function getAllPublishedProjects() {
  return prisma.project.findMany({
    where: { published: true },
    include: {
      category: true,
      coverMedia: { include: { variants: true } },
      gallery: { include: { media: { include: { variants: true } } }, orderBy: { order: 'asc' } },
    },
    orderBy: { order: 'asc' },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { order: 'asc' } });
}

export async function getSiteSettings() {
  return prisma.siteSettings.findUnique({ where: { id: 'default' } });
}

export function mediaUrl(media: { variants: { label: string; path: string }[]; path: string } | null, label: string): string | null {
  if (!media) return null;
  return media.variants.find((v) => v.label === label)?.path || media.path;
}

export async function getTestimonials() {
  return prisma.testimonial.findMany({ orderBy: { order: 'asc' }, include: { media: { include: { variants: true } } } });
}

export async function getFeaturedTestimonial() {
  return prisma.testimonial.findFirst({ where: { featured: true }, include: { media: { include: { variants: true } } } });
}

export async function getAwards() {
  return prisma.award.findMany({ orderBy: [{ year: 'desc' }, { order: 'asc' }] });
}

export async function getTeamMembers() {
  return prisma.teamMember.findMany({ orderBy: { order: 'asc' }, include: { media: { include: { variants: true } } } });
}

export async function getBlogPosts() {
  return prisma.blogPost.findMany({ where: { published: true }, orderBy: { publishedAt: 'desc' }, include: { media: { include: { variants: true } } } });
}

export async function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug, published: true }, include: { media: { include: { variants: true } } } });
}

export async function getHeroSlides() {
  return prisma.heroSlide.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    include: { media: { include: { variants: true } } },
  });
}

export async function getUpcomingProjects() {
  return prisma.project.findMany({
    where: { status: 'UPCOMING', published: true },
    include: { category: true, coverMedia: { include: { variants: true } } },
    orderBy: { order: 'asc' },
  });
}