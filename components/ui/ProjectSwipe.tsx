"use client";

import React, { useEffect, useRef, useState } from "react";
import { responsive } from "@/lib/img";
import { prefersReducedMotion } from "@/lib/motion";
import "./ProjectSwipe.css";

export interface ProjectSwipeItem {
  image: string;
  label: string;
  category?: string;
  link: string;
  alt?: string;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * The phone version of the featured work: a native, snapping swipe carousel.
 * Cards are tall (4:5) so the photography leads; as a card leaves the centre
 * it eases back in scale and its photo drifts the other way, which gives the
 * strip depth without any JS-driven scrolling (the swipe itself stays native).
 */
export function ProjectSwipe({
  items,
  autoplayMs,
}: {
  items: ProjectSwipeItem[];
  /**
   * Glide to the next card on this interval while the carousel is on
   * screen; any touch pauses it for a few seconds.
   */
  autoplayMs?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const total = items.length;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>(".ps-card"));
    const still = prefersReducedMotion();
    let raf = 0;
    let last = -1;

    const paint = () => {
      raf = 0;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((card, i) => {
        const centre = card.offsetLeft + card.offsetWidth / 2;
        const d = (centre - mid) / card.offsetWidth; // −1…1 per card away
        if (Math.abs(d) < bestDist) {
          bestDist = Math.abs(d);
          best = i;
        }
        if (still) return;
        const a = Math.min(1, Math.abs(d));
        card.style.setProperty("--ps-scale", (1 - a * 0.06).toFixed(4));
        card.style.setProperty("--ps-drift", `${(-d * 14).toFixed(2)}%`);
        card.style.setProperty("--ps-veil", (a * 0.45).toFixed(3));
      });
      if (best !== last) {
        last = best;
        setActive(best);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !autoplayMs || items.length < 2 || prefersReducedMotion()) return;
    let visible = false;
    let touchedAt = 0;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.5 });
    io.observe(track);
    const touch = () => (touchedAt = Date.now());
    track.addEventListener("pointerdown", touch, { passive: true });
    track.addEventListener("touchstart", touch, { passive: true });
    track.addEventListener("wheel", touch, { passive: true });
    const id = window.setInterval(() => {
      if (!visible || document.hidden || Date.now() - touchedAt < 6000) return;
      const cards = Array.from(track.querySelectorAll<HTMLElement>(".ps-card"));
      const mid = track.scrollLeft + track.clientWidth / 2;
      let cur = 0;
      cards.forEach((c, i) => {
        if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) < Math.abs(cards[cur].offsetLeft + cards[cur].offsetWidth / 2 - mid)) cur = i;
      });
      const next = cards[(cur + 1) % cards.length];
      track.scrollTo({ left: next.offsetLeft - (track.clientWidth - next.offsetWidth) / 2, behavior: "smooth" });
    }, autoplayMs);
    return () => {
      window.clearInterval(id);
      io.disconnect();
      track.removeEventListener("pointerdown", touch);
      track.removeEventListener("touchstart", touch);
      track.removeEventListener("wheel", touch);
    };
  }, [autoplayMs, items]);

  const go = (dir: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(".ps-card");
    if (!track || !card) return;
    track.scrollBy({ left: dir * (card.offsetWidth + 12), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <div
      className="ps"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured projects"
    >
      <div ref={trackRef} className="ps-track">
        {items.map((item, i) => (
          <a
            key={item.link + i}
            href={item.link}
            className={`ps-card${i === active ? " is-active" : ""}`}
            aria-label={`${item.label}${item.category ? ` — ${item.category}` : ""}`}
          >
            <span className="ps-media">
              <img
                {...responsive(item.image, "84vw", [640, 828, 1080])}
                alt={item.alt || item.label}
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
              />
            </span>
            <span className="ps-shade" aria-hidden="true" />
            <span className="ps-index" aria-hidden="true">
              {pad2(i + 1)}
              <i> / {pad2(total)}</i>
            </span>
            <span className="ps-body">
              {item.category && <span className="ps-cat">{item.category}</span>}
              <span className="ps-name">{item.label}</span>
              <span className="ps-cta" aria-hidden="true">
                View project
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M7 17L17 7M9 7h8v8" strokeLinecap="square" />
                </svg>
              </span>
            </span>
          </a>
        ))}
      </div>

      <div className="ps-foot">
        <span className="ps-count" aria-live="polite">
          <b>{pad2(active + 1)}</b> / {pad2(total)}
        </span>
        <span className="ps-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${total ? (active + 1) / total : 0})` }} />
        </span>
        <span className="ps-arrows">
          <button type="button" onClick={() => go(-1)} aria-label="Previous project" disabled={active === 0}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="square" />
            </svg>
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next project" disabled={active === total - 1}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 6l6 6-6 6" strokeLinecap="square" />
            </svg>
          </button>
        </span>
      </div>
    </div>
  );
}
