import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { InView } from "@/components/motion/InView";
import { ClosingBand } from "@/components/pages/blog/ClosingBand";
import { JournalEmpty } from "@/components/pages/blog/JournalEmpty";
import { PostCard } from "@/components/pages/blog/PostCard";
import { absoluteUrl, countLabel, orEmpty, postDate } from "@/components/pages/blog/helpers";
import { PrimaryAction, TextAction } from "@/components/pages/blog/ui";
import { getPage } from "@/lib/cms/content";
import { getBlogPosts } from "@/lib/public-content";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { SITE, siteUrl } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Journal",
  description:
    "Notes from F.QUAD Studio on interior design and architecture: materials, light, small-space planning and the craft of making rooms work.",
  path: "/blog",
});

export default async function BlogPage() {
  const [posts, content] = await Promise.all([
    // An unreachable database falls through to the "being written" state.
    orEmpty(getBlogPosts()),
    getPage("blog"),
  ]);

  const hero = content.hero;
  const [latest, ...earlier] = posts;
  const origin = siteUrl();

  const intro =
    (typeof hero.intro === "string" && hero.intro) ||
    (latest
      ? "Notes from the studio on materials, light, planning and the craft of making rooms work."
      : "The journal is being written: notes from the studio on materials, light, planning and the craft of making rooms work.");

  return (
    <PageShell>
      {latest && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "Blog",
              name: `${SITE.name} Journal`,
              url: `${origin}/blog`,
              publisher: { "@type": "Organization", name: SITE.name, url: origin },
              blogPost: posts.slice(0, 20).map((p) => ({
                "@type": "BlogPosting",
                headline: p.title.slice(0, 110),
                url: absoluteUrl(`/blog/${p.slug}`, origin),
                datePublished: postDate(p).toISOString(),
              })),
            }),
          }}
        />
      )}

      <PageHero eyebrow={hero.eyebrow} title={hero.title} intro={intro} art="studio">
        {!latest && (
          <>
            <PrimaryAction action={{ label: "Start a project", startProject: true }} />
            <TextAction action={{ label: "Browse past projects →", href: "/past-projects" }} />
          </>
        )}
      </PageHero>

      {latest ? (
        <>
          <Section
            eyebrow="Latest entry"
            aside={<span className="text-white/60">{countLabel(posts.length, "entry", "entries")}</span>}
          >
            <div className="max-w-[1500px]">
              <PostCard post={latest} variant="feature" />
            </div>
          </Section>

          {earlier.length > 0 && (
            <>
              {/* Header only: each card below reveals on its own, so a long
                  archive never depends on one tall observer. */}
              <Section eyebrow="Earlier entries" className="!pt-0 !pb-0">
                {null}
              </Section>
              <div className="px-6 sm:px-14 pb-20 sm:pb-28">
                <ul
                  role="list"
                  className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-10 gap-y-14 max-w-[1500px]"
                >
                  {earlier.map((post, i) => (
                    <InView as="li" key={post.id} className="min-w-0">
                      <PostCard post={post} index={i % 3} />
                    </InView>
                  ))}
                </ul>
              </div>
            </>
          )}

          <ClosingBand
            eyebrow="Work with us"
            title={"Planning a space\nof your own?"}
            body="Tell us about your site, your brief and how you want it to feel."
            primary={{ label: "Start a project", startProject: true }}
            secondary={{ label: "See past projects →", href: "/past-projects" }}
          />
        </>
      ) : (
        <>
          <JournalEmpty />
          <ClosingBand
            eyebrow="Suggest a topic"
            title={"Tell us what to\nwrite about next."}
            body="Planning a space and curious about something specific? Tell us. It may well become an entry."
            primary={{ label: "Write to the studio", href: "/contact" }}
            secondary={{ label: "Start a project →", startProject: true }}
          />
        </>
      )}
    </PageShell>
  );
}
