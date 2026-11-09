import React from "react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { InView } from "@/components/motion/InView";
import { getTestimonials, mediaUrl } from "@/lib/public-content";
import { getPage } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo";
import { FeaturedQuote } from "@/components/pages/testimonials/FeaturedQuote";
import { QuoteCard, type QuoteImage, type QuoteItem } from "@/components/pages/testimonials/QuoteCard";
import { Invite } from "@/components/pages/testimonials/Invite";

export const revalidate = 60;

export const metadata = pageMetadata({
  title: "Client Testimonials",
  description:
    "Clients of F.QUAD Studio on living with the homes, interiors and commercial spaces we designed in Hyderabad, in their own words.",
  path: "/testimonials",
});

type TestimonialRow = Awaited<ReturnType<typeof getTestimonials>>[number];

/** A row's photo, if it has one, with alt text that always says something real. */
function imageOf(t: TestimonialRow, label: string): QuoteImage | null {
  const src = mediaUrl(t.media, label);
  if (!src) return null;
  return {
    src,
    alt: t.media?.alt || [t.clientName, t.projectName].filter(Boolean).join(", "),
    width: t.media?.width,
    height: t.media?.height,
  };
}

export default async function TestimonialsPage() {
  const [content, home, rows] = await Promise.all([
    getPage("testimonials"),
    getPage("home"),
    // An unreachable database shows the CMS quote instead of an error page.
    getTestimonials().catch(() => [] as TestimonialRow[]),
  ]);

  const hero = content.hero;
  const homeQuote = home.testimonial;

  // The editor's featured row leads; failing that, the first in order does.
  const lead = rows.find((t) => t.featured) ?? rows[0];
  const rest = lead ? rows.filter((t) => t.id !== lead.id) : [];

  const cards: QuoteItem[] = rest.map((t) => ({
    id: t.id,
    quote: t.quote,
    clientName: t.clientName,
    projectName: t.projectName,
    image: imageOf(t, "grid"),
  }));

  return (
    <PageShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        crumbs={[{ label: "Home", href: "/" }, { label: "Testimonials" }]}
        art="living"
      />

      {/* With no rows yet, the home page's featured quote stands in: the page
          always opens with a real client's words, never an empty state. */}
      {lead ? (
        <FeaturedQuote
          eyebrow={homeQuote.eyebrow}
          quote={lead.quote}
          name={lead.clientName}
          detail={lead.projectName}
          image={imageOf(lead, "full")}
        />
      ) : (
        homeQuote.quote && (
          <FeaturedQuote
            eyebrow={homeQuote.eyebrow}
            quote={homeQuote.quote}
            name={homeQuote.attribution}
          />
        )
      )}

      {cards.length > 0 && (
        <section className="relative px-6 sm:px-14 pb-20 sm:pb-28">
          {/* Its own header + InView (not <Section>): a long list is taller than
              the 15% threshold allows, which would strand the header unrevealed. */}
          <InView className="relative mb-10 flex items-baseline justify-between pt-6 sm:mb-14">
            <span
              aria-hidden="true"
              className="fq-rule absolute left-0 right-0 top-0 h-px bg-white/25"
            />
            <h2 className="fq-fade m-0 text-[11px] font-medium uppercase tracking-[0.24em] text-white/60">
              More client words
            </h2>
            <span
              className="fq-fade text-[11px] uppercase tracking-[0.18em] text-white/55 tabular-nums"
              style={{ ["--i" as string]: 1 }}
            >
              {String(cards.length).padStart(2, "0")} {cards.length === 1 ? "quote" : "quotes"}
            </span>
          </InView>

          <ul role="list" className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((item, i) => (
              <QuoteCard key={item.id} item={item} index={i} />
            ))}
          </ul>
        </section>
      )}

      <Invite />
    </PageShell>
  );
}
