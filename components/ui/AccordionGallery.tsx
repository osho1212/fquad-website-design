"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { responsive } from "@/lib/img";
import "./AccordionGallery.css";

export interface AccordionGalleryItem {
  image: string;
  label?: string;
  category?: string;
  link?: string;
  alt?: string;
}

export interface AccordionGalleryProps {
  items: AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  /** Number is treated as px. Strings pass through, so "100%" / "100vh" fill a parent. */
  height?: number | string;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: "horizontal" | "vertical";
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: "hover" | "click";
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
  /**
   * How many cards fit the frame at once. When set, cards take a fixed width
   * and the track scrolls horizontally instead of squeezing every item in.
   * Pass breakpoints to vary it: `{ base: 1.2, md: 3, lg: 5 }` (md ≥ 768px,
   * lg ≥ 1024px). Below two slots the track becomes a swipe carousel: every
   * card the same width, snapping, with its label always shown.
   */
  visibleCount?: number | VisibleCount;
  /** `sizes` for the card images, so the browser fetches the right width. */
  imageSizes?: string;
  /**
   * Fixed-width track only: let the active card grow (the accordion). Off,
   * every card keeps the same width and spacing, labels stay visible, and
   * hover is a photo zoom — so no card is ever pushed half off the edge.
   */
  grow?: boolean;
  /** Repeat the track so horizontal scrolling wraps around endlessly. */
  loop?: boolean;
  /**
   * Drive the open panel from outside (e.g. scroll progress). Hover and
   * focus still open panels; the next change of this value takes over again.
   */
  activeIndex?: number;
  /** Told whenever the open panel changes (hover, focus, or activeIndex). */
  onActiveChange?: (index: number) => void;
}

export interface VisibleCount {
  base: number;
  md?: number;
  lg?: number;
}

/** Sets rendered when looping: one on screen, one either side to scroll into. */
const LOOP_SETS = 3;

function slotsFor(v: number | VisibleCount | undefined, viewport: number): number {
  if (v === undefined) return 1;
  if (typeof v === "number") return v;
  if (viewport >= 1024 && v.lg) return v.lg;
  if (viewport >= 768 && v.md) return v.md;
  return v.base;
}

