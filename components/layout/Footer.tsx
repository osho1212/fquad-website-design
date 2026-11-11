import React from "react";
import Link from "next/link";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { BackToTop } from "@/components/motion/BackToTop";
import { withDefaults, fill } from "@/lib/cms/schema";
import { SITE } from "@/lib/site";
import { SOCIAL_FALLBACKS } from "@/lib/social";

interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSettings {
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  instagramUrl?: string | null;
}

/**
 * The one footer. Home, services, projects, about, contact… all used to end
 * differently — a full footer on home, a dark legacy footer on six pages, and
 * just a copyright strip on the rest. Every page now closes the same way.
 *
 * Server-compatible (no hooks), so it can sit in either a server page or the
 * home page's client CTA block.
 */
export function Footer({
  footer,
  settings,
}: {
  footer?: Record<string, any>;
  settings?: FooterSettings | null;
}) {
  const f = withDefaults("global", "footer", footer);
  const email = settings?.email || SITE.fallback.email;
  const phone = settings?.phone || "";
  const whatsapp = settings?.whatsapp || SOCIAL_FALLBACKS.whatsapp;
  // A link with no real destination ("#") is a dead end, so it isn't rendered
  // at all — it reappears the moment an editor gives it an address.
  const live = (links: FooterLink[] | undefined) =>
    (links ?? []).filter((l) => l.href && l.href !== "#");
  const columns: { title: string; links: FooterLink[] }[] = (f.columns ?? []).map(
    (c: { title: string; links: FooterLink[] }) => ({ ...c, links: live(c.links) })
  );
  const legalLinks = live(f.legalLinks);

  const linkClass =
    "fq-link self-start inline-block py-1.5 text-sm text-white/75 hover:text-white transition-colors";

  return (
    <footer className="relative px-6 sm:px-11 pt-12 sm:pt-14 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] gap-10 items-start text-white">
        {/* Logo lockup */}
        <div className="flex flex-col items-start gap-5">
          <Link href="/" className="inline-block group" aria-label={`${SITE.name} — home`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.logo}
              alt={f.logoAlt}
              width={190}
              height={64}
              loading="lazy"
              decoding="async"
              className="fq-logo-mono w-36 sm:w-44 lg:w-[190px] h-auto object-contain block group-hover:opacity-90 transition-opacity"
            />
          </Link>
          <p className="m-0 max-w-[30ch] text-sm leading-relaxed text-white/60">{SITE.tagline}</p>
        </div>

        {columns.map((column, i) => (
          <nav key={i} aria-label={column.title}>
            <div className="text-[11px] tracking-[0.22em] text-white/50 mb-3 uppercase font-medium">
              {column.title}
            </div>
            <div className="flex flex-col">
              {(column.links ?? []).map((link, j) => (
                <Link key={j} href={link.href || "/"} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        ))}

        <div>
          <div className="text-[11px] tracking-[0.22em] text-white/50 mb-3 uppercase font-medium">
            {f.contactHeading}
          </div>
          <div className="flex flex-col">
            <a href={`mailto:${email}`} className={`${linkClass} text-accent`}>
              {email}
            </a>
            {phone && (
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className={linkClass}>
                {phone}
              </a>
            )}
            <address className="not-italic py-1.5 text-sm leading-relaxed text-white/60">
              {settings?.address || f.contactLocation}
            </address>
            <SocialLinks
              instagramUrl={settings?.instagramUrl ?? undefined}
              whatsapp={whatsapp}
              className="mt-3 flex-wrap"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-10 pt-5 border-t border-white/10 text-[11px] tracking-[0.14em] text-white/50 uppercase">
        <span>{fill(f.copyright, { year: new Date().getFullYear() })}</span>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          {legalLinks.map((link: FooterLink, i: number) => (
            <Link
              key={i}
              href={link.href || "/"}
              className="fq-link inline-block py-1.5 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <BackToTop className="hover:text-white transition-colors" />
        </div>
      </div>
    </footer>
  );
}
