/* The CMS upload pipeline already writes pre-sized variants (see
   responsiveImage); next/image would only re-process them. */
/* eslint-disable @next/next/no-img-element */
import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { InView } from "@/components/motion/InView";
import { ClosingBand } from "@/components/pages/blog/ClosingBand";
import { PostCard } from "@/components/pages/blog/PostCard";
import { Prose } from "@/components/pages/blog/Prose";
import {
  absoluteUrl,
  excerptOf,
  formatDate,
  orEmpty,
  postDate,
  readingMinutes,
  responsiveImage,
  shorten,
  wordCount,
} from "@/components/pages/blog/helpers";
import { TextAction } from "@/components/pages/blog/ui";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/public-content";
import { breadcrumbJsonLd, jsonLd, pageMetadata } from "@/lib/seo";
import { SITE, siteUrl } from "@/lib/site";

export const revalidate = 60;

// generateMetadata and the page both need the post; cache() shares one query.
const getPost = cache((slug: string) => getBlogPostBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) {
    return { title: `Journal — ${SITE.name}`, robots: { index: false, follow: false } };
  }

  const cover = responsiveImage(post.media, "full");
  const base = pageMetadata({
    title: post.title,
    description: excerptOf(post, 155),
    path: `/blog/${post.slug}`,
    image: cover?.src,
    type: "article",
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: postDate(post).toISOString(),
      authors: [SITE.name],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const origin = siteUrl();
  const date = postDate(post);
  const iso = date.toISOString();
  const minutes = readingMinutes(post.body);
  const cover = responsiveImage(post.media, "full");
  const excerpt = post.excerpt?.trim() || undefined;
  const url = absoluteUrl(`/blog/${post.slug}`, origin);

  // The two most recent other entries: somewhere to go after the last line.
  const more = (await orEmpty(getBlogPosts())).filter((p) => p.id !== post.id).slice(0, 2);

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title.slice(0, 110),
    description: excerptOf(post, 200),
    datePublished: iso,
    // The schema has no edit timestamp; publication is the best honest value.
    dateModified: iso,
    wordCount: wordCount(post.body),
    inLanguage: "en-IN",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: cover ? [absoluteUrl(cover.src, origin)] : undefined,
    author: { "@type": "Organization", name: SITE.name, url: origin },
    publisher: { "@type": "Organization", name: SITE.name, url: origin },
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(article) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd(
              [
                { name: "Home", path: "/" },
                { name: "Journal", path: "/blog" },
                { name: post.title, path: `/blog/${post.slug}` },
              ],
              origin
            )
          ),
        }}
      />

      <article>
        <PageHero
          eyebrow="Journal entry"
          title={post.title}
          intro={excerpt}
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Journal", href: "/blog" },
            // Long titles would wrap the breadcrumb across several lines.
            { label: shorten(post.title, 48) },
          ]}
          art="none"
        />

        <div className="px-6 sm:px-14 py-14 sm:py-20">
          {cover && (
            // The ticks sit outside the photo (14px padding = tick size).
            <InView className="mb-14 sm:mb-20 max-w-[1500px]">
              <figure className="fq-fade fq-frame m-0 p-3.5">
                <div className="relative overflow-hidden bg-zinc-900 aspect-[16/9]">
                  <img
                    src={cover.src}
                    srcSet={cover.srcSet}
                    sizes="(min-width: 1536px) 1440px, 100vw"
                    alt={cover.alt ?? `Cover image for “${post.title}”`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <span className="fq-frame-b" aria-hidden="true" />
              </figure>
            </InView>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,68ch)] gap-x-16 gap-y-10 max-w-[1500px]">
            {/* Only this small rail reveals on scroll. The body is not wrapped in
                an InView: a long post is far taller than one observer can see 15% of. */}
            <InView as="div" className="lg:sticky lg:top-28 self-start">
              <dl className="fq-fade m-0 grid grid-cols-2 lg:grid-cols-1 gap-x-8 gap-y-6 text-[11px] tracking-[0.18em] uppercase">
                <div>
                  <dt className="text-white/60">Published</dt>
                  <dd className="m-0 mt-2 tracking-[0.12em] text-white">
                    <time dateTime={iso}>{formatDate(date)}</time>
                  </dd>
                </div>
                <div>
                  <dt className="text-white/60">Reading time</dt>
                  <dd className="m-0 mt-2 tracking-[0.12em] text-white">{minutes} min read</dd>
                </div>
                <div>
                  <dt className="text-white/60">Written by</dt>
                  <dd className="m-0 mt-2 tracking-[0.12em] text-white">{SITE.name}</dd>
                </div>
              </dl>
              <div className="fq-fade mt-6" style={{ ["--i" as string]: 2 }}>
                <TextAction action={{ label: "← All entries", href: "/blog" }} />
              </div>
            </InView>

            <Prose body={post.body} />
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <Section
          eyebrow="More from the journal"
          aside={
            <Link
              href="/blog"
              className="fq-link inline-block py-1.5 text-white/80 hover:text-white transition-colors"
            >
              All entries →
            </Link>
          }
        >
          <ul
            role="list"
            className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-10 gap-y-14 max-w-[1500px]"
          >
            {more.map((p, i) => (
              <li key={p.id} className="min-w-0">
                <PostCard post={p} index={i} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <ClosingBand
        eyebrow="Work with us"
        title={"Planning something\nsimilar?"}
        body="Tell us about your space and what you have in mind."
        primary={{ label: "Start a project", startProject: true }}
        secondary={{ label: "See past projects →", href: "/past-projects" }}
      />
    </PageShell>
  );
}
