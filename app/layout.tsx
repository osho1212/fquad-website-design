import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Backdrop } from "@/components/ui/Backdrop";
import { themeInitScript } from "@/components/ui/ThemeToggle";
import { getSiteSettings, mediaUrl } from "@/lib/public-content";
import { StartProjectProvider } from "@/components/ui/StartProjectModalContext";
import { StartProjectModal } from "@/components/ui/StartProjectModal";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { Cursor } from "@/components/motion/Cursor";
import { ImageLoader } from "@/components/motion/ImageLoader";
import { SEEDED_META, SITE, customMeta, siteUrl } from "@/lib/site";
import { jsonLd } from "@/lib/seo";
import { SOCIAL_FALLBACKS } from "@/lib/social";
import { LaunchGate } from "@/components/launch/LaunchGate";
import { launchGateScript } from "@/lib/launch";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

// A per-page `metadata` export (see lib/seo.ts pageMetadata) overrides title,
// description and share cards; this is the site-wide fallback. Text an editor
// typed into Admin → Settings wins; otherwise the studio's own wording in
// lib/site.ts is used (the placeholders the seed once saved do not count).
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null);
  const ogImageUrl = settings?.ogImage ? mediaUrl(settings.ogImage, "full") : null;
  const title = customMeta(settings?.metaTitle, SEEDED_META.title) ?? SITE.title;
  const description = customMeta(settings?.metaDescription, SEEDED_META.description) ?? SITE.description;

  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    keywords: [...SITE.keywords],
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url: siteUrl() }],
    creator: SITE.name,
    publisher: SITE.name,
    category: "architecture",
    alternates: { canonical: "/" },
    // Index everything public, and let a result carry a full-size image and a
    // full-length snippet rather than a cropped one.
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: {
      type: "website",
      url: "/",
      siteName: SITE.name,
      locale: SITE.locale,
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    // Proves ownership to Google Search Console: set GOOGLE_SITE_VERIFICATION
    // to the token it shows (the content of its meta tag).
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Draw under Android's gesture bar (and iOS's home indicator) so the hero
  // runs edge to edge instead of ending in a strip of page colour. Anything
  // pinned to an edge pads itself with env(safe-area-inset-*).
  viewportFit: "cover",
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
 *
 * It runs behind the launch gate too, drawing its spiral against the same
 * loading the gate is already doing. The gate holds it from finishing, so
 * when the quadrants part they uncover a spiral that is already full, which
 * then opens onto the page. See LaunchGate's handoff.
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
    "@id": `${origin}/#organization`,
    name: SITE.name,
    alternateName: [...SITE.alternateNames],
    description: SITE.description,
    url: origin,
    logo: `${origin}/icon-512.png`,
    image: `${origin}/opengraph-image`,
    foundingDate: "2005",
    slogan: SITE.tagline,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
      // Filled in once the studio enters a street address in Admin → Settings.
      ...(settings?.address && settings.address.trim() !== SITE.fallback.address
        ? { streetAddress: settings.address.trim() }
        : {}),
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings?.mapLat ?? SITE.geo.lat,
      longitude: settings?.mapLng ?? SITE.geo.lng,
    },
    areaServed: [
      { "@type": "City", name: SITE.city },
      { "@type": "State", name: SITE.region },
    ],
    serviceType: [...SITE.serviceTypes],
    knowsAbout: ["Architecture", "Interior design", "Interior styling", "Farmhouse design"],
    ...(settings?.email ? { email: settings.email } : {}),
    ...(settings?.phone ? { telephone: settings.phone } : {}),
    // LinkedIn is left out until its address is confirmed (lib/social.ts).
    sameAs: [
      settings?.instagramUrl || SOCIAL_FALLBACKS.instagram,
      SOCIAL_FALLBACKS.youtube,
      SOCIAL_FALLBACKS.facebook,
    ],
  };

  // Tells Google the site's name, so a result reads "F.QUAD Studio" rather
  // than the bare domain, and ties the site to the studio above.
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    url: origin,
    name: SITE.name,
    alternateName: [...SITE.alternateNames],
    inLanguage: "en-IN",
    publisher: { "@id": `${origin}/#organization` },
  };

  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <head>
        {/* Sets data-theme before first paint to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Locks the launch gate before first paint. Must run before the
            motion script, which steps aside when the gate is up. */}
        <script dangerouslySetInnerHTML={{ __html: launchGateScript }} />
        <script dangerouslySetInnerHTML={{ __html: motionInitScript }} />
        {/* Headings, the loader and the backdrop all set in Good Times: fetch
            it with the HTML instead of after the CSS, so it never swaps in late. */}
        <link
          rel="preload"
          href="/assets/good_times/Good%20Times%20Rg.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(website) }}
        />
      </head>
      <body className="bg-black text-white antialiased min-h-screen selection:bg-white selection:text-black relative font-sans">
        {/* First tab stop: lets keyboard and screen-reader users skip the nav. */}
        <a href="#main" className="fq-skip">
          Skip to content
        </a>

        <StartProjectProvider>
          {/* Site-wide drafting-sheet backdrop (static SVG, no JS) */}
          <Backdrop />

          {/* Smooth scroll, reading-progress hairline and the cursor ring */}
          <SmoothScroll />
          <ScrollProgress />
          <Cursor />
          {/* Skeleton → fade-in for photographs (see .fq-img in globals.css) */}
          <ImageLoader />

          {/* Page Content */}
          <div className="relative z-10 fq-page">{children}</div>

          {/* Global Start A Project Modal */}
          <StartProjectModal />

          {/* Holds the site back until 11:11, then opens it (lib/launch.ts) */}
          <LaunchGate />
        </StartProjectProvider>
      </body>
    </html>
  );
}
