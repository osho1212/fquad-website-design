import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

// The default share card for every page that doesn't bring its own image.
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f3ee",
          color: "#151412",
          padding: 72,
          border: "1px solid #151412",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 6 }}>
          <span>HYDERABAD · INDIA</span>
          <span>EST. 2005</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 190, fontWeight: 800, letterSpacing: 14, lineHeight: 1 }}>F.QUAD</div>
          <div style={{ fontSize: 30, letterSpacing: 8, marginTop: 28, opacity: 0.75 }}>
            ARCHITECTURE &amp; INTERIOR DESIGN STUDIO
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 20, letterSpacing: 5, opacity: 0.6 }}>
          <span>FUNCTIONAL</span>
          <span>·</span>
          <span>FUTURISTIC</span>
          <span>·</span>
          <span>FRIENDLY</span>
          <span>·</span>
          <span>FLEXIBLE</span>
        </div>
      </div>
    ),
    size
  );
}
