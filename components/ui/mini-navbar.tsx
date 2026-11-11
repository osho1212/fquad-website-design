"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStartProjectModal } from "@/components/ui/StartProjectModalContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { withDefaults } from "@/lib/cms/schema";

interface NavLink {
  label: string;
  href: string;
}

/**
 * A link is active when the current path matches its route (including nested
 * routes such as /past-projects/[slug]). Hash links only count on the homepage.
 */
function isLinkActive(link: NavLink, pathname: string): boolean {
  if (link.href.startsWith("/#") || link.href.startsWith("#")) {
    return pathname === "/";
  }
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

/** A tab: the selected one is marked by a stroke along its bottom edge. */
const AnimatedNavLink = ({
  href,
  children,
  isActive,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`group relative block overflow-hidden h-9 px-3 xl:px-4 text-[11px] tracking-[0.18em] uppercase rounded-none font-display border-b-2 transition-colors duration-300 ${
        isActive
          ? "text-white border-white font-bold"
          : "text-white/70 hover:text-white border-transparent hover:border-white/40"
      }`}
      style={{ fontFamily: "var(--font-good-times)" }}
    >
      <div className="flex flex-col transition-transform duration-300 ease-out transform group-hover:-translate-y-1/2">
        <span className="h-[34px] flex items-center justify-center whitespace-nowrap">
          {children}
        </span>
        {/* Hover duplicate for the roll-over effect. */}
        <span className="h-[34px] flex items-center justify-center whitespace-nowrap font-bold text-white">
          {children}
        </span>
      </div>
    </Link>
  );
};

export function Navbar({
  content,
  links,
}: {
  content?: Record<string, any>;
  /** Overrides the CMS links — used where a page needs its own menu. */
  links?: NavLink[];
}) {
  const c = withDefaults("global", "nav", content);
  const navLinks: NavLink[] = links ?? c.links ?? [];
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { openModal } = useStartProjectModal();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 200) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Escape dismisses the mobile drawer, and it never outlives a navigation.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const logo = (
    <Link
      href="/"
      className="pointer-events-auto fq-tap-y inline-flex items-center justify-center w-10 h-9 lg:w-auto lg:h-auto lg:p-0.5 text-white hover:opacity-85 transition-opacity duration-300 group"
      aria-label="F.QUAD Home"
    >
      <img
        src={c.logo}
        alt={c.logoAlt}
        width={32}
        height={32}
        className="fq-nav-logo w-7 h-7 sm:w-8 sm:h-8 object-contain block"
      />
    </Link>
  );

  /*
   * Three-column grid so the centre never collides with either side.
   *
   *  < lg (phone / tablet):  [ logo | hamburger ]            [ theme · primary CTA ]
   *  ≥ lg (desktop):         [ logo ]   [ tabs ]               [ theme · primary CTA ]
   */
  return (
    <header
      className={`fixed top-0 left-[env(safe-area-inset-left,0px)] right-[env(safe-area-inset-right,0px)] z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:px-6 lg:px-11 py-3 pointer-events-none transition-transform duration-500 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Left: logo — on phone/tablet it shares one frame with the menu button */}
      <div className="fq-nav-frame pointer-events-auto flex items-center justify-self-start">
        {logo}
        <span aria-hidden="true" className="lg:hidden w-px h-5 bg-white/20" />
        <button
          type="button"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          className="fq-tap-y lg:hidden flex items-center justify-center w-10 h-9 rounded-none text-white/80 hover:text-white"
        >
          <svg
            className="w-[18px] h-[18px]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth="2"
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Centre: tabs (desktop only) */}
      <div className="justify-self-center">
        <nav
          aria-label="Primary"
          className="pointer-events-auto hidden lg:inline-flex items-center gap-1 px-2 bg-[#121212]/80 backdrop-blur-2xl border border-white/20 rounded-none font-display"
          style={{ fontFamily: "var(--font-good-times)" }}
        >
          {navLinks.map((link) => (
            <AnimatedNavLink
              key={link.label}
              href={link.href}
              isActive={isLinkActive(link, pathname)}
            >
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>
      </div>

      {/* Right: primary action (and theme toggle on desktop) */}
      <div className="pointer-events-auto flex items-center gap-3 justify-self-end">
        <ThemeToggle className="w-9 h-9 lg:w-8 lg:h-8" />
        <button
          type="button"
          onClick={() => openModal()}
          className="btn-primary fq-tap min-h-9 lg:min-h-[40px] text-[11px] py-2 px-3 sm:px-5 tracking-[0.1em] sm:tracking-[0.18em] rounded-none font-display"
          style={{ fontFamily: "var(--font-good-times)" }}
        >
          {c.ctaLabel}
        </button>
      </div>

      {/* Mobile / tablet drawer */}
      <nav
        id="mobile-menu"
        aria-label="Mobile"
        className={`lg:hidden pointer-events-auto fixed top-[68px] left-4 right-4 sm:left-6 sm:right-auto sm:w-80 px-5 py-2 rounded-none bg-[#0e0e0e]/95 backdrop-blur-2xl border border-white/20 flex flex-col transition-all duration-300 font-display origin-top-left ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none invisible"
        }`}
        style={{ fontFamily: "var(--font-good-times)" }}
      >
        {navLinks.map((link) => {
          const active = isLinkActive(link, pathname);
          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`w-full py-3 min-h-[48px] flex items-center text-[11px] tracking-[0.2em] uppercase rounded-none border-b transition-colors ${
                active
                  ? "text-white font-bold border-white"
                  : "text-white/70 hover:text-white border-white/10"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
