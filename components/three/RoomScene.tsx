"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { RoomSceneProps } from "./RoomSceneImpl";

// three.js is large and only needed once a scene is about to be seen, so the
// scene module loads on demand and never reaches the server bundle.
const Impl = dynamic(() => import("./RoomSceneImpl"), {
  ssr: false,
  loading: () => null,
});

const POSITIONED = /\b(absolute|fixed|relative|sticky)\b/;

/**
 * Lazy wrapper: reserves the box immediately (so layout doesn't shift) and
 * only mounts WebGL when the box is within a screen of the viewport.
 */
export function RoomScene(props: RoomSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Callers that already position the box ("absolute inset-0") keep that;
  // otherwise it becomes the positioned parent the canvas fills.
  const cls = props.className ?? "";
  return (
    <div ref={ref} className={POSITIONED.test(cls) ? cls : `relative ${cls}`}>
      {near && <Impl {...props} className="absolute inset-0" />}
    </div>
  );
}
