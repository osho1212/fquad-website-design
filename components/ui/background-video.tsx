"use client";

import React from "react";

export function BackgroundVideo() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-black">
      {/* Autoplaying Geometric Blueprint Architectural Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-45 pointer-events-none"
      >
        <source src="/assets/videos/studio-bg.mp4" type="video/mp4" />
      </video>

      {/* Lightened Background Overlay (15% Less Overlay Darkness) */}
      <div className="absolute inset-0 bg-black/55 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.78)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
    </div>
  );
}
