import React from "react";

/**
 * Line-art for the parallax layers: the furniture, lighting and drafting
 * marks of an interior-design studio. Every motif is drawn in `currentColor`
 * at ~1px, so it follows the surrounding ink colour (theme ink by default,
 * the hero's own ink over its video) and the caller sets weight with opacity.
 *
 * Paths marked `data-draw` carry pathLength=1 so ParallaxField can draw them
 * on with a single stroke-dashoffset value, whatever their real length.
 */

export type ArtName =
  | "plan"
  | "armchair"
  | "sofa"
  | "pendant"
  | "floorlamp"
  | "plant"
  | "mirror"
  | "chair"
  | "vase"
  | "compass"
  | "dimension"
  | "cross"
  | "hatch";

/** viewBox size of each motif — items scale from this. */
export const ART_SIZE: Record<ArtName, [number, number]> = {
  plan: [360, 270],
  armchair: [200, 200],
  sofa: [320, 140],
  pendant: [90, 230],
  floorlamp: [120, 270],
  plant: [140, 250],
  mirror: [150, 240],
  chair: [120, 210],
  vase: [90, 170],
  compass: [150, 150],
  dimension: [240, 44],
  cross: [44, 44],
  hatch: [150, 150],
};

const label: React.CSSProperties = {
  fontFamily: "var(--font-good-times), sans-serif",
  letterSpacing: "0.18em",
  fill: "currentColor",
  stroke: "none",
};

// Shorthand: a stroke that can be drawn on.
const D = { "data-draw": "", pathLength: 1 } as const;

/** Furnished room plan: bed, sofa, dining table, rug — drawn like a layout sheet. */
function Plan() {
  return (
    <svg viewBox="0 0 360 270" fill="none" stroke="currentColor" strokeWidth={1}>
      <path {...D} d="M20 20H340V220H20Z" />
      <path {...D} d="M26 26H334V214H26Z" />
      <path {...D} d="M190 26V130M194 26V130" />
      <path {...D} d="M26 130H190M26 134H190" />
      <path {...D} d="M190 60A30 30 0 0 1 220 30" />
      <path {...D} d="M150 134A26 26 0 0 0 124 160" />
      <path d="M80 20H150M80 23H150M80 26H150" />
      <path d="M340 90V150M337 90V150M334 90V150" />
      {/* bed with pillows */}
      <rect x="214" y="150" width="96" height="56" />
      <rect x="220" y="156" width="38" height="14" />
      <rect x="264" y="156" width="38" height="14" />
      <path d="M214 184H310" opacity={0.6} />
      {/* sofa + rug + coffee table */}
      <rect x="44" y="42" width="84" height="30" />
      <rect x="44" y="42" width="84" height="9" />
      <rect x="40" y="78" width="96" height="44" strokeDasharray="3 3" opacity={0.7} />
      <circle cx="88" cy="100" r="11" />
      {/* round dining table + chairs */}
      <circle cx="262" cy="74" r="20" />
      <circle cx="262" cy="42" r="6" />
      <circle cx="294" cy="74" r="6" />
      <circle cx="262" cy="106" r="6" />
      <circle cx="230" cy="74" r="6" />
      {/* dimension chain */}
      <path d="M20 244H340M20 238V250M340 238V250M190 238V250" />
      <path d="M14 20V220M8 20H20M8 220H20" />
      <text x="105" y="262" fontSize="8" style={label}>
        4800
      </text>
      <text x="255" y="262" fontSize="8" style={label}>
        4800
      </text>
      <text x="212" y="145" fontSize="7" style={label}>
        BED 01
      </text>
      <text x="56" y="92" fontSize="7" style={label}>
        LIVING
      </text>
    </svg>
  );
}

function Armchair() {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={1}>
      {/* back, with a soft top */}
      <path {...D} d="M48 118V62Q48 38 74 38H126Q152 38 152 62V118" />
      <path d="M62 112V66Q62 52 78 52H122Q138 52 138 66V112" opacity={0.55} />
      <path d="M100 52V112" opacity={0.35} />
      {/* arms */}
      <path {...D} d="M24 140V92Q24 78 38 78Q52 78 52 92V122" />
      <path {...D} d="M176 140V92Q176 78 162 78Q148 78 148 92V122" />
      {/* seat cushion + base */}
      <path {...D} d="M46 122H154Q160 122 160 128V138H40V128Q40 122 46 122Z" />
      <path {...D} d="M24 140H176V156H24Z" />
      {/* tapered legs */}
      <path {...D} d="M34 156L28 184M166 156L172 184" />
      <path d="M0 184H200" opacity={0.6} />
      <path d="M72 122Q100 130 128 122" opacity={0.45} />
    </svg>
  );
}

