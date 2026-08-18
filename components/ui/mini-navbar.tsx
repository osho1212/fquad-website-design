"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  label: string;
  href: string;
}

const defaultLinks: NavLink[] = [
  { label: "WORK", href: "/#work" },
  { label: "SERVICES", href: "/services" },
  { label: "STUDIO", href: "/studio" },
  { label: "JOURNAL", href: "/#awards" },
  { label: "CONTACT", href: "/#contact" },
];

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
      className={`group relative block overflow-hidden h-7 px-3.5 text-[9px] tracking-[0.18em] uppercase rounded-none font-display transition-all duration-300 ${
        isActive
          ? "bg-white text-black border border-white font-bold"
          : "text-white/70 hover:text-white hover:bg-white/10 border border-transparent"
      }`}
      style={{ fontFamily: "var(--font-good-times)" }}
    >
      <div className="flex flex-col transition-transform duration-300 ease-out transform group-hover:-translate-y-1/2">
        <span className="h-7 leading-7 flex items-center justify-center whitespace-nowrap">
          {children}
        </span>
        <span className="h-7 leading-7 flex items-center justify-center whitespace-nowrap text-white font-bold">
          {children}
        </span>
      </div>
    </Link>
  );
};

export function Navbar({ links = defaultLinks }: { links?: NavLink[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-11 py-3.5 pointer-events-none transition-transform duration-500 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Standalone Brand Logo (No container background) */}
      <Link
        href="/"
        className="pointer-events-auto inline-flex items-center justify-center p-0.5 text-white hover:opacity-85 hover:-translate-y-0.5 transition-all duration-300 group"
        aria-label="F.QUAD Home"
      >
        <img
          src="/assets/images/fquad-icon.svg"
          alt="F.QUAD Logo"
          className="w-7 h-7 sm:w-8 sm:h-8 object-contain block group-hover:scale-105 transition-transform drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        />
      </Link>

      {/* Center Nav Box (Desktop - Absolute Center Alignment & Sharp Geometric Edges) */}
      <nav
        className="pointer-events-auto hidden md:inline-flex items-center gap-1 px-1.5 py-1 bg-[#121212]/80 backdrop-blur-2xl border border-white/20 rounded-none shadow-[0_6px_30px_rgba(0,0,0,0.5)] absolute left-1/2 -translate-x-1/2 font-display"
        style={{ fontFamily: "var(--font-good-times)" }}
      >
        {links.map((link) => (
          <AnimatedNavLink
            key={link.label}
            href={link.href}
            isActive={
              link.href === "/services"
                ? pathname === "/services"
                : link.href === "/studio"
                ? pathname === "/studio"
                : pathname === "/" && link.label === "WORK"
            }
          >
            {link.label}
          </AnimatedNavLink>
        ))}
      </nav>

      {/* Right Action & Mobile Toggle */}
      <div className="pointer-events-auto flex items-center gap-3">
        <a
          href="/#contact"
          className="btn-metallic hidden sm:inline-flex text-[9.5px] py-2 px-5 tracking-[0.18em] rounded-none font-display"
          style={{ fontFamily: "var(--font-good-times)" }}
        >
          START A PROJECT
        </a>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMenu}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-none bg-[#121212]/80 backdrop-blur-xl border border-white/20 text-white/80 hover:text-white"
        >
          {isOpen ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden pointer-events-auto fixed top-16 left-6 right-6 p-5 rounded-none bg-[#0e0e0e]/95 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col items-center gap-3 transition-all duration-300 font-display ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ fontFamily: "var(--font-good-times)" }}
      >
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className={`w-full py-2.5 text-center text-[10px] tracking-[0.2em] rounded-none transition-colors ${
              (link.href === "/services" && pathname === "/services") ||
              (link.href === "/studio" && pathname === "/studio") ||
              (link.href.startsWith("/#") && pathname === "/" && link.label === "WORK")
                ? "bg-white text-black font-bold"
                : "text-white/70 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
        <a
          href="/#contact"
          onClick={() => setIsOpen(false)}
          className="btn-metallic w-full text-center mt-2 text-[10px] py-2.5 rounded-none"
        >
          START A PROJECT
        </a>
      </div>
    </header>
  );
}
