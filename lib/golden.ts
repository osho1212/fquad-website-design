/**
 * Golden-ratio geometry shared by the site backdrop and the intro loader.
 *
 * A golden rectangle (φ : 1) is cut into a square plus a smaller golden
 * rectangle, over and over, turning a quarter each time. A quarter arc drawn
 * in each square joins up into the golden spiral. Everything is computed once
 * at module load (it is plain numbers), so it renders on the server and costs
 * the browser nothing but a static SVG.
 */

export const PHI = (1 + Math.sqrt(5)) / 2;

export type GoldenSquare = { x: number; y: number; s: number };

export type GoldenSpiral = {
  width: number;
  height: number;
  /** One rect per cut, largest first. */
  squares: GoldenSquare[];
  /** The whole spiral as one path, starting at the outermost arc. */
  spiral: string;
  /** Where the spiral converges (its "eye"), in the same units. */
  eye: { x: number; y: number };
};

const r = (n: number) => Math.round(n * 100) / 100;

/**
 * Cuts a landscape golden rectangle `height` tall into `steps` squares,
 * spiralling clockwise: left, top, right, bottom, left…
 */
export function goldenSpiral(height: number, steps = 10): GoldenSpiral {
  let x = 0;
  let y = 0;
  let w = height * PHI;
  let h = height;
  const squares: GoldenSquare[] = [];
  let d = "";

  for (let i = 0; i < steps; i++) {
    const dir = i % 4;
    let s: number;
    let from: [number, number];
    let to: [number, number];
    if (dir === 0) {
      // Square off the left; arc bottom-left → top-right.
      s = h;
      squares.push({ x, y, s });
      from = [x, y + s];
      to = [x + s, y];
      x += s;
      w -= s;
    } else if (dir === 1) {
      // Square off the top; arc top-left → bottom-right.
      s = w;
      squares.push({ x, y, s });
      from = [x, y];
      to = [x + s, y + s];
      y += s;
      h -= s;
    } else if (dir === 2) {
      // Square off the right; arc top-right → bottom-left.
      s = h;
      squares.push({ x: x + w - s, y, s });
      from = [x + w, y];
      to = [x + w - s, y + s];
      w -= s;
    } else {
      // Square off the bottom; arc bottom-right → top-left.
      s = w;
      squares.push({ x, y: y + h - s, s });
      from = [x + s, y + h];
      to = [x, y + h - s];
      h -= s;
    }
    if (i === 0) d += `M${r(from[0])} ${r(from[1])}`;
    d += ` A${r(s)} ${r(s)} 0 0 1 ${r(to[0])} ${r(to[1])}`;
  }

  return {
    width: r(height * PHI),
    height,
    squares: squares.map((q) => ({ x: r(q.x), y: r(q.y), s: r(q.s) })),
    spiral: d,
    eye: { x: r(x + w / 2), y: r(y + h / 2) },
  };
}

/** The Fibonacci numbers that size the first squares (for typographic marks). */
export const FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89] as const;
