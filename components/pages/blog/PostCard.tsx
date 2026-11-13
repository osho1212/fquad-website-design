/* The CMS upload pipeline already writes pre-sized variants (see
   responsiveImage); next/image would only re-process them. */
/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { Art, type ArtName } from "@/components/parallax/art";
import {
  excerptOf,
  formatDate,
  postDate,
  readingMinutes,
  responsiveImage,
  type BlogPostRecord,
} from "./helpers";

// Posts without a cover get a drafting-sheet motif instead of a grey box.
const FALLBACK_ART: ArtName[] = ["plan", "armchair", "pendant", "vase", "mirror", "sofa"];

const SIZES = {
  card: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  feature: "(min-width: 1024px) 55vw, 100vw",
};

/**
 * A journal entry. The title is the one link; its ::after stretches over the
 * whole card so the card is a big target while screen readers hear a single,
 * descriptive link rather than a paragraph of link text.
 */
export function PostCard({
  post,
  index = 0,
  variant = "card",
}: {
  post: BlogPostRecord;
  /** Stagger position within its row. */
  index?: number;
  variant?: "card" | "feature";
}) {
  const feature = variant === "feature";
  const date = postDate(post);
  const img = responsiveImage(post.media, "medium");
  const alt = img?.alt ?? `Cover image for “${post.title}”`;

  return (
    <article
      className={`fq-fade group relative min-w-0 ${
        feature ? "grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-8 lg:gap-14 items-center" : "flex flex-col"
      }`}
      style={{ ["--i" as string]: index }}
    >
      {/* Fixed ratio box: the page never shifts as covers load. */}
      <div className="relative overflow-hidden bg-zinc-900 border border-white/15 aspect-[16/10]">
        {img ? (
          <img
            src={img.src}
            srcSet={img.srcSet}
            sizes={feature ? SIZES.feature : SIZES.card}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="fq-img absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.04]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center text-white opacity-[0.3]"
          >
            <div className="w-[30%] [&>svg]:block [&>svg]:w-full [&>svg]:h-auto">
              <Art name={FALLBACK_ART[index % FALLBACK_ART.length]} />
            </div>
          </div>
        )}
      </div>

      <div className={`min-w-0 ${feature ? "" : "pt-5 flex flex-col flex-1"}`}>
        <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tracking-[0.18em] uppercase text-white/60">
          <time dateTime={date.toISOString()}>{formatDate(date)}</time>
          <span aria-hidden="true">/</span>
          <span>{readingMinutes(post.body)} min read</span>
        </p>

        <h3
          className={`m-0 mt-3 leading-[1.2] tracking-tight text-white break-words ${
            feature ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl"
          }`}
        >
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>

        <p
          className={`m-0 mt-3 max-w-[56ch] text-sm sm:text-base leading-relaxed text-white/70 ${
            feature ? "line-clamp-4" : "line-clamp-3"
          }`}
        >
          {excerptOf(post, 180)}
        </p>

        <span
          aria-hidden="true"
          className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-white/80 transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:translate-x-1 motion-reduce:transition-none"
        >
          Read the entry <span>→</span>
        </span>
      </div>
    </article>
  );
}
