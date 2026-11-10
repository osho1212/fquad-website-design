"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { RoomSceneProps } from "./RoomSceneImpl";

const loadImpl = () => import("./RoomSceneImpl");

// three.js is large and only needed once a scene is about to be seen, so the
// scene module loads on demand and never reaches the server bundle.
const Impl = dynamic(loadImpl, { ssr: false, loading: () => null });

const POSITIONED = /\b(absolute|fixed|relative|sticky)\b/;

/**
 * Fetch the 3D module (and paint its textures) while the visitor is still
 * reading the hero, instead of only when a scene scrolls near. Waits for the
 * page's own load and an idle moment so it never competes with the hero film.
 */
let prefetchQueued = false;
function prefetchWhenIdle() {
  if (prefetchQueued || typeof window === "undefined") return;
  prefetchQueued = true;
  const run = () => {
    const idle =
      (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
        .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    idle(
      () => {
        loadImpl()
          .then((m) => idle(() => m.warm(), { timeout: 3000 }))
          .catch(() => {
            prefetchQueued = false;
          });
      },
      { timeout: 4000 }
    );
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}

/**
 * Lazy wrapper: reserves the box immediately (so layout doesn't shift), shows
 * a drafting-style placeholder, mounts WebGL well before the box is on
 * screen, and fades the model in once its first frame is drawn.
 */
export function RoomScene(props: RoomSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const { onReady } = props;

  useEffect(() => {
    prefetchWhenIdle();
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      // A screen and a half ahead: building and compiling happen before the
      // visitor arrives rather than while they watch.
      { rootMargin: "150% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleReady = useCallback(() => {
    setReady(true);
    onReady?.();
  }, [onReady]);

  // Callers that already position the box ("absolute inset-0") keep that;
  // otherwise it becomes the positioned parent the canvas fills.
  const cls = props.className ?? "";
  return (
    <div ref={ref} className={POSITIONED.test(cls) ? cls : `relative ${cls}`}>
      <div
        aria-hidden="true"
        className={`fq-scene-placeholder absolute inset-0 transition-opacity duration-700 ${
          ready ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <svg viewBox="0 0 120 90" className="fq-scene-placeholder__art">
          {/* An isometric room in hairline — the model's outline before it arrives. */}
          <path d="M60 12 L104 34 L60 56 L16 34 Z" />
          <path d="M16 34 L16 64 L60 86 L60 56" />
          <path d="M104 34 L104 64 L60 86" />
          <path d="M38 23 L38 53 M82 23 L82 53" className="fq-scene-placeholder__dash" />
        </svg>
        <span className="fq-scene-placeholder__label">Preparing model</span>
      </div>
      {near && (
        <Impl
          {...props}
          onReady={handleReady}
          className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
