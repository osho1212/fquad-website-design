"use client";

import React, { useEffect, useRef, useState } from "react";
import { modernSources } from "@/lib/photo-sources";

/**
 * A photograph served as AVIF, then WebP, then the JPEG it is addressed by
 * (see lib/photo-sources.ts). If a smaller copy turns out to be missing, for
 * example an older upload that never got a WebP, the picture drops to the
 * JPEG alone instead of showing a broken image: a browser that picks a
 * <source> does not fall back to the next one when its file fails to load.
 */
export function ModernImage({
  src,
  alt,
  ...rest
}: Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & { src: string; alt: string }) {
  const [plain, setPlain] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const sources = plain ? [] : modernSources(src);

  // An image that failed before the page became interactive never reports it.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0 && modernSources(src).length > 0) setPlain(true);
  }, [src]);

  return (
    <picture>
      {sources.map((s) => (
        <source key={s.type} type={s.type} srcSet={s.srcSet} />
      ))}
      <img
        {...rest}
        ref={imgRef}
        src={src}
        alt={alt}
        onError={(e) => {
          if (sources.length > 0) setPlain(true);
          rest.onError?.(e);
        }}
      />
    </picture>
  );
}
