"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Inertial smooth scrolling, wired into GSAP so the hero frame scrub, the
 * parallax layers and the pinned sections all read the same eased scroll
 * position. Skipped in the admin and for visitors who ask for reduced motion
 * (they keep native scrolling).
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const enabled = !pathname.startsWith("/admin");

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.15,
      // Exponential ease-out: quick to respond, long soft landing.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
    });
    window.__fqLenis = lenis;
    document.documentElement.classList.add("lenis-on");

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Same-page anchors (#work, #contact…) glide instead of jumping. Runs in
    // the capture phase and calls preventDefault so next/link doesn't also
    // scroll.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href*='#']");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.querySelector(decodeURIComponent(url.hash));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { duration: 1.5 });
      history.pushState(null, "", url.hash);
      // Keep keyboard / screen-reader focus with the scroll (skip link, in-page
      // anchors): a sticky focus left at the top would make the next Tab jump
      // back up the page.
      if (target instanceof HTMLElement) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    };
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      gsap.ticker.remove(tick);
      lenis.destroy();
      document.documentElement.classList.remove("lenis-on");
      delete window.__fqLenis;
    };
  }, [enabled]);

  return null;
}
