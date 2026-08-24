import React from "react";
import { getSocialLinks } from "@/lib/social";

interface SocialLinksProps {
  instagramUrl?: string | null;
  whatsapp?: string | null;
  className?: string;
}

/**
 * The studio's social icon row — Instagram, WhatsApp, LinkedIn, YouTube,
 * Facebook. Single source so every placement stays in step.
 */
export function SocialLinks({
  instagramUrl,
  whatsapp,
  className = "",
}: SocialLinksProps) {
  const links = getSocialLinks({ instagramUrl, whatsapp });

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`F.QUAD on ${link.label}`}
          title={link.label}
          className="w-7 h-7 border border-white/20 hover:border-white bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all duration-300 rounded-none group shrink-0"
        >
          <svg
            className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
            fill={link.variant === "fill" ? "currentColor" : "none"}
            stroke={link.variant === "stroke" ? "currentColor" : undefined}
            strokeWidth={link.variant === "stroke" ? 1.75 : undefined}
            strokeLinecap="square"
            strokeLinejoin="miter"
            aria-hidden="true"
          >
            {/* Instagram's outer frame is a plain square. */}
            {link.id === "instagram" && (
              <rect x="2" y="2" width="20" height="20" />
            )}
            <path d={link.path} />
            {link.extra?.line && (
              <line
                x1={link.extra.line[0]}
                y1={link.extra.line[1]}
                x2={link.extra.line[2]}
                y2={link.extra.line[3]}
                strokeWidth="2.5"
              />
            )}
          </svg>
        </a>
      ))}
    </div>
  );
}
