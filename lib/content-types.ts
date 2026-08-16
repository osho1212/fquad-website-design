// Shapes for PageContent.data — stored as JSON strings in SQLite.
// Each (page, section) pair maps to one of these interfaces.

export interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  mediaId: string | null;
  mediaType: 'image' | 'video';
}

export interface StatsContent {
  items: { number: string; label: string }[];
}

export interface PortfolioIntroContent {
  eyebrow: string;
  title: string;
  lead: string;
}

export interface ServicesContent {
  eyebrow: string;
  title: string;
  lead: string;
  items: { icon: string; name: string; description: string }[];
}

export interface ProcessContent {
  eyebrow: string;
  title: string;
  steps: { number: string; name: string; description: string }[];
}

export interface TestimonialContent {
  quote: string;
  attribution: string;
  mediaId: string | null;
}

export interface CtaContent {
  heading: string;
  text: string;
}

export interface BannerContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  mediaId: string | null;
  mediaType: 'image' | 'video';
}

// Maps "page:section" -> data shape, used for typed access in admin forms
export type PageContentMap = {
  'home:hero': HeroContent;
  'home:stats': StatsContent;
  'home:portfolio_intro': PortfolioIntroContent;
  'home:services': ServicesContent;
  'home:process': ProcessContent;
  'home:testimonial': TestimonialContent;
  'home:cta': CtaContent;
  'projects:banner': BannerContent;
  'projects:cta': CtaContent;
};

export function parseContent<K extends keyof PageContentMap>(
  json: string
): PageContentMap[K] {
  return JSON.parse(json) as PageContentMap[K];
}

export function serializeContent<K extends keyof PageContentMap>(
  data: PageContentMap[K]
): string {
  return JSON.stringify(data);
}