export default function AccordionGallery({
  items = [],
  defaultIndex = 1,
  accentColor = "var(--fq-accent)",
  overlayColor = "#000000",
  textColor = "#ffffff",
  height = 480,
  gap = 12,
  radius = 14,
  expandRatio = 0.5,
  orientation = "horizontal",
  duration = 0.6,
  ease = "power3.out",
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = "hover",
  showLabels = true,
  grayscale = false,
  className = "",
  visibleCount,
  loop = false,
  imageSizes,
  grow: growActive = true,
  activeIndex,
  onActiveChange,
}: AccordionGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(380);
  const cardWRef = useRef(0);
  const wrappingRef = useRef(false);
  // Fewer than two cards on screen (phones): a plain swipe carousel.
  const [compact, setCompact] = useState(false);
  const compactRef = useRef(false);

  const vertical = orientation === "vertical";
  const base = items.length;

  // Fixed-width track mode: only meaningful horizontally with items to spare.
  const scrollMode = Boolean(visibleCount) && !vertical && base > 0;
  const looping = scrollMode && loop && base > 1;
  const sets = looping ? LOOP_SETS : 1;

  const rendered = React.useMemo(
    () => (looping ? Array.from({ length: sets }, () => items).flat() : items),
    [items, looping, sets]
  );
  const count = rendered.length;

  const [active, setActive] = useState(() => {
    const clamped = Math.min(Math.max(defaultIndex, 0), Math.max(0, base - 1));
    // Start in the middle set so there is room to scroll both ways.
    return looping ? base + clamped : clamped;
  });

  useEffect(() => {
    if (activeIndex === undefined || base === 0) return;
    const i = Math.min(Math.max(activeIndex, 0), base - 1);
    setActive(looping ? base + i : i);
  }, [activeIndex, base, looping]);

  const onActiveRef = useRef(onActiveChange);
  onActiveRef.current = onActiveChange;
  useEffect(() => {
    if (base > 0) onActiveRef.current?.(active % base);
  }, [active, base]);

  const prefersReduced =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const mediaSize = mediaSizeRef.current;
      const cardW = cardWRef.current;

      // Fixed mode: the active card grows and the rest of ITS set shrink to
      // absorb it, so every set keeps the same width and the loop stays exact.
      // A compact (swipe) track keeps every card the same width instead.
      const flat = compactRef.current || (scrollMode && !growActive);
      const grown = cardW * (1 + r);
      const shrunk =
        base > 1 ? cardW - (grown - cardW) / (base - 1) : cardW;

      // Flex mode (original): all items share the frame via flex-grow.
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;

      tlRef.current?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();

      const activeSet = Math.floor(active / base);

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const text = textRefs.current[i];

        const rot = flat || isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        // The dim lives on the panel: the overlay that reads it is a sibling of
        // the media span, so setting it on the media never reached it and
        // every card sat at the 0.35 default.
        const dim = isActive || flat ? 0.05 : 0.38;
        if (scrollMode) {
          const sameSet = Math.floor(i / base) === activeSet;
          const w = flat ? cardW : isActive ? grown : sameSet ? shrunk : cardW;
          tl.to(panel, { width: w, ...rotProp, "--ag-dim": dim, duration: dur, ease }, 0);
        } else {
          tl.to(
            panel,
            { flexGrow: isActive ? grow : 1, ...rotProp, "--ag-dim": dim, duration: dur, ease },
            0
          );
        }

        if (media) {
          const drift = flat ? 0 : Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * mediaSize * 0.06;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              "--ag-gray": gray,
              duration: dur,
              ease,
            },
            0
          );
        }

        if (showLabels && bar && text) {
          // Touch has no hover to reveal a label, so a compact track shows all.
          if (isActive || flat) {
            tl.to(
              [bar, text],
              {
                opacity: 1,
                x: 0,
                duration: dur,
                ease,
                stagger: prefersReduced ? 0 : stagger,
              },
              0
            );
          } else {
            tl.to(
              [bar, text],
              { opacity: 0, x: -14, duration: dur * 0.6, ease },
              0
            );
          }
        }
      });

      tlRef.current = tl;
    },
    [
      active,
      base,
      count,
      expandRatio,
      duration,
      ease,
      vertical,
      tilt,
      parallax,
      grayscale,
      showLabels,
      stagger,
      prefersReduced,
      scrollMode,
      compact,
      growActive,
    ]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;

      if (scrollMode) {
        const slots = Math.max(1, slotsFor(visibleCount, window.innerWidth));
        const isCompact = slots < 2;
        compactRef.current = isCompact;
        setCompact(isCompact);
        // Exactly `slots` cards plus the gaps between them fill the frame (a
        // fractional count leaves the next card peeking in from the edge).
        cardWRef.current = Math.max(
          80,
          (rect.width - gap * (slots - 1)) / slots
        );
        mediaSizeRef.current = Math.max(140, cardWRef.current * 1.5);
      } else {
        const usable = Math.max(total - gap * (count - 1), 120);
        mediaSizeRef.current = Math.max(
          140,
          usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22
        );
      }

      el.style.setProperty("--ag-media-size", `${mediaSizeRef.current}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout, gap, count, expandRatio, vertical, scrollMode, visibleCount]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    []
  );

  /** Width of one full set, including the gap that trails each card. */
  const setWidth = useCallback(
    () => base * (cardWRef.current + gap),
    [base, gap]
  );

  // Start the viewport on the middle set so both directions have runway.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !looping) return;
    const id = requestAnimationFrame(() => {
      el.scrollLeft = setWidth();
    });
    return () => cancelAnimationFrame(id);
  }, [looping, setWidth]);

  // Seamless wrap: whenever scrolling drifts out of the middle set, jump a
  // whole set back or forward. Identical content means the jump is invisible.
  const handleScroll = useCallback(() => {
    const el = rootRef.current;
    if (!el || !looping || wrappingRef.current) return;
    const sw = setWidth();
    if (sw <= 0) return;

    let next: number | null = null;
    if (el.scrollLeft < sw * 0.5) next = el.scrollLeft + sw;
    else if (el.scrollLeft > sw * 1.5) next = el.scrollLeft - sw;

    if (next !== null) {
      wrappingRef.current = true;
      el.scrollLeft = next;
      requestAnimationFrame(() => {
        wrappingRef.current = false;
      });
    }
  }, [looping, setWidth]);

  const scrollByCards = (dir: 1 | -1) => {
    const el = rootRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * (cardWRef.current + gap),
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  const handleEnter = (i: number) => {
    if (trigger === "hover") setActive(i);
  };

  const handleClick = (i: number, e: React.MouseEvent) => {
    // With a link present, let the anchor navigate — except in click-trigger
    // mode, where the first click expands and only an open panel follows through.
    const hasLink = Boolean(rendered[i]?.link);
    if (hasLink && (trigger === "hover" || i === active)) return;
    e.preventDefault();
    setActive(i);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    }
  };

  const heightStyle =
    typeof height === "number"
      ? `${Math.round(vertical ? height * 1.6 : height)}px`
      : height;

  const gallery = (
    <div
      ref={rootRef}
      onScroll={looping ? handleScroll : undefined}
      className={`accordion-gallery${
        vertical ? " accordion-gallery--vertical" : ""
      }${scrollMode ? " accordion-gallery--scroll" : ""}${
        scrollMode && compact ? " accordion-gallery--compact" : ""
      }${scrollMode && !growActive && !compact ? " accordion-gallery--even" : ""
      }${className ? ` ${className}` : ""}`}
      style={
        {
          "--ag-accent": accentColor,
          "--ag-overlay": overlayColor,
          "--ag-text": textColor,
          "--ag-gap": `${gap}px`,
          "--ag-radius": `${radius}px`,
          height: scrollMode ? "100%" : heightStyle,
        } as React.CSSProperties
      }
      role="list"
      aria-label="Image accordion gallery"
    >
      {rendered.map((item, i) => {
        const isActive = i === active;
        // Only the middle set is announced; the copies are decorative.
        const isDuplicate = looping && Math.floor(i / base) !== 1;
        return (
          <div
            key={i}
            ref={(el: HTMLDivElement | null) => {
              panelRefs.current[i] = el;
            }}
            className={`ag-panel${isActive ? " ag-panel--active" : ""}`}
            style={{ borderRadius: `${radius}px` }}
            onClick={(e: React.MouseEvent) => handleClick(i, e)}
            onMouseEnter={() => handleEnter(i)}
            onPointerEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(i, e)}
            role="listitem"
            aria-hidden={isDuplicate || undefined}
            /* When a link is present the inner anchor owns the tab stop. */
            tabIndex={item.link ? undefined : 0}
            aria-current={isActive ? "true" : undefined}
            aria-label={item.link ? undefined : item.label}
          >
            {item.link && (
              <a
                className="ag-panel__link"
                href={item.link}
                aria-label={item.label}
                tabIndex={isDuplicate ? -1 : undefined}
              />
            )}
            <span className="ag-panel__frame">
              <span
                className="ag-panel__media"
                ref={(el: HTMLSpanElement | null) => {
                  mediaRefs.current[i] = el;
                }}
              >
                <img
                  {...(imageSizes
                    ? responsive(item.image, imageSizes)
                    : { src: item.image })}
                  alt={item.alt || item.label || ""}
                  draggable="false"
                  className="fq-img"
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>
            {showLabels && (
              <span className="ag-panel__label" aria-hidden="true">
                <span
                  className="ag-panel__bar"
                  ref={(el: HTMLSpanElement | null) => {
                    barRefs.current[i] = el;
                  }}
                />
                <span
                  className="ag-panel__text"
                  ref={(el: HTMLSpanElement | null) => {
                    textRefs.current[i] = el;
                  }}
                >
                  {item.category && (
                    <span className="ag-panel__category">{item.category}</span>
                  )}
                  {item.label}
                </span>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  if (!scrollMode) return gallery;

  return (
    <div className="ag-shell" style={{ height: heightStyle }}>
      {gallery}
      <button
        type="button"
        className="ag-nav ag-nav--prev"
        onClick={() => scrollByCards(-1)}
        aria-label="Scroll to previous projects"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 18l-6-6 6-6" strokeLinecap="square" />
        </svg>
      </button>
      <button
        type="button"
        className="ag-nav ag-nav--next"
        onClick={() => scrollByCards(1)}
        aria-label="Scroll to more projects"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 6l6 6-6 6" strokeLinecap="square" />
        </svg>
      </button>
    </div>
  );
}
