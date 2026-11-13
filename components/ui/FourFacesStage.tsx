"use client";

import React, { useRef } from "react";
import { responsive } from "@/lib/img";
import "./FourFacesStage.css";

export interface FaceSlide {
  title: string;
  subtitle: string;
  description?: string;
  accent: string;
  imageUrl: string;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * The four F's as a full-bleed photographic stage. Every face's photograph
 * is laid in at once and the active one fades up with a slow drift, so a
 * change never waits on a download. Type sits on a dark gradient and is a
 * fixed white in both themes — it is always over a photograph.
 */
export function FourFacesStage({
  slides,
  index,
  progress,
  eyebrow,
  hint,
  onNavigate,
}: {
  slides: FaceSlide[];
  index: number;
  /** 0–100 through the active face. */
  progress: number;
  eyebrow?: string;
  hint?: string;
  onNavigate: (i: number) => void;
}) {
  const touchX = useRef<number | null>(null);
  const slide = slides[index] ?? slides[0];
  const title = slide?.title ?? "";
  const lead = title.slice(0, 1);
  const rest = title.slice(1);
  const n = slides.length;

  return (
    <div
      className="ff"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 50) return;
        onNavigate(Math.max(0, Math.min(n - 1, index + (dx < 0 ? 1 : -1))));
      }}
    >
      {/* Photographs */}
      <div className="ff-photos" aria-hidden="true">
        {slides.map((s, i) => (
          <img
            key={`${s.imageUrl}-${i}`}
            {...responsive(s.imageUrl, "100vw", [828, 1200, 1920])}
            alt=""
            className={`fq-img ff-photo${i === index ? " is-active" : ""}`}
            loading={i < 2 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
          />
        ))}
      </div>
      <div className="ff-shade" aria-hidden="true" />
      <div className="ff-grid" aria-hidden="true" />

      {/* Top bar */}
      <div className="ff-top">
        <span className="ff-eyebrow">
          <i aria-hidden="true" />
          {eyebrow}
        </span>
        {hint && <span className="ff-hint">{hint} ↓</span>}
      </div>

      {/* Words */}
      <div className="ff-copy" aria-live="polite">
        <div className="ff-count">
          <span className="ff-count-line" style={{ background: slide?.accent }} />
          {pad2(index + 1)} <i>/ {pad2(n)}</i>
        </div>
        {/* Every face begins with F, so the big outlined F stays put and only
            the rest of the word changes beside it. */}
        <h2 className="ff-title" aria-label={title}>
          <span className="ff-lead" aria-hidden="true">
            {lead}
          </span>
          <span className="ff-rest-clip" aria-hidden="true">
            <span key={`t-${index}`} className="ff-rest">
              {rest}
            </span>
          </span>
        </h2>
        <p key={`s-${index}`} className="ff-sub">
          {slide?.subtitle}
        </p>
        {slide?.description && (
          <p key={`d-${index}`} className="ff-desc">
            {slide.description}
          </p>
        )}
      </div>

      {/* Index (desktop) */}
      <ol className="ff-index">
        {slides.map((s, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onNavigate(i)}
              aria-current={i === index ? "step" : undefined}
              className={i === index ? "is-active" : i < index ? "is-done" : undefined}
            >
              <span className="ff-index-num">{pad2(i + 1)}</span>
              <span className="ff-index-name">{s.title}</span>
              <span className="ff-index-bar" aria-hidden="true">
                <span
                  style={{
                    transform: `scaleX(${i < index ? 1 : i === index ? progress / 100 : 0})`,
                  }}
                />
              </span>
            </button>
          </li>
        ))}
      </ol>

      {/* Segments (phones) */}
      <div className="ff-segs">
        {slides.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onNavigate(i)}
            aria-label={`Go to ${s.title}`}
            aria-current={i === index ? "step" : undefined}
          >
            <span>
              <span
                style={{
                  transform: `scaleX(${i < index ? 1 : i === index ? progress / 100 : 0})`,
                }}
              />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