function Sofa() {
  return (
    <svg viewBox="0 0 320 140" fill="none" stroke="currentColor" strokeWidth={1}>
      <path {...D} d="M36 70V38Q36 22 52 22H268Q284 22 284 38V70" />
      {/* back cushions */}
      <path d="M52 66V40Q52 32 60 32H100Q108 32 108 40V66" opacity={0.6} />
      <path d="M116 66V40Q116 32 124 32H196Q204 32 204 40V66" opacity={0.6} />
      <path d="M212 66V40Q212 32 220 32H260Q268 32 268 40V66" opacity={0.6} />
      {/* arms */}
      <path {...D} d="M10 112V68Q10 56 22 56Q34 56 34 68V96" />
      <path {...D} d="M310 112V68Q310 56 298 56Q286 56 286 68V96" />
      {/* seat */}
      <path {...D} d="M34 96H286V112H34Z" />
      <path {...D} d="M40 82Q40 70 52 70H268Q280 70 280 82V96H40Z" />
      <path d="M126 70V96M194 70V96" opacity={0.5} />
      {/* legs */}
      <path {...D} d="M30 112L26 128M290 112L294 128" />
      <path d="M0 128H320" opacity={0.6} />
    </svg>
  );
}

function Pendant() {
  return (
    <svg viewBox="0 0 90 230" fill="none" stroke="currentColor" strokeWidth={1}>
      <path {...D} d="M45 0V92" />
      <path {...D} d="M38 92H52V104H38Z" />
      <path {...D} d="M6 168C6 128 26 104 45 104C64 104 84 128 84 168Z" />
      <path d="M14 160C16 132 30 114 45 112" opacity={0.45} />
      <circle {...D} cx="45" cy="180" r="9" />
      {/* a little light thrown below */}
      <path d="M22 196L10 226M45 202V230M68 196L80 226" strokeDasharray="2 5" opacity={0.7} />
    </svg>
  );
}

function FloorLamp() {
  return (
    <svg viewBox="0 0 120 270" fill="none" stroke="currentColor" strokeWidth={1}>
      <ellipse {...D} cx="34" cy="258" rx="26" ry="5" />
      <path {...D} d="M34 253V92Q34 20 84 20" />
      <path {...D} d="M52 20H116L108 52H60Z" />
      <path d="M60 52Q84 62 108 52" opacity={0.6} />
      <path d="M84 20V10" />
    </svg>
  );
}

function Plant() {
  // One leaf outline, placed around a few stems.
  const leaf = "M0 0C14 -14 14 -44 0 -64C-14 -44 -14 -14 0 0Z";
  const stems: [number, number, number][] = [
    [70, 160, -34],
    [70, 160, -12],
    [70, 160, 14],
    [70, 160, 36],
    [70, 160, 0],
  ];
  return (
    <svg viewBox="0 0 140 250" fill="none" stroke="currentColor" strokeWidth={1}>
      {stems.map(([x, y, a], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d="M0 0V-34" />
          <g transform="translate(0 -34)">
            <path {...D} d={leaf} />
            <path d="M0 0V-58" opacity={0.5} />
          </g>
        </g>
      ))}
      <path {...D} d="M38 160H102L94 236H46Z" />
      <path d="M38 172H102" opacity={0.6} />
      <path d="M0 240H140" opacity={0.5} />
    </svg>
  );
}

function Mirror() {
  return (
    <svg viewBox="0 0 150 240" fill="none" stroke="currentColor" strokeWidth={1}>
      <path {...D} d="M20 226V84A55 55 0 0 1 130 84V226Z" />
      <path {...D} d="M30 216V86A45 45 0 0 1 120 86V216Z" />
      {/* a few reflection strokes */}
      <path d="M48 120L96 72M48 160L112 96M52 200L116 136" opacity={0.4} />
      <path d="M75 6V24M62 14H88" />
      <path d="M8 232H142" opacity={0.6} />
    </svg>
  );
}

