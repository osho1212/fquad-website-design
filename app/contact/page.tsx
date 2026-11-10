import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { StartProjectForm } from "@/components/ui/StartProjectForm";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { getSiteSettings } from "@/lib/public-content";
import { getPage } from "@/lib/cms/content";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Start a conversation with F.QUAD Studio — architecture and interior design in Hyderabad. Tell us about your project, or reach us by email, phone or WhatsApp.",
  path: "/contact",
});

const FALLBACK = SITE.fallback;

export default async function ContactPage() {
  const [settings, content, global] = await Promise.all([
    getSiteSettings().catch(() => null),
    getPage("contact"),
    getPage("global"),
  ]);

  const hero = content.hero;
  const info = content.details;
  const form = content.form;
  const map = content.map;

  const email = settings?.email || FALLBACK.email;
  const phone = settings?.phone || "";
  const whatsapp = settings?.whatsapp || FALLBACK.whatsapp;
  const address = settings?.address || FALLBACK.address;
  const instagram = settings?.instagramUrl || FALLBACK.instagramUrl;
  const waDigits = whatsapp.replace(/[^0-9]/g, "");

  // Prefer exact coordinates when set in admin, otherwise geocode the address.
  // `output=embed` needs no API key.
  const mapQuery =
    settings?.mapLat && settings?.mapLng
      ? `${settings.mapLat},${settings.mapLng}`
      : address;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&z=14&output=embed`;

  const details: { label: string; value: string; href?: string }[] = [
    { label: info.studioLabel, value: address },
    { label: info.emailLabel, value: email, href: `mailto:${email}` },
    ...(phone ? [{ label: info.phoneLabel, value: phone, href: `tel:${phone}` }] : []),
    {
      label: info.whatsappLabel,
      value: whatsapp,
      href: `https://wa.me/${waDigits}`,
    },
    { label: info.instagramLabel, value: info.instagramHandle, href: instagram },
  ];

  return (
    <PageShell>

      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        intro={hero.intro}
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        art="dining"
      />

      {/* ── Details (left) + Form (right) ───────────────────────── */}
      <section className="px-6 sm:px-14 py-16 grid grid-cols-1 lg:grid-cols-[0.8fr_1fr] gap-14 lg:gap-20 items-start">
        {/* Left — studio details. Sticky so it stays alongside the tall form. */}
        <div className="fq-panel p-7 sm:p-10 lg:sticky lg:top-28">
          <h2 className="m-0 font-normal uppercase text-[11px] tracking-[0.22em] text-white/55 mb-10">
            {info.heading}
          </h2>

          <dl className="m-0">
            {details.map((d) => (
              <div
                key={d.label}
                className="py-5 border-b border-white/15 first:pt-0"
              >
                <dt className="text-[11px] tracking-[0.2em] uppercase text-white/60">
                  {d.label}
                </dt>
                <dd className="m-0 mt-2 text-sm sm:text-base text-white/80">
                  {d.href ? (
                    <a
                      href={d.href}
                      target={d.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        d.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="inline-block py-1.5 hover:text-white transition-colors"
                    >
                      {d.value}
                    </a>
                  ) : (
                    d.value
                  )}
                </dd>
              </div>
            ))}

            <div className="py-5 border-b border-white/15">
              <dt className="text-[11px] tracking-[0.2em] uppercase text-white/60">
                {info.hoursLabel}
              </dt>
              <dd className="m-0 mt-2 text-sm sm:text-base text-white/80">
                {info.hours}
              </dd>
            </div>
          </dl>

          <div className="mt-8">
            <div className="text-[11px] tracking-[0.2em] uppercase text-white/60 mb-3.5">
              {info.followLabel}
            </div>
            <SocialLinks
              instagramUrl={instagram}
              whatsapp={whatsapp}
              className="flex-wrap"
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-10">
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] tracking-[0.18em] px-6 py-3.5 border border-white/35 hover:border-white text-white transition-colors uppercase font-medium inline-flex items-center"
            >
              {info.whatsappButton}
            </a>
            <Link
              href={info.workHref}
              className="text-[11px] tracking-[0.18em] px-6 py-3.5 border border-white/35 hover:border-white text-white transition-colors uppercase font-medium inline-flex items-center"
            >
              {info.workButton}
            </Link>
          </div>
        </div>

        {/* Right — project intake, shared with the Start A Project modal */}
        <div className="fq-panel p-6 sm:p-10">
          <h2 className="m-0 font-normal uppercase text-[11px] tracking-[0.22em] text-white/55 mb-10">
            {form.heading}
          </h2>
          <StartProjectForm />
        </div>
      </section>

      {/* ── Map ─────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-14 pb-20 pt-4">
        <div className="fq-panel p-6 sm:p-10">
          <h2 className="m-0 font-normal uppercase text-[11px] tracking-[0.22em] text-white/55 mb-8">
            {map.heading}
          </h2>
          <div className="w-full h-[380px] sm:h-[460px] border border-white/15 overflow-hidden bg-zinc-900">
            <iframe
              src={mapSrc}
              title={`Map showing F.QUAD Studio — ${address}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="w-full h-full block border-0 grayscale contrast-[1.05] brightness-[0.88]"
            />
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              mapQuery
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mt-4 min-h-[32px] text-[11px] tracking-[0.18em] uppercase text-accent hover:text-white transition-colors"
          >
            {map.linkLabel}
          </a>
        </div>
      </section>
    </PageShell>
  );
}
