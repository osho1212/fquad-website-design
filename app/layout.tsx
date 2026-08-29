import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { BackgroundVideo } from "@/components/ui/background-video";
import { themeInitScript } from "@/components/ui/ThemeToggle";
import { getSiteSettings, mediaUrl } from "@/lib/public-content";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const DEFAULT_TITLE = "F.QUAD — Architecture & Interior Design Studio";
const DEFAULT_DESCRIPTION =
  "F.QUAD Studio — architecture and interior design practice based in Hyderabad. Functional, Futuristic, Friendly, Flexible.";

// A per-page `metadata` export (contact, services, etc.) overrides title and
// description; this is only the site-wide fallback, sourced from Settings so
// editors don't need a code change to update it.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null);
  const ogImageUrl = settings?.ogImage ? mediaUrl(settings.ogImage, "full") : null;

  return {
    title: settings?.metaTitle || DEFAULT_TITLE,
    description: settings?.metaDescription || DEFAULT_DESCRIPTION,
    ...(ogImageUrl ? { openGraph: { images: [ogImageUrl] } } : {}),
  };
}

import { StartProjectProvider } from "@/components/ui/StartProjectModalContext";
import { StartProjectModal } from "@/components/ui/StartProjectModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <head>
        {/* Sets data-theme before first paint to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-black text-white antialiased min-h-screen selection:bg-white selection:text-black relative font-sans">
        <StartProjectProvider>
          {/* Global Ambient Background Video */}
          <BackgroundVideo />

          {/* Page Content */}
          <div className="relative z-10">
            {children}
          </div>

          {/* Global Start A Project Modal */}
          <StartProjectModal />
        </StartProjectProvider>
      </body>
    </html>
  );
}
