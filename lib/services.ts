// lib/services.ts
// The studio's services now live in the CMS (Website Content → Services →
// Service Catalogue), so this module is a thin typed reader over that content
// rather than a hardcoded list. Consumed by the homepage grid, the /services
// index, and each /services/[slug] detail page.
//
// Server-only: getServices() reads through lib/cms/content.

import { getPage } from '@/lib/cms/content';
import { defaultsFor } from '@/lib/cms/schema';

export interface Service {
  slug: string;
  num: string;
  /** Card + index title. */
  title: string;
  /** One-line summary used on cards. */
  desc: string;
  /** Opening paragraph on the detail page. */
  intro: string;
  /** Supporting paragraphs on the detail page. */
  body: string[];
  /** What the engagement covers. */
  offerings: string[];
  image: string;
  alt: string;
}

function normalise(item: Partial<Service>): Service {
  return {
    slug: item.slug ?? '',
    num: item.num ?? '',
    title: item.title ?? '',
    desc: item.desc ?? '',
    intro: item.intro ?? '',
    body: Array.isArray(item.body) ? item.body : [],
    offerings: Array.isArray(item.offerings) ? item.offerings : [],
    image: item.image ?? '',
    alt: item.alt ?? '',
  };
}

/** Every service, in the order set in the CMS. Entries without a slug are dropped. */
export async function getServices(): Promise<Service[]> {
  const content = await getPage('services');
  const items: Partial<Service>[] = content.catalog?.items ?? [];
  return items.map(normalise).filter((service) => service.slug);
}

export async function getService(slug: string): Promise<Service | undefined> {
  const services = await getServices();
  return services.find((service) => service.slug === slug);
}

/**
 * The shipped catalogue, without a database round-trip. Used for
 * generateStaticParams, which runs at build time when the database may not be
 * reachable; a slug added in the CMS is still rendered on demand.
 */
export function defaultServices(): Service[] {
  const items: Partial<Service>[] = defaultsFor('services', 'catalog').items ?? [];
  return items.map(normalise).filter((service) => service.slug);
}
