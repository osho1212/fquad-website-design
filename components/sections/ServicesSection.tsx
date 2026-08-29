"use client";

import React from "react";
import Link from "next/link";
import { withDefaults } from "@/lib/cms/schema";

export interface ServiceCard {
  slug: string;
  num: string;
  title: string;
  desc: string;
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
    <section id="services" className="pt-8 pb-20 px-6 sm:px-11 bg-transparent">
      <div className="flex justify-between items-baseline border-t border-white/15 pt-6 mb-8">
        <div className="text-[10px] tracking-[0.24em] text-white/60 uppercase">
          {c.eyebrow}
        </div>
        <Link
          href={c.linkHref}
          className="text-[10px] tracking-[0.18em] text-[#c0c0c0] hover:text-white transition-colors"
        >
          {c.linkLabel}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-white/15 rounded-none overflow-hidden border border-white/15">
        {services.map((svc) => (
          <Link
            key={svc.slug}
            href={`/services/${svc.slug}`}
            className="block bg-black/60 backdrop-blur-md p-8 sm:p-10 hover:bg-black/40 transition-colors duration-300 group"
          >
            <div className="text-[10px] text-[#c0c0c0] tracking-[0.2em]">
              {svc.num}
            </div>
            <h3 className="m-0 mt-5 font-semibold text-lg sm:text-xl md:text-2xl tracking-tight text-white group-hover:text-accent transition-colors">
              {svc.title}
            </h3>
            <p className="m-0 mt-2.5 text-sm sm:text-base leading-relaxed text-white/70">
              {svc.desc}
            </p>
            <span className="inline-flex items-center mt-6 text-[9.5px] tracking-[0.18em] uppercase text-[#c0c0c0] group-hover:text-white transition-colors">
              {c.cardCtaLabel}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
