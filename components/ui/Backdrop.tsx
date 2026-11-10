import { FIBONACCI, goldenSpiral, type GoldenSpiral } from "@/lib/golden";

/**
 * Site-wide backdrop: a drafting sheet behind every page. It replaced a
 * full-screen 1080p video that decoded 30 frames a second on every page (and
 * kept going behind the opaque hero), which was the heaviest thing the site
 * asked of a phone.
 *
 * Everything here is static: a CSS grid, one inline SVG of the golden-ratio
 * construction (the same geometry as the intro loader), and drafting marks.
 * The only motion is a small protractor turning slowly on its own element,
 * so the compositor rotates it without repainting the sheet.
 *
 * A server component: no JavaScript ships for it.
 */

const LANDSCAPE = goldenSpiral(860, 11);
const PORTRAIT = goldenSpiral(560, 10);

function Construction({ g, labels = true }: { g: GoldenSpiral; labels?: boolean }) {
  return (
    <>
      <g className="fq-bd-squares">
        <rect x={0} y={0} width={g.width} height={g.height} />
        {g.squares.map((q, i) => (
          <rect key={i} x={q.x} y={q.y} width={q.s} height={q.s} />
        ))}
      </g>
      {/* Diagonals of the two largest golden rectangles cross at the eye. */}
      <g className="fq-bd-guides">
        <line x1={0} y1={g.height} x2={g.width} y2={0} />
        <line x1={g.squares[0].s} y1={0} x2={g.width} y2={g.height} />
        <circle cx={g.eye.x} cy={g.eye.y} r={g.height * 0.034} />
      </g>
      <path className="fq-bd-spiral" d={g.spiral} />
      <circle className="fq-bd-eye" cx={g.eye.x} cy={g.eye.y} r={3} />
      {labels &&
        g.squares.slice(0, 7).map((q, i) => (
          <text
            key={i}
            className="fq-bd-num"
            x={q.x + q.s - 10}
            y={q.y + 22}
            textAnchor="end"
            fontSize={Math.max(9, Math.min(15, q.s * 0.045))}
          >
            {FIBONACCI[FIBONACCI.length - 1 - i]}
          </text>
        ))}
    </>
  );
}

/** A dimension line with end ticks and a centred label. */
function Dimension({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label: string }) {
  const vertical = x1 === x2;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const t = 7;
  return (
    <g className="fq-bd-dim">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {vertical ? (
        <>
          <line x1={x1 - t} y1={y1} x2={x1 + t} y2={y1} />
          <line x1={x2 - t} y1={y2} x2={x2 + t} y2={y2} />
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 - t} x2={x1} y2={y1 + t} />
          <line x1={x2} y1={y2 - t} x2={x2} y2={y2 + t} />
        </>
      )}
      <text
        x={mx}
        y={my}
        dy={vertical ? 0 : -9}
        textAnchor="middle"
        transform={vertical ? `rotate(-90 ${mx} ${my}) translate(0 -9)` : undefined}
      >
        {label}
      </text>
    </g>
  );
}

function Cross({ x, y }: { x: number; y: number }) {
  return (
    <g className="fq-bd-cross">
      <line x1={x - 9} y1={y} x2={x + 9} y2={y} />
      <line x1={x} y1={y - 9} x2={x} y2={y + 9} />
    </g>
  );
}

/** Protractor ring: 72 ticks, every sixth one long. Rotated by CSS. */
function Protractor() {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const long = i % 6 === 0;
    const r1 = long ? 78 : 86;
    return (
      <line
        key={i}
        x1={100 + Math.cos(a) * r1}
        y1={100 + Math.sin(a) * r1}
        x2={100 + Math.cos(a) * 92}
        y2={100 + Math.sin(a) * 92}
      />
    );
  });
  return (
    <svg viewBox="0 0 200 200" className="fq-bd-protractor" aria-hidden="true">
      <circle cx={100} cy={100} r={92} />
      <circle cx={100} cy={100} r={60} className="fq-bd-faint" />
      <circle cx={100} cy={100} r={2} className="fq-bd-solid" />
      <g>{ticks}</g>
      <line x1={100} y1={8} x2={100} y2={192} className="fq-bd-faint" />
      <line x1={8} y1={100} x2={192} y2={100} className="fq-bd-faint" />
    </svg>
  );
}

export function Backdrop() {
  return (
    <div className="fq-backdrop" aria-hidden="true">
      <div className="fq-bd-glow" />
      <div className="fq-bd-grid" />

      {/* Wide screens: the construction sits to the right, off the edge. */}
      <svg
        className="fq-bd-sheet fq-bd-sheet--landscape"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform="translate(905 110)">
          <Construction g={LANDSCAPE} />
        </g>
        <Dimension x1={905} y1={1010} x2={905 + LANDSCAPE.squares[0].s} y2={1010} label="1.000" />
        <Dimension
          x1={905 + LANDSCAPE.squares[0].s}
          y1={1010}
          x2={905 + LANDSCAPE.width}
          y2={1010}
          label="0.618"
        />
        <Dimension x1={120} y1={180} x2={120} y2={900} label="φ = 1.6180339…" />
        <Cross x={120} y={110} />
        <Cross x={120} y={970} />
        <Cross x={640} y={110} />
        <text className="fq-bd-note" x={150} y={116}>
          SHEET 01 — PROPORTION STUDY
        </text>
        <text className="fq-bd-note" x={150} y={976}>
          17.3850° N · 78.4867° E
        </text>
      </svg>

      {/* Phones held upright: the construction settles low on the sheet. */}
      <svg
        className="fq-bd-sheet fq-bd-sheet--portrait"
        viewBox="0 0 1000 1800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform="translate(40 1080)">
          <Construction g={PORTRAIT} labels={false} />
        </g>
        <Dimension x1={70} y1={220} x2={70} y2={900} label="φ = 1.618" />
        <Cross x={70} y={150} />
        <Cross x={930} y={150} />
        <text className="fq-bd-note" x={100} y={156}>
          SHEET 01 — PROPORTION
        </text>
      </svg>

      <Protractor />
      <div className="fq-bd-vignette" />
    </div>
  );
}