function Chair() {
  return (
    <svg viewBox="0 0 120 210" fill="none" stroke="currentColor" strokeWidth={1}>
      <path {...D} d="M28 100V20Q28 10 38 10H70Q80 10 80 20V100" />
      <path d="M34 22H74M34 36H74M34 50H74" opacity={0.45} />
      <path {...D} d="M20 100H96Q104 100 104 108V112H20Z" />
      <path {...D} d="M26 112L18 196M96 112L104 196" />
      <path {...D} d="M30 112L36 196M90 112L84 196" opacity={0.7} />
      <path d="M0 200H120" opacity={0.6} />
    </svg>
  );
}

function Vase() {
  return (
    <svg viewBox="0 0 90 170" fill="none" stroke="currentColor" strokeWidth={1}>
      <path {...D} d="M36 70C30 70 22 90 22 112C22 142 34 158 45 158C56 158 68 142 68 112C68 90 60 70 54 70Z" />
      <ellipse cx="45" cy="70" rx="9" ry="3" />
      <path d="M45 70C42 40 30 24 20 12M45 70C46 38 56 20 68 8M45 70C45 44 44 24 44 6" />
      <circle cx="20" cy="12" r="3" />
      <circle cx="68" cy="8" r="3" />
      <circle cx="44" cy="6" r="3" />
      <path d="M0 164H90" opacity={0.6} />
    </svg>
  );
}

function Compass() {
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg viewBox="0 0 150 150" fill="none" stroke="currentColor" strokeWidth={1}>
      <circle {...D} cx="75" cy="75" r="58" />
      <circle {...D} cx="75" cy="75" r="46" />
      {ticks.map((a) => (
        <line
          key={a}
          x1="75"
          y1="17"
          x2="75"
          y2={a % 90 === 0 ? 8 : a % 45 === 0 ? 11 : 13}
          transform={`rotate(${a} 75 75)`}
        />
      ))}
      <path {...D} d="M75 22L84 75L75 128L66 75Z" />
      <path {...D} d="M22 75L75 66L128 75L75 84Z" />
      <path d="M75 22L84 75H66Z" fill="currentColor" fillOpacity={0.35} />
      <text x="71" y="6" fontSize="9" style={label}>
        N
      </text>
    </svg>
  );
}

function Dimension() {
  return (
    <svg viewBox="0 0 240 44" fill="none" stroke="currentColor" strokeWidth={1}>
      <path {...D} d="M2 28H238" />
      <path {...D} d="M2 14V40M238 14V40" />
      <path d="M-2 32L6 24M234 32L242 24" />
      <text x="96" y="20" fontSize="9" style={label}>
        7200
      </text>
    </svg>
  );
}

function Cross() {
  return (
    <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth={1}>
      <circle {...D} cx="22" cy="22" r="9" />
      <path {...D} d="M22 0V44M0 22H44" />
      <circle cx="22" cy="22" r="1.5" fill="currentColor" />
    </svg>
  );
}

function Hatch() {
  const size = 150;
  const step = 10;
  const lines: string[] = [];
  for (let d = step; d < size * 2; d += step) {
    const x1 = Math.min(d, size);
    const y1 = d - x1;
    const y2 = Math.min(d, size);
    const x2 = d - y2;
    lines.push(`M${x1} ${y1}L${x2} ${y2}`);
  }
  return (
    <svg viewBox="0 0 150 150" fill="none" stroke="currentColor" strokeWidth={1}>
      <path {...D} d="M0 0H150V150H0Z" />
      <path d={lines.join("")} opacity={0.5} />
      <path d="M30 30H120V120H30Z" />
    </svg>
  );
}

const MOTIFS: Record<ArtName, () => React.ReactElement<any>> = {
  plan: Plan,
  armchair: Armchair,
  sofa: Sofa,
  pendant: Pendant,
  floorlamp: FloorLamp,
  plant: Plant,
  mirror: Mirror,
  chair: Chair,
  vase: Vase,
  compass: Compass,
  dimension: Dimension,
  cross: Cross,
  hatch: Hatch,
};

export function Art({ name }: { name: ArtName }) {
  const Motif = MOTIFS[name];
  return <Motif />;
}
