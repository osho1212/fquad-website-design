"use client";

import React from "react";
import { Navbar } from "@/components/ui/mini-navbar";
import Link from "next/link";

const recognitions = [
  "IIID",
  "Hafele Design Awards",
  "ELDORK India Architecture Awards",
  "Surfaces Reporter",
  "Times Design Icons South",
];

const fourFs = [
  {
    num: "01",
    title: "Functional",
    desc: "We believe every design should serve a purpose. Our spaces are planned to be efficient, comfortable, and intuitive while maintaining a strong aesthetic identity.",
  },
  {
    num: "02",
    title: "Futuristic",
    desc: "We design with longevity in mind, creating spaces that adapt to changing lifestyles, technologies, and future needs.",
  },
  {
    num: "03",
    title: "Friendly",
    desc: "Collaboration is central to our process. We value open communication, transparency, and lasting relationships with every client.",
  },
  {
    num: "04",
    title: "Flexible",
    desc: "Every project is unique. Our ability to adapt, experiment, and respond to different styles and requirements allows us to deliver truly personalized design solutions.",
  },
];

export default function StudioPage() {
  return (
    <div className="relative bg-transparent text-white min-h-screen selection:bg-white selection:text-black">
      {/* Floating Pill Navbar */}
      <Navbar />

      {/* Studio Hero */}
      <section className="pt-40 sm:pt-48 pb-20 px-6 sm:px-14 border-b border-white/15">
        <div className="text-[10.5px] tracking-[0.22em] text-[#a09d94] mb-8 uppercase font-medium">
          FOUNDED 2005 · HYDERABAD · AWARD-WINNING STUDIO
        </div>
        <h1 className="m-0 font-normal uppercase text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.96] tracking-tight max-w-[24ch] text-white">
          Designing Spaces That Work Today and Evolve for Tomorrow.
        </h1>
        <p className="mt-10 max-w-[60ch] text-base sm:text-lg leading-relaxed text-white/70">
          F.Quad Studio is an award-winning architecture and interior design practice built on the principles of Functionality, Futuristic thinking, Friendly collaboration, and Flexibility.
        </p>
      </section>

      {/* Studio Image & Metrics */}
      <section className="px-6 sm:px-14 py-16">
        <figure className="m-0 overflow-hidden h-[50vh] sm:h-[65vh] rounded-xl bg-zinc-900 border border-white/10">
          <img
            src="/assets/images/a1.jpg"
            alt="Private residence, Hyderabad — F.QUAD"
            className="w-full h-full object-cover block"
          />
        </figure>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/15 border-b border-white/15 py-12">
          <div className="py-6 md:py-0">
            <div className="font-light text-5xl sm:text-7xl leading-none text-white">
              20+
            </div>
            <div className="text-[10px] tracking-[0.2em] text-white/45 mt-3 uppercase">
              YEARS OF EXPERIENCE
            </div>
          </div>

          <div className="py-6 md:py-0 md:pl-10">
            <div className="font-light text-5xl sm:text-7xl leading-none text-white">
              500+
            </div>
            <div className="text-[10px] tracking-[0.2em] text-white/45 mt-3 uppercase">
              PROJECTS COMPLETED
            </div>
          </div>

          <div className="py-6 md:py-0 md:pl-10">
            <div className="font-light text-5xl sm:text-7xl leading-none text-white">
              22+
            </div>
            <div className="text-[10px] tracking-[0.2em] text-white/45 mt-3 uppercase">
              DESIGN AWARDS
            </div>
          </div>
        </div>

        <div className="pt-6 text-[10px] tracking-[0.2em] text-white/50 uppercase">
          RESIDENTIAL • COMMERCIAL • RETAIL • HOSPITALITY • INSTITUTIONAL
        </div>
      </section>

      {/* Our Story */}
      <section className="px-6 sm:px-14 py-24 grid grid-cols-1 lg:grid-cols-[0.4fr_1fr] gap-12 border-t border-white/15">
        <div className="text-[10px] tracking-[0.22em] text-white/45 uppercase font-medium">
          OUR STORY
        </div>
        <div>
          <p className="font-display m-0 font-normal uppercase text-2xl sm:text-4xl md:text-5xl leading-snug max-w-[28ch] text-white">
            F.Quad Studio began with a simple belief—
          </p>
          <p className="mt-8 text-base sm:text-lg leading-relaxed text-white/70 max-w-[62ch]">
            that great design should be functional, meaningful, and built around people. Founded by Amit Shah and Ashmi Shah in 2005, the practice has grown into one of Hyderabad's leading architecture and interior design studios.
          </p>
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-white/70 max-w-[62ch]">
            Our work is shaped by curiosity, collaboration, and a willingness to explore diverse design languages while staying true to functionality. Every project is approached with fresh thinking, ensuring each space reflects its purpose, context, and the aspirations of its users.
          </p>
        </div>
      </section>

      {/* The Four F's Grid */}
      <section className="px-6 sm:px-14 py-24 bg-zinc-950 border-t border-white/15">
        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-4 mb-16 pb-6 border-b border-white/15">
          <div className="text-[10px] tracking-[0.22em] text-white/45 uppercase">
            WHAT'S BEHIND THE NAME
          </div>
          <h2 className="m-0 font-normal uppercase text-3xl sm:text-4xl md:text-5xl text-white">
            The Four F's
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
          {fourFs.map((f) => (
            <div
              key={f.num}
              className="pt-6 sm:pt-0 sm:px-8 first:sm:pl-0 last:sm:pr-0"
            >
              <div className="text-[10px] tracking-[0.2em] text-[#c0c0c0]">
                {f.num}
              </div>
              <h3 className="m-0 mt-4 font-normal uppercase text-2xl sm:text-3xl text-white">
                {f.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Meet the Founders */}
      <section className="px-6 sm:px-14 py-28 border-t border-white/15">
        <div className="text-[10px] tracking-[0.22em] text-white/45 mb-14 uppercase font-medium">
          MEET THE FOUNDERS
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          <article>
            <div className="aspect-[4/5] rounded-xl bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.06)_0_8px,transparent_8px_16px)] border border-white/15 flex items-center justify-center p-6 text-center">
              <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase leading-relaxed">
                FOUNDER PORTRAIT
                <br />
                AMIT SHAH
              </span>
            </div>
            <h3 className="m-0 mt-8 font-normal uppercase text-3xl sm:text-4xl text-white">
              Amit Shah
            </h3>
            <div className="text-[10px] tracking-[0.2em] text-[#a9a9a9] mt-2.5 uppercase">
              PRINCIPAL ARCHITECT
            </div>
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-white/70 max-w-[46ch]">
              20+ years of architectural experience with expertise across residential, commercial, and institutional projects. Amit believes in creating spaces that balance innovation with functionality and is a regular speaker at leading architecture and design forums.
            </p>
          </article>

          <article className="md:mt-12">
            <div className="aspect-[4/5] rounded-xl bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.06)_0_8px,transparent_8px_16px)] border border-white/15 flex items-center justify-center p-6 text-center">
              <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase leading-relaxed">
                FOUNDER PORTRAIT
                <br />
                ASHMI SHAH
              </span>
            </div>
            <h3 className="m-0 mt-8 font-normal uppercase text-3xl sm:text-4xl text-white">
              Ashmi Shah
            </h3>
            <div className="text-[10px] tracking-[0.2em] text-[#a9a9a9] mt-2.5 uppercase">
              PRINCIPAL INTERIOR DESIGNER
            </div>
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-white/70 max-w-[46ch]">
              An accomplished interior designer with over two decades of experience, Ashmi focuses on creating client-centric interiors that seamlessly blend aesthetics with functionality. Beyond design, she actively champions accessibility, sustainability, and climate-conscious practices.
            </p>
          </article>
        </div>
      </section>

      {/* Recognition */}
      <section className="px-6 sm:px-14 py-24 border-t border-white/15 grid grid-cols-1 lg:grid-cols-[0.4fr_1fr] gap-12">
        <div className="text-[10px] tracking-[0.22em] text-white/45 uppercase font-medium">
          RECOGNITION
        </div>
        <div>
          <h2 className="m-0 font-normal uppercase text-3xl sm:text-5xl md:text-6xl leading-tight text-white">
            Work That Speaks
            <br />
            For Itself.
          </h2>
          <p className="mt-6 mb-12 text-sm sm:text-base text-white/65 max-w-[46ch]">
            Over the years, our work has been recognised by some of the industry's most respected institutions.
          </p>

          <div className="divide-y divide-white/15 border-t border-b border-white/15">
            {recognitions.map((rec) => (
              <div
                key={rec}
                className="flex justify-between items-center py-6 group"
              >
                <span className="text-xl sm:text-2xl md:text-3xl font-normal uppercase text-white group-hover:text-white transition-colors">
                  {rec}
                </span>
                <span className="text-[9.5px] tracking-[0.18em] text-[#a09d94] uppercase">
                  RECOGNITION
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio CTA Banner */}
      <section id="studio-cta" className="px-6 sm:px-14 py-28 bg-black border-t border-white/15">
        <div className="pb-16 border-b border-white/15">
          <p className="font-display m-0 font-normal uppercase text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight max-w-[26ch] text-white">
            At F.Quad Studio, every project is an opportunity to create spaces that inspire, perform, and endure.
          </p>
          <p className="mt-8 text-base sm:text-lg leading-relaxed text-white/65 max-w-[60ch]">
            Whether designing a home, workplace, retail environment, or public space, our focus remains the same—to deliver thoughtful design that reflects our clients' vision and stands the test of time.
          </p>

          <div className="flex flex-wrap gap-4 mt-12">
            <Link
              href="/#work"
              className="text-[10.5px] tracking-[0.16em] px-7 py-4 border border-white/40 hover:border-white text-white rounded-full transition-colors uppercase font-medium inline-flex items-center"
            >
              VIEW OUR WORK
            </Link>
            <a
              href="mailto:admin@fquad.com"
              className="btn-metallic text-xs uppercase font-medium"
            >
              START A PROJECT →
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
