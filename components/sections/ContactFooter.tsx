"use client";

import React from "react";
import Link from "next/link";
import { useStartProjectModal } from "@/components/ui/StartProjectModalContext";

export function ContactFooter() {
  const { openModal } = useStartProjectModal();
  return (
    <section
      id="contact"
      className="relative pt-20 sm:pt-28 px-6 sm:px-11 pb-10 border-t border-white/15 bg-transparent"
    >
      <div className="max-w-6xl mx-auto">
        {/* Top CTA Area */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-11 items-end pb-16 sm:pb-20 border-b border-white/15">
          <div>
            <h2 className="m-0 font-semibold uppercase text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white">
              Have a project
              <br />
              in mind?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/60 max-w-[34ch]">
              Let us design a space that works for the way you live.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] tracking-[0.18em] px-6 py-3.5 border border-white/35 hover:border-white text-white rounded-none transition-colors uppercase font-medium inline-flex items-center justify-center"
            >
              WHATSAPP
            </a>
            <button
              type="button"
              onClick={() => openModal()}
              className="btn-metallic text-xs uppercase font-medium cursor-pointer"
            >
              START A PROJECT →
            </button>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <footer className="pt-8 sm:pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr] gap-8 sm:gap-10 text-white items-start">
          {/* Complete Official White Logo Lockup */}
          <div className="flex flex-col items-start">
            <Link href="/" className="inline-block group" aria-label="F.QUAD Home">
              <img
                src="/assets/images/fquad-white-logo-full.svg"
                alt="F.QUAD Architecture & Interior Design Studio by Amit and Ashmi"
                className="w-36 sm:w-44 lg:w-[190px] h-auto object-contain block group-hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>

          <div>
            <div className="text-[10px] tracking-[0.22em] text-white/40 mb-3.5 uppercase font-medium">
              STUDIO
            </div>
            <div className="flex flex-col gap-2 text-xs sm:text-sm text-white/75">
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
            <div className="text-[10px] tracking-[0.22em] text-white/40 mb-3.5 uppercase font-medium">
              PROJECTS
            </div>
            <div className="flex flex-col gap-2 text-xs sm:text-sm text-white/75">
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
            <div className="text-[10px] tracking-[0.22em] text-white/40 mb-3.5 uppercase font-medium">
              CONTACT
            </div>
            <div className="flex flex-col gap-2 text-xs sm:text-sm text-white/75">
              <a
                href="mailto:admin@fquad.com"
                className="text-[#c39a5f] hover:underline"
              >
                admin@fquad.com
              </a>
              <span className="text-white/50 leading-relaxed">
                Hyderabad, Telangana, India
              </span>

              {/* Social Linked Logos in Contact Column */}
              <div className="flex items-center gap-2.5 mt-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="F.QUAD on Instagram"
                  className="w-7 h-7 border border-white/20 hover:border-white bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all duration-300 rounded-none group"
                >
                  <svg
                    className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  >
                    <rect x="2" y="2" width="20" height="20" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with F.QUAD on WhatsApp"
                  className="w-7 h-7 border border-white/20 hover:border-white bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all duration-300 rounded-none group"
                >
                  <svg
                    className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.174 8.174 0 0 1-1.25-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.09s.9 2.43 1.03 2.6c.12.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.18-.48-.3z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* Sub-footer Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-10 pt-5 border-t border-white/10 text-[9.5px] tracking-[0.16em] text-white/40 uppercase">
          <span>© {new Date().getFullYear()} F.QUAD STUDIO. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              PRIVACY
            </a>
            <a href="#" className="hover:text-white transition-colors">
              SITEMAP
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
