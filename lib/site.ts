/**
 * Single source for the studio's identity and fallback contact details.
 * Several pages used to hard-code their own copies (and disagreed on the
 * address). Editors change the live values in Admin → Settings; these are only
 * what shows when the database has none.
 */
export const SITE = {
  name: "F.QUAD Studio",
  shortName: "F.QUAD",
  tagline: "Architecture & Interior Design Studio",
  /** The home page's <title> and share title: the studio, what it does, and where. */
  title: "F.QUAD Studio — Architecture & Interior Design in Hyderabad",
  /** The default meta description (kept under ~155 characters, which is what a search result shows). */
  description:
    "F.QUAD Studio: award-winning architecture and interior design in Hyderabad. Homes, villas, farmhouses, workplaces and hospitality spaces, since 2005.",
  /** Other ways people write the name, so a search engine can tie them to one studio. */
  alternateNames: ["F.QUAD", "FQuad Studio", "F Quad Studio", "fquadstudio.com"],
  keywords: [
    "architects in Hyderabad",
    "interior designers in Hyderabad",
    "architecture and interior design studio",
    "luxury interior design Hyderabad",
    "residential architecture",
    "villa and bungalow design",
    "farmhouse design",
    "turnkey interior design",
    "commercial and workplace interiors",
    "hospitality and retail design",
    "F.QUAD Studio",
  ],
  /** What the studio does, for structured data. */
  serviceTypes: ["Architecture", "Interior design", "Interior styling", "Farmhouse and estate design", "Turnkey design and build"],
  locale: "en_IN",
  city: "Hyderabad",
  region: "Telangana",
  country: "IN",
  geo: { lat: 17.385, lng: 78.4867 },
  fallback: {
    email: "contact@fquadstudio.com",
    whatsapp: "+91 76748 17987",
    address: "Hyderabad, Telangana, India",
    instagramUrl: "https://instagram.com/fquadstudio",
  },
} as const;

/**
 * The title and description scripts/seed.mjs used to save into Settings on a
 * fresh database. They were placeholders, not choices an editor made, so they
 * must not override the site's own title and description above. Anything else
 * typed into Admin → Settings still wins.
 */
export const SEEDED_META = {
  title: "F.QUAD — Architecture & Interior Design Studio",
  description:
    "Architecture and interior design studio based in Hyderabad, working across homes, workplaces, and hospitality spaces.",
} as const;

/** The editor's saved text, or null when there is none or it is the old seeded placeholder. */
export function customMeta(saved: string | null | undefined, seeded: string): string | null {
  const text = saved?.trim();
  return text && text !== seeded ? text : null;
}

/** Absolute origin of the deployed site, for canonical URLs and the sitemap. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  // Only the production address: a preview deployment's own URL must never
  // become the canonical one search engines are told about.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3002";
}
