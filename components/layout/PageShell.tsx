import React from "react";
import { Navbar } from "@/components/ui/mini-navbar";
import { Footer } from "./Footer";
import { getPage } from "@/lib/cms/content";
import { getSiteSettings } from "@/lib/public-content";

/**
 * The frame every inner page sits in: the floating navbar, a real <main>
 * landmark (the skip link in the root layout jumps to it), and the shared
 * footer. Pages supply only their content.
 *
 * It reads the global CMS block and site settings itself (both are cached
 * per request), so pages no longer each re-implement the nav + footer wiring.
 */
export async function PageShell({
  children,
  mainClassName = "",
}: {
  children: React.ReactNode;
  mainClassName?: string;
}) {
  const [global, settings] = await Promise.all([
    getPage("global"),
    getSiteSettings().catch(() => null),
  ]);

  return (
    <div className="relative bg-transparent text-white min-h-screen selection:bg-white selection:text-black">
      <Navbar content={global.nav} />
      <main id="main" tabIndex={-1} className={`outline-none ${mainClassName}`}>
        {children}
      </main>
      <Footer
        footer={global.footer}
        settings={{
          email: settings?.email,
          phone: settings?.phone,
          whatsapp: settings?.whatsapp,
          address: settings?.address,
          instagramUrl: settings?.instagramUrl,
        }}
      />
    </div>
  );
}
