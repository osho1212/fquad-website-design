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
  description:
    "F.QUAD Studio — an award-winning architecture and interior design practice in Hyderabad. Functional, Futuristic, Friendly, Flexible.",
  locale: "en_IN",
  city: "Hyderabad",
  region: "Telangana",
  country: "IN",
  geo: { lat: 17.385, lng: 78.4867 },
  fallback: {
    email: "contact@fquadstudio.com",
    whatsapp: "+919876543210",
    address: "Hyderabad, Telangana, India",
    instagramUrl: "https://instagram.com/fquadstudio",
  },
} as const;

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
