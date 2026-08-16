"use client";

import React from "react";

export function ContactFooter() {
  return (
    <section
      id="contact"
      className="relative pt-36 px-6 sm:px-11 pb-14 border-t border-white/15 bg-transparent"
    >
      {/* Top CTA Area */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-11 items-end pb-28">
        <div>
          <h2 className="m-0 font-semibold uppercase text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white">
            Have a project
            <br />
            in mind?
          </h2>
          <p className="mt-6 text-sm sm:text-base text-white/60 max-w-[34ch]">
            Let us design a space that works for the way you live.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.18em] px-6 py-4 border border-white/35 hover:border-white text-white rounded-full transition-colors uppercase font-medium inline-flex items-center justify-center"
          >
            WHATSAPP
          </a>
          <a
            href="mailto:admin@fquad.com"
            className="btn-metallic text-xs uppercase font-medium"
          >
            START A PROJECT →
          </a>
        </div>
      </div>

      {/* Footer Navigation Columns */}
      <footer className="pt-12 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-9 text-white">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/images/fquad-logo.png"
              alt="F.QUAD Logo"
              className="w-5 h-5 object-contain block"
            />
            <span className="font-semibold text-sm tracking-[0.2em]">F.QUAD</span>
          </div>
          <p className="mt-4 text-xs sm:text-sm text-white/50 max-w-[26ch] leading-relaxed">
            Architecture & Interior Design Studio, Hyderabad
          </p>
          <div className="flex gap-4 mt-6 text-[10px] tracking-[0.18em]">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
            >
              INSTAGRAM
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
            >
              WHATSAPP
            </a>
          </div>
        </div>

        <div>
          <div className="text-[10px] tracking-[0.22em] text-white/40 mb-4 uppercase">
            STUDIO
          </div>
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-white/75">
            <a href="#studio" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#studio" className="hover:text-white transition-colors">
              Our Team
            </a>
            <a href="#awards" className="hover:text-white transition-colors">
              Awards & Recognition
            </a>
            <a href="#awards" className="hover:text-white transition-colors">
              Journal
            </a>
          </div>
        </div>

        <div>
          <div className="text-[10px] tracking-[0.22em] text-white/40 mb-4 uppercase">
            PROJECTS
          </div>
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-white/75">
            <a href="#work" className="hover:text-white transition-colors">
              All Projects
            </a>
            <a href="#work" className="hover:text-white transition-colors">
              Upcoming
            </a>
            <a href="#work" className="hover:text-white transition-colors">
              Residential
            </a>
            <a href="#work" className="hover:text-white transition-colors">
              Commercial
            </a>
          </div>
        </div>

        <div>
          <div className="text-[10px] tracking-[0.22em] text-white/40 mb-4 uppercase">
            CONTACT
          </div>
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-white/75">
            <a
              href="mailto:admin@fquad.com"
              className="text-brass hover:underline"
            >
              admin@fquad.com
            </a>
            <span className="text-white/50">Hyderabad, Telangana, India</span>
          </div>
        </div>
      </footer>

      {/* Sub-footer Copyright */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-14 pt-5 border-t border-white/10 text-[9.5px] tracking-[0.16em] text-white/40 uppercase">
        <span>© {new Date().getFullYear()} F.QUAD STUDIO. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">
            PRIVACY
          </a>
          <a href="#" className="hover:text-white">
            SITEMAP
          </a>
        </div>
      </div>
    </section>
  );
}
