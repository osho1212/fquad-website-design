"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { withDefaults } from "@/lib/cms/schema";
import { InView } from "@/components/motion/InView";
import { ParallaxField, type ParallaxItem } from "@/components/parallax/ParallaxField";
import { hasFinePointer } from "@/lib/motion";

export interface ServiceCard {
  slug: string;
  num: string;
  title: string;
  desc: string;
}

const SERVICES_ART: ParallaxItem[] = [
  { art: "armchair", x: "-3%", y: "-4%", w: 300, depth: -0.4, spin: 8, opacity: 0.09 },
  { art: "sofa", x: "58%", y: "86%", w: 400, depth: 0.5, opacity: 0.11, desktopOnly: true },
  { art: "pendant", x: "93%", y: "0%", w: 70, depth: 0.8, opacity: 0.22, desktopOnly: true },
  { art: "cross", x: "5%", y: "92%", w: 30, depth: 0.9, spin: 90, opacity: 0.28 },
];

/**
 * A card whose border-light follows the pointer. The coordinates are written
 * to this card's own style only (never a shared parent), so moving across
 * the grid restyles one element, not the whole section.
 */
function ServiceTile({
  svc,
  index,
  cta,
}: {
  svc: ServiceCard;
  index: number;
  cta: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || !hasFinePointer()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <Link
      ref={ref}
      href={`/services/${svc.slug}`}
      onPointerMove={onMove}
      className="fq-fade fq-spot group relative block bg-black/60 backdrop-blur-md p-8 sm:p-10 overflow-hidden"
      style={{ ["--i" as string]: index }}
    >
      <div className="flex items-start justify-between">
        <div className="text-[11px] text-[#c0c0c0] tracking-[0.2em]">{svc.num}</div>
        <span
          aria-hidden="true"
          className="fq-arrow text-white/50 group-hover:text-white text-lg leading-none"
        >
          ↗
        </span>
      </div>
      <h3 className="m-0 mt-8 font-semibold text-lg sm:text-xl md:text-2xl tracking-tight text-white transition-transform duration-500 ease-out group-hover:translate-x-1.5">
        {svc.title}
      </h3>
      <p className="m-0 mt-2.5 text-sm sm:text-base leading-relaxed text-white/70 max-w-[46ch]">
        {svc.desc}
      </p>
      <span className="fq-link inline-flex items-center mt-7 text-[11px] tracking-[0.18em] uppercase text-[#c0c0c0] group-hover:text-white transition-colors">
        {cta}
      </span>
    </Link>
  );
}

export function ServicesSection({
  content,
  services = [],
}: {
  content?: Record<string, any>;
  services?: ServiceCard[];
}) {
  const c = withDefaults("home", "services", content);

  if (services.length === 0) return null;

  return (
    <section
      id="services"
      className="relative overflow-hidden pt-8 pb-24 px-6 sm:px-11 bg-transparent"
    >
      <ParallaxField items={SERVICES_ART} />

      <InView className="relative z-10">
        <div className="relative flex justify-between items-baseline pt-6 mb-8">
          <span
            aria-hidden="true"
            className="fq-rule absolute top-0 left-0 right-0 h-px bg-white/25"
          />
          <div className="fq-fade text-[11px] tracking-[0.24em] text-white/60 uppercase">
            {c.eyebrow}
          </div>
          <Link
            href={c.linkHref}
            className="fq-fade fq-link text-[11px] tracking-[0.18em] text-[#c0c0c0] hover:text-white transition-colors"
            style={{ ["--i" as string]: 1 }}
          >
            {c.linkLabel}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-white/15 rounded-none overflow-hidden border border-white/15">
          {services.map((svc, i) => (
            <ServiceTile key={svc.slug} svc={svc} index={i + 1} cta={c.cardCtaLabel} />
          ))}
        </div>
      </InView>
    </section>
  );
}
