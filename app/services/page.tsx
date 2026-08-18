"use client";

import React from "react";
import { Navbar } from "@/components/ui/mini-navbar";
import Link from "next/link";

const servicesDetailed = [
  {
    num: "01",
    title: "Architecture",
    desc: "Residential, commercial, and hospitality spaces designed around climate and context.",
    image: "/assets/images/a1.jpg",
    alt: "Residence facade in daylight",
    hasLink: true,
  },
  {
    num: "02",
    title: "Interior Design",
    desc: "Material, light, and layout brought together with quiet precision.",
    image: "/assets/images/b21.jpg",
    alt: "Living room with folding screens",
    hasLink: true,
  },
  {
    num: "03",
    title: "Landscape",
    desc: "Outdoor spaces that extend the architecture into its surroundings.",
    image: "/assets/images/a3.jpg",
    alt: "Deck and landscape at dusk",
    hasLink: false,
  },
  {
    num: "04",
    title: "Commercial Fit-out",
    desc: "Workplace and retail interiors built for how people actually use them.",
    image: null,
    placeholder: "COMMERCIAL PROJECT PHOTOGRAPHY TO BE SUPPLIED",
    hasLink: false,
  },
  {
    num: "05",
    title: "Hospitality Design",
    desc: "Restaurants, cafes, and hotels designed for atmosphere and flow.",
    image: null,
    placeholder: "HOSPITALITY PROJECT PHOTOGRAPHY TO BE SUPPLIED",
    hasLink: false,
  },
  {
    num: "06",
    title: "Space Planning",
    desc: "Layouts that resolve function first, so the design can follow.",
    image: "/assets/images/b22.jpg",
    alt: "Interior detail, Barkatpura Residence",
    hasLink: false,
  },
];

const stages = [
  {
    num: "01",
    title: "Brief",
    desc: "We start with site visits and long conversations — understanding how you live, work, and want to feel in the space. Nothing gets drawn until we've listened. This stage sets the brief everything else is measured against.",
  },
  {
    num: "02",
    title: "Concept",
    desc: "Sketches, massing studies, and material references bring the early direction into focus. We present options, not a single fixed answer. This is where the character of the project gets decided.",
  },
  {
    num: "03",
    title: "Development",
    desc: "Concept becomes detailed drawings, specifications, and approvals. We coordinate with contractors and consultants so nothing gets lost between design and site. Budgets and timelines get locked in here.",
  },
  {
    num: "04",
    title: "Delivery",
    desc: "On-site supervision through construction, fit-out, and styling, right up to handover. We stay involved until the space is exactly what was promised. Then we don't disappear — we're on call after you move in.",
  },
];

const projectTypes = [
  "Residence",
  "Villa",
  "Apartment",
  "Office",
  "Restaurant",
  "Hotel",
  "Retail",
  "Landscape",
];

