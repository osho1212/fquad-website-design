"use client";

import React, { useEffect, useState } from "react";

/**
 * The looping blueprint film behind every page. It plays only when the
 * visitor has not asked for reduced motion or data saving (WCAG 2.2.2: moving
 * content that starts automatically must be stoppable, and the simplest stop
 * is not starting it). Everyone else gets the same dark backdrop without it.
 */
export function BackgroundVideo() {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const update = () => setPlay(!query.matches && !saveData);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div className="fq-bg-video-shell fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-black">
      {play && (
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="fq-bg-video-media w-full h-full object-cover opacity-45 pointer-events-none"
        >
          <source src="/assets/videos/studio-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* Lightened Background Overlay (15% Less Overlay Darkness) */}
      <div className="fq-bg-video-overlay absolute inset-0 bg-black/55 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.78)_100%)]" />
      <div className="fq-bg-video-fade absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
    </div>
  );
}
