"use client";

import React from "react";
import Link from "next/link";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { useStartProjectModal } from "@/components/ui/StartProjectModalContext";
import { withDefaults, fill, toLines } from "@/lib/cms/schema";
import { SOCIAL_FALLBACKS } from "@/lib/social";

interface FooterLink {
  label: string;
  href: string;
}

export interface ContactFooterSettings {
  email: string | null;
  whatsapp: string | null;
  instagramUrl: string | null;
}

const FALLBACK_EMAIL = "admin@fquad.com";

export function ContactFooter({
  content,
  footer,
  settings,
}: {
  content?: Record<string, any>;
  footer?: Record<string, any>;
  settings?: ContactFooterSettings;
}) {
  const { openModal } = useStartProjectModal();
  const cta = withDefaults("home", "cta", content);
  const f = withDefaults("global", "footer", footer);

  const email = settings?.email || FALLBACK_EMAIL;
  const whatsapp = settings?.whatsapp || SOCIAL_FALLBACKS.whatsapp;
  const waDigits = whatsapp.replace(/[^0-9]/g, "");
  const columns: { title: string; links: FooterLink[] }[] = f.columns ?? [];

  return (
    <section
      id="contact"
      className="relative pt-20 sm:pt-28 px-6 sm:px-11 pb-10 border-t border-white/15 bg-transparent"
    >
      {/* Full-bleed: the section's own px-* padding sets the edge inset, matching
          the other homepage sections. No max-width cap. */}
      <div className="w-full">
        {/* Top CTA Area */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-11 items-end pb-16 sm:pb-20 border-b border-white/15">
          <div>
            <h2 className="m-0 font-semibold uppercase text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white">
              {toLines(cta.heading).map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/60 max-w-[34ch]">
              {cta.subheading}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] tracking-[0.18em] px-6 py-3.5 border border-white/35 hover:border-white text-white rounded-none transition-colors uppercase font-medium inline-flex items-center justify-center"
            >
              {cta.whatsappLabel}
            </a>
            <button
              type="button"
              onClick={() => openModal()}
              className="btn-metallic text-xs uppercase font-medium cursor-pointer"
            >
              {cta.ctaLabel}
            </button>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <footer className="pt-8 sm:pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr] gap-8 sm:gap-10 text-white items-start">
          {/* Complete Official White Logo Lockup */}
          <div className="flex flex-col items-start">
            <Link href="/" className="inline-block group" aria-label="F.QUAD Home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.logo}
                alt={f.logoAlt}
                className="w-36 sm:w-44 lg:w-[190px] h-auto object-contain block group-hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>

          {columns.map((column, i) => (
            <div key={i}>
              <div className="text-[10px] tracking-[0.22em] text-white/40 mb-3.5 uppercase font-medium">
                {column.title}
              </div>
              <div className="flex flex-col gap-2 text-xs sm:text-sm text-white/75">
                {(column.links ?? []).map((link, j) => (
                  <Link
                    key={j}
                    href={link.href || "#"}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div>
            <div className="text-[10px] tracking-[0.22em] text-white/40 mb-3.5 uppercase font-medium">
              {f.contactHeading}
            </div>
            <div className="flex flex-col gap-2 text-xs sm:text-sm text-white/75">
              <a href={`mailto:${email}`} className="text-accent hover:underline">
                {email}
              </a>
              <span className="text-white/50 leading-relaxed">
                {f.contactLocation}
              </span>

              {/* Social icon row — see components/ui/SocialLinks.tsx */}
              <SocialLinks
                instagramUrl={settings?.instagramUrl ?? undefined}
                whatsapp={whatsapp}
                className="mt-2 flex-wrap"
              />
            </div>
          </div>
        </footer>

        {/* Sub-footer Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-10 pt-5 border-t border-white/10 text-[9.5px] tracking-[0.16em] text-white/40 uppercase">
          <span>{fill(f.copyright, { year: new Date().getFullYear() })}</span>
          <div className="flex gap-6">
            {(f.legalLinks ?? []).map((link: FooterLink, i: number) => (
              <a key={i} href={link.href || "#"} className="hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
