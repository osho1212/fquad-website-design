import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { BackgroundVideo } from "@/components/ui/background-video";
import { themeInitScript } from "@/components/ui/ThemeToggle";
import { getSiteSettings, mediaUrl } from "@/lib/public-content";
import { StartProjectProvider } from "@/components/ui/StartProjectModalContext";
import { StartProjectModal } from "@/components/ui/StartProjectModal";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { Cursor } from "@/components/motion/Cursor";
import { SITE, siteUrl } from "@/lib/site";
import { jsonLd } from "@/lib/seo";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const DEFAULT_TITLE = `${SITE.shortName} — ${SITE.tagline}`;

// A per-page `metadata` export (see lib/seo.ts pageMetadata) overrides title,
// description and share cards; this is the site-wide fallback, sourced from
// Settings so editors don't need a code change to update it.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null);
  const ogImageUrl = settings?.ogImage ? mediaUrl(settings.ogImage, "full") : null;
  const title = settings?.metaTitle || DEFAULT_TITLE;
  const description = settings?.metaDescription || SITE.description;

  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    applicationName: SITE.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

/**
 * Runs before first paint, alongside the theme script:
 *  - `js` unlocks the hidden-until-revealed states in globals.css, so a
 *    visitor without JS never gets text stuck invisible.
 *  - `data-intro="loading"` is set only for the first home-page visit of a
 *    session (and never under reduced motion). It is what shows the
 *    preloader and holds the hero copy back; returning visitors skip it.
 */
const motionInitScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(location.pathname==='/'&&!sessionStorage.getItem('fq-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.setAttribute('data-intro','loading');}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings().catch(() => null);
  const origin = siteUrl();

  // Structured data: tells search engines this is a local design practice,
  // where it is, and how to reach it.
  const organization = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE.name,
    alternateName: SITE.shortName,
    description: SITE.description,
    url: origin,
    logo: `${origin}/icon.svg`,
    foundingDate: "2005",
    slogan: SITE.tagline,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings?.mapLat ?? SITE.geo.lat,
      longitude: settings?.mapLng ?? SITE.geo.lng,
    },
    areaServed: SITE.city,
    knowsAbout: ["Architecture", "Interior design", "Interior styling", "Farmhouse design"],
    ...(settings?.email ? { email: settings.email } : {}),
    ...(settings?.phone ? { telephone: settings.phone } : {}),
    ...(settings?.instagramUrl ? { sameAs: [settings.instagramUrl] } : {}),
  };

  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <head>
        {/* Sets data-theme before first paint to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: motionInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organization) }}
        />
      </head>
      <body className="bg-black text-white antialiased min-h-screen selection:bg-white selection:text-black relative font-sans">
        {/* First tab stop: lets keyboard and screen-reader users skip the nav. */}
        <a href="#main" className="fq-skip">
          Skip to content
        </a>

        <StartProjectProvider>
          {/* Global Ambient Background Video */}
          <BackgroundVideo />

          {/* Smooth scroll, reading-progress hairline and the cursor ring */}
          <SmoothScroll />
          <ScrollProgress />
          <Cursor />

          {/* Page Content */}
          <div className="relative z-10 fq-page">{children}</div>

          {/* Global Start A Project Modal */}
          <StartProjectModal />
        </StartProjectProvider>
      </body>
    </html>
  );
}