export default function ServicesPage() {
  return (
    <div className="relative bg-transparent text-white min-h-screen selection:bg-white selection:text-black">
      {/* Floating Pill Navbar */}
      <Navbar />

      {/* Services Hero */}
      <section className="pt-40 sm:pt-48 pb-20 px-6 sm:px-14 grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-12 lg:gap-16 items-end border-b border-white/15">
        <div>
          <div className="flex items-center gap-3 text-[10.5px] tracking-[0.22em] text-[#a09d94] mb-8 uppercase font-medium">
            <span className="w-12 h-[1px] bg-white/30" />
            WHAT WE DO
          </div>
          <h1 className="m-0 font-normal uppercase text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-white">
            Every space,
            <br />
            considered.
          </h1>
          <p className="mt-8 max-w-[46ch] text-base sm:text-lg leading-relaxed text-white/70">
            From concept to completion, we design spaces that balance beauty with the way people live and work.
          </p>
        </div>

        <figure className="m-0 overflow-hidden h-[45vh] lg:h-[55vh] rounded-none bg-zinc-900 border border-white/10">
          <img
            src="/assets/images/b49.jpg"
            alt="Interior detail, Barkatpura Residence"
            className="w-full h-full object-cover block transition-transform duration-700 hover:scale-105"
          />
        </figure>
      </section>

      {/* Detailed Services Breakdown */}
      <section className="px-6 sm:px-14 py-16">
        <div className="divide-y divide-white/15">
          {servicesDetailed.map((svc) => (
            <article
              key={svc.num}
              className="grid grid-cols-1 lg:grid-cols-[70px_1fr_1.2fr] gap-8 lg:gap-12 py-14 items-start"
            >
              <div className="text-[11px] tracking-[0.2em] text-[#a9a9a9] font-medium">
                {svc.num}
              </div>

              <div>
                <h2 className="m-0 font-normal text-3xl sm:text-4xl md:text-5xl leading-tight text-white">
                  {svc.title}
                </h2>
                <p className="mt-5 text-sm sm:text-base leading-relaxed text-white/65 max-w-[38ch]">
                  {svc.desc}
                </p>
                {svc.hasLink && (
                  <Link
                    href="/#work"
                    className="inline-flex items-center gap-2.5 mt-7 text-[10.5px] tracking-[0.16em] uppercase text-white/90 hover:text-white border-b border-white/40 hover:border-white pb-1 transition-colors"
                  >
                    VIEW {svc.title.toUpperCase()} WORK →
                  </Link>
                )}
              </div>

              <div>
                {svc.image ? (
                  <figure className="m-0 overflow-hidden aspect-[16/10] rounded-none bg-zinc-900 border border-white/10 group">
                    <img
                      src={svc.image}
                      alt={svc.alt || svc.title}
                      className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-105"
                    />
                  </figure>
                ) : (
                  <div className="aspect-[16/10] rounded-none bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.06)_0_8px,transparent_8px_16px)] border border-white/15 flex items-center justify-center p-6 text-center">
                    <span className="text-[10px] tracking-[0.2em] text-white/45 leading-relaxed uppercase">
                      {svc.placeholder}
                    </span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How We Work - 4 Stages */}
      <section className="px-6 sm:px-14 py-24 bg-zinc-950 border-t border-white/15">
        <div className="flex flex-col md:flex-row justify-between md:items-baseline gap-4 mb-16 pb-6 border-b border-white/15">
          <div className="text-[10px] tracking-[0.22em] text-white/45 uppercase">
            HOW WE WORK
          </div>
          <h2 className="m-0 font-normal uppercase text-2xl sm:text-4xl md:text-5xl text-white">
            Four stages, one team throughout.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
          {stages.map((stg, i) => (
            <div
              key={stg.num}
              className={`pt-6 sm:pt-0 sm:px-8 first:sm:pl-0 last:sm:pr-0`}
            >
              <div className="font-light text-5xl sm:text-6xl tracking-tighter text-[#c0c0c0]">
                {stg.num}
              </div>
              <h3 className="m-0 mt-5 font-normal uppercase text-xl sm:text-2xl text-white">
                {stg.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                {stg.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Metrics */}
      <section className="px-6 sm:px-14 py-20 border-t border-white/15">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-16 border-b border-white/15">
          <div>
            <div className="font-light text-5xl sm:text-7xl leading-none text-white">
              20+
            </div>
            <div className="text-[10px] tracking-[0.2em] text-white/45 mt-3 uppercase">
              EXPERIENCE
            </div>
          </div>
          <div className="md:border-l md:border-white/15 md:pl-10">
            <div className="font-light text-5xl sm:text-7xl leading-none text-white">
              500+
            </div>
            <div className="text-[10px] tracking-[0.2em] text-white/45 mt-3 uppercase">
              PORTFOLIO
            </div>
          </div>
          <div className="md:border-l md:border-white/15 md:pl-10">
            <div className="font-light text-5xl sm:text-7xl leading-none text-white">
              1:1
            </div>
            <div className="text-[10px] tracking-[0.2em] text-white/45 mt-3 uppercase">
              APPROACH
            </div>
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-[32ch]">
              Every project is bespoke — no templates, no repeated floor plans.
            </p>
          </div>
        </div>
      </section>

      {/* Spaces We Design */}
      <section className="px-6 sm:px-14 py-20 grid grid-cols-1 lg:grid-cols-[0.4fr_1fr] gap-10 border-b border-white/15">
        <div className="text-[10px] tracking-[0.22em] text-white/45 uppercase font-medium">
          PROJECT TYPES
        </div>
        <div>
          <h2 className="m-0 mb-10 font-normal uppercase text-3xl sm:text-5xl md:text-6xl text-white">
            Spaces we design.
          </h2>
          <div className="flex flex-wrap gap-y-4 text-xl sm:text-3xl md:text-4xl text-white/80 font-normal">
            {projectTypes.map((type, idx) => (
              <React.Fragment key={type}>
                <span className="hover:text-white transition-colors cursor-default">
                  {type}
                </span>
                {idx < projectTypes.length - 1 && (
                  <span className="px-5 text-white/30 font-light">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Services CTA Banner */}
      <section id="svc-cta" className="px-6 sm:px-14 py-28 bg-black">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-end pb-20 border-b border-white/15">
          <div>
            <h2 className="m-0 font-normal uppercase text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] text-white">
              Have a vision?
              <br />
              Let's build it.
            </h2>
            <p className="mt-8 text-base sm:text-lg text-white/65 max-w-[38ch]">
              Tell us about your project and we'll get back to you within a day.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] tracking-[0.18em] px-6 py-4 border border-white/35 hover:border-white text-white rounded-none transition-colors uppercase font-medium"
            >
              WHATSAPP
            </a>
            <a
              href="mailto:admin@fquad.com"
              className="btn-metallic text-xs uppercase font-medium"
            >
              ENQUIRE →
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-10 text-[9.5px] tracking-[0.16em] text-white/40 uppercase">
          <span>© 2026 F.QUAD STUDIO · HYDERABAD, TELANGANA, INDIA</span>
          <a href="mailto:admin@fquad.com" className="hover:text-white">
            ADMIN@FQUAD.COM
          </a>
        </div>
      </section>
    </div>
  );
}
