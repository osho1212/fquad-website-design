// lib/past-projects.ts
// The /past-projects showcase now lives in the CMS (Website Content → Past
// Projects → Project Catalogue), so this module is a thin typed reader over
// that content. Consumed by the listing page, each detail page, and the
// homepage accordion.
//
// Server-only: getPastProjects() reads through lib/cms/content.

import { getPage } from '@/lib/cms/content';
import { defaultsFor } from '@/lib/cms/schema';

export interface ProjectChapter {
  num: string;
  title: string;
  body: string[];
}

export type ProjectCategory = string;

export interface PastProject {
  slug: string;
  name: string;
  category: ProjectCategory;
  /** Secondary name the project is also known by. Rendered under the title when set. */
  altName?: string;
  /** Shown as the small uppercase meta line. Empty until confirmed. */
  location: string;
  type: string;
  area: string;
  /** One-line summary used on the listing page and the detail hero. */
  tagline: string;
  images: string[];
  chapters: ProjectChapter[];
}

function normalise(item: Partial<PastProject>): PastProject {
  return {
    slug: item.slug ?? '',
    name: item.name ?? '',
    category: item.category ?? '',
    altName: item.altName || undefined,
    location: item.location ?? '',
    type: item.type ?? '',
    area: item.area ?? '',
    tagline: item.tagline ?? '',
    images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
    chapters: Array.isArray(item.chapters)
      ? item.chapters.map((chapter) => ({
          num: chapter?.num ?? '',
          title: chapter?.title ?? '',
          body: Array.isArray(chapter?.body) ? chapter.body : [],
        }))
      : [],
  };
}

/** Every showcase project, in the order set in the CMS. */
export async function getPastProjects(): Promise<PastProject[]> {
  const content = await getPage('past_projects');
  const items: Partial<PastProject>[] = content.catalog?.items ?? [];
  return items.map(normalise).filter((project) => project.slug);
}

export async function getPastProject(slug: string): Promise<PastProject | undefined> {
  const projects = await getPastProjects();
  return projects.find((project) => project.slug === slug);
}

/**
 * The shipped catalogue, without a database round-trip. Used for
 * generateStaticParams, which runs at build time when the database may not be
 * reachable; a slug added in the CMS is still rendered on demand.
 */
export function defaultPastProjects(): PastProject[] {
  const items: Partial<PastProject>[] = defaultsFor('past_projects', 'catalog').items ?? [];
  return items.map(normalise).filter((project) => project.slug);
}
