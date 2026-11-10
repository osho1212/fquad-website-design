/**
 * Builds two hand-drawn pencil layers for each project photo, used by
 * <SketchFrame /> to show a photo being drawn: a rough sketch that comes to
 * life. For every public/assets/images/*.jpg this writes, into
 * public/assets/images/sketch/:
 *
 *   <name>-rough.webp   the loose first sketch: major edges only, thinned to
 *                       single strokes, wobbled, and gone over two or three
 *                       times so the lines don't quite coincide, plus a few
 *                       faint ruled construction lines.
 *   <name>-pencil.webp  the finished drawing: fine edge lines plus hatched
 *                       shading whose density follows the photo's darkness
 *                       (hatch → cross-hatch → dense hatch).
 *
 * Both are graphite on white (the page multiplies them over the paper and,
 * later, over the photo), with paper-tooth grain breaking up every stroke.
 *
 *   node scripts/make-sketches.mjs                 # build anything missing
 *   node scripts/make-sketches.mjs --force         # rebuild everything
 *   node scripts/make-sketches.mjs --only=b21,a2   # just these (implies force)
 */
import sharp from "sharp";
import { readdir, stat, mkdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC_DIR = path.join(process.cwd(), "public", "assets", "images");
const OUT_DIR = path.join(SRC_DIR, "sketch");
const WIDTH = 1400;
const QUALITY = 74;
const INK = [0x2c, 0x2a, 0x27]; // graphite

// Rough sketch
const ROUGH_BLUR = 3.2; // px: drops small detail before edge detection
const ROUGH_LO = 7; // edge strength where a rough line starts to show
const ROUGH_HI = 22; // …and where it is at full pressure
const ROUGH_PASSES = [
  // amp/wave: wobble size and wavelength (px); ox/oy: offset; w: darkness
  { amp: 3.5, wave: 140, ox: 0, oy: 0, w: 0.85 },
  { amp: 5, wave: 95, ox: 1.6, oy: -1.1, w: 0.5 },
  { amp: 4, wave: 210, ox: -2.1, oy: 1.6, w: 0.34 },
];
const GUIDES = { rows: 2, cols: 3, minCover: 0.16, alpha: 0.16 };
const ROUGH_MIN_STROKE = 46; // px: shorter edge fragments are dropped as speckle

// Finished pencil drawing
const DODGE_BLUR = 9;
const EDGE_LO = 18;
const EDGE_HI = 70;
const EDGE_WEIGHT = 0.78;
const BLACK = 0.18;
const WHITE = 0.9;
const GAMMA = 1.25;
const HATCH = [
  // pct: hatch the darkest (1 - pct) share of the image; floor: never hatch
  // anything lighter than this darkness, however the image is exposed.
  { pct: 0.58, floor: 0.28, angle: 45, period: 9, alpha: 0.36, seed: 31 },
  { pct: 0.78, floor: 0.42, angle: -42, period: 10, alpha: 0.36, seed: 47 },
  { pct: 0.9, floor: 0.56, angle: 52, period: 6.5, alpha: 0.42, seed: 61 },
];

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const force = args.includes("--force") || Boolean(only);

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Deterministic lattice hash → [0, 1). */
const hash = (x, y, s) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
/** Smooth value noise in [0, 1). */
const noise = (x, y, s) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s);
  const b = hash(xi + 1, yi, s);
  const c = hash(xi, yi + 1, s);
  const d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

function sobel(src, w, h) {
  const mag = new Float32Array(w * h);
  const gxs = new Float32Array(w * h);
  const gys = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const ym = y > 0 ? y - 1 : y;
    const yp = y < h - 1 ? y + 1 : y;
    for (let x = 0; x < w; x++) {
      const xm = x > 0 ? x - 1 : x;
      const xp = x < w - 1 ? x + 1 : x;
      const a = src[ym * w + xm];
      const b = src[ym * w + x];
      const c = src[ym * w + xp];
      const d = src[y * w + xm];
      const f = src[y * w + xp];
      const g = src[yp * w + xm];
      const k = src[yp * w + x];
      const l = src[yp * w + xp];
      const gx = -a - 2 * d - g + c + 2 * f + l;
      const gy = -a - 2 * b - c + g + 2 * k + l;
      const i = y * w + x;
      gxs[i] = gx;
      gys[i] = gy;
      mag[i] = Math.hypot(gx, gy) / 4;
    }
  }
  return { mag, gx: gxs, gy: gys };
}

/** Bilinear sample of a w×h Float32Array. */
const sample = (arr, w, h, x, y) => {
  if (x < 0) x = 0;
  else if (x > w - 1.001) x = w - 1.001;
  if (y < 0) y = 0;
  else if (y > h - 1.001) y = h - 1.001;
  const xi = x | 0;
  const yi = y | 0;
  const xf = x - xi;
  const yf = y - yi;
  const i = yi * w + xi;
  return (
    arr[i] * (1 - xf) * (1 - yf) +
    arr[i + 1] * xf * (1 - yf) +
    arr[i + w] * (1 - xf) * yf +
    arr[i + w + 1] * xf * yf
  );
};

/** Strongest, well-separated peaks of a 1-D score. */
function peaks(score, count, minGap, minScore) {
  const order = Array.from(score.keys()).sort((a, b) => score[b] - score[a]);
  const out = [];
  for (const i of order) {
    if (score[i] < minScore || out.length >= count) break;
    if (out.every((p) => Math.abs(p - i) >= minGap)) out.push(i);
  }
  return out;
}

/**
 * One hatching stroke field. The strokes bend gently across the sheet (so no
 * two patches are at quite the same angle), waver, vary in pressure, and are
 * broken into short tapered marks rather than ruled lines.
 */
function hatchAt(x, y, cos, sin, period, seed) {
  const u = x * cos + y * sin; // across the strokes
  const v = -x * sin + y * cos; // along them
  const bend = (noise(x / 260, y / 260, seed + 5) - 0.5) * 6;
  const p = u / period + bend + (noise(v / 85, u / 420, seed) - 0.5) * 0.9;
  const idx = Math.floor(p);
  const dist = Math.abs(p - idx - 0.5); // 0 at the stroke's centre line
  const mark = noise(v / 58, idx * 5.3 + 11, seed + 2); // where the pencil is down
  const taper = smoothstep(0.3, 0.62, mark); // thin at each end of a mark
  const half = 0.15 * (0.5 + 0.9 * noise(v / 50, idx * 3.17, seed + 1)) * (0.45 + 0.55 * taper);
  return (1 - smoothstep(half * 0.5, half, dist)) * smoothstep(0.3, 0.4, mark);
}

/** Zeroes 8-connected groups of set pixels smaller than `min`. */
function dropSmall(img, w, h, min) {
  const seen = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  for (let start = 0; start < img.length; start++) {
    if (!img[start] || seen[start]) continue;
    let top = 0;
    let count = 0;
    stack[top++] = start;
    seen[start] = 1;
    const members = [];
    while (top) {
      const i = stack[--top];
      members.push(i);
      count++;
      const x = i % w;
      const y = (i - x) / w;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const j = ny * w + nx;
          if (img[j] && !seen[j]) {
            seen[j] = 1;
            stack[top++] = j;
          }
        }
      }
    }
    if (count < min) for (const i of members) img[i] = 0;
  }
}

async function writeLayer(alpha, w, h, out) {
  const rgb = Buffer.alloc(w * h * 3);
  for (let i = 0, o = 0; i < alpha.length; i++, o += 3) {
    const a = alpha[i];
    rgb[o] = 255 - a * (255 - INK[0]);
    rgb[o + 1] = 255 - a * (255 - INK[1]);
    rgb[o + 2] = 255 - a * (255 - INK[2]);
  }
  await sharp(rgb, { raw: { width: w, height: h, channels: 3 } }).webp({ quality: QUALITY }).toFile(out);
  return (await stat(out)).size;
}

async function sketchOne(file) {
  const name = path.parse(file).name;
  const src = path.join(SRC_DIR, file);
  const roughOut = path.join(OUT_DIR, `${name}-rough.webp`);
  const pencilOut = path.join(OUT_DIR, `${name}-pencil.webp`);
  if (!force && existsSync(roughOut) && existsSync(pencilOut)) return { file, skipped: true };

  const { data: g, info } = await sharp(src)
    .resize({ width: WIDTH, withoutEnlargement: true })
    .toColourspace("b-w")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const raw = { raw: { width: w, height: h, channels: 1 } };
  const grey = (img) => img.toColourspace("b-w").raw().toBuffer();

  const [blurInv, soft, softer] = await Promise.all([
    grey(sharp(g, raw).negate().blur(DODGE_BLUR)),
    grey(sharp(g, raw).blur(1.2)),
    grey(sharp(g, raw).blur(ROUGH_BLUR)),
  ]);

  // ── Rough sketch ──────────────────────────────────────────────────────
  // Major edges, thinned to single strokes (non-maximum suppression).
  const major = sobel(softer, w, h);
  const thin = new Uint8Array(w * h);
  const rowScore = new Float64Array(h);
  const colScore = new Float64Array(w);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const m = major.mag[i];
      if (m < ROUGH_LO) continue;
      const ax = Math.abs(major.gx[i]);
      const ay = Math.abs(major.gy[i]);
      let dx = 1;
      let dy = 0;
      if (ay > 2.414 * ax) {
        dx = 0;
        dy = 1;
      } else if (ax <= 2.414 * ay) {
        dy = major.gx[i] * major.gy[i] > 0 ? 1 : -1;
      }
      if (m < major.mag[i + dx + dy * w] || m < major.mag[i - dx - dy * w]) continue;
      const s = smoothstep(ROUGH_LO, ROUGH_HI, m);
      thin[i] = 255 * s;
      if (ay > 2.414 * ax) rowScore[y] += s; // a horizontal line
      else if (ax > 2.414 * ay) colScore[x] += s; // a vertical line
    }
  }
  dropSmall(thin, w, h, ROUGH_MIN_STROKE);
  const thinSoft = await grey(sharp(thin, raw).blur(0.85));
  const roughMap = new Float32Array(w * h);
  for (let i = 0; i < roughMap.length; i++) roughMap[i] = Math.min(1, (thinSoft[i] / 255) * 2.3);

  // Ruled construction lines through the strongest horizontals and verticals.
  const sum3 = (s) => s.map((v, i) => v + (s[i - 1] ?? 0) + (s[i + 1] ?? 0));
  const guideRows = peaks(sum3(rowScore), GUIDES.rows, h * 0.07, w * GUIDES.minCover);
  const guideCols = peaks(sum3(colScore), GUIDES.cols, w * 0.05, h * GUIDES.minCover);
  const guide = new Float32Array(w * h);
  const stamp = (x, y, a) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (a > guide[i]) guide[i] = a;
  };
  guideRows.forEach((y0, n) => {
    for (let x = 0; x < w; x++) {
      const yy = y0 + (noise(x / 260, n, 91) - 0.5) * 5;
      const fade = smoothstep(0.25, 0.6, noise(x / 190, n, 92));
      for (let d = -2; d <= 2; d++) {
        const y = Math.round(yy) + d;
        stamp(x, y, GUIDES.alpha * fade * (1 - smoothstep(0.5, 1.7, Math.abs(y - yy))));
      }
    }
  });
  guideCols.forEach((x0, n) => {
    for (let y = 0; y < h; y++) {
      const xx = x0 + (noise(y / 260, n, 93) - 0.5) * 5;
      const fade = smoothstep(0.25, 0.6, noise(y / 190, n, 94));
      for (let d = -2; d <= 2; d++) {
        const x = Math.round(xx) + d;
        stamp(x, y, GUIDES.alpha * fade * (1 - smoothstep(0.5, 1.7, Math.abs(x - xx))));
      }
    }
  });

  // ── Finished drawing: fine lines (colour dodge + Sobel) ───────────────
  const fine = sobel(soft, w, h);
  const fineMap = new Float32Array(w * h);
  const dark = new Float32Array(w * h); // smoothed darkness, for hatching
  const hist = new Uint32Array(256);
  for (let i = 0; i < fineMap.length; i++) {
    const dodge = Math.min(255, (g[i] * 255) / Math.max(1, 255 - blurInv[i]));
    const edge = smoothstep(EDGE_LO, EDGE_HI, fine.mag[i]);
    let v = (dodge / 255) * (1 - EDGE_WEIGHT * edge);
    v = clamp01((v - BLACK) / (WHITE - BLACK));
    fineMap[i] = 1 - Math.pow(v, 1 / GAMMA);
    dark[i] = 1 - softer[i] / 255;
    hist[255 - softer[i]]++;
  }
  // Hatching thresholds from this image's own tonal spread.
  const percentile = (p) => {
    let acc = 0;
    const target = p * dark.length;
    for (let d = 0; d < 256; d++) {
      acc += hist[d];
      if (acc >= target) return d / 255;
    }
    return 1;
  };
  const hatch = HATCH.map((k) => {
    const a = (k.angle * Math.PI) / 180;
    return { ...k, cos: Math.cos(a), sin: Math.sin(a), at: Math.max(k.floor, percentile(k.pct)) };
  });

  // ── Compose both layers ───────────────────────────────────────────────
  const roughAlpha = new Float32Array(w * h);
  const pencilAlpha = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const tooth = noise(x / 1.6, y / 1.6, 7); // paper grain
      const pressure = 0.8 + 0.2 * noise(x / 55, y / 55, 8);

      // rough: the same lines, gone over with different wobble each time
      let keep = 1;
      for (let k = 0; k < ROUGH_PASSES.length; k++) {
        const p = ROUGH_PASSES[k];
        const dx = (noise(x / p.wave, y / p.wave, 11 + k * 2) - 0.5) * 2 * p.amp + p.ox;
        const dy = (noise(x / p.wave, y / p.wave, 12 + k * 2) - 0.5) * 2 * p.amp + p.oy;
        keep *= 1 - p.w * sample(roughMap, w, h, x + dx, y + dy);
      }
      keep *= 1 - guide[i];
      roughAlpha[i] = clamp01((1 - keep) * (0.6 + 0.4 * tooth) * pressure);

      // pencil: fine lines with a slight waver…
      const wx = (noise(x / 80, y / 80, 21) - 0.5) * 2.6;
      const wy = (noise(x / 80, y / 80, 22) - 0.5) * 2.6;
      let pk = 1 - sample(fineMap, w, h, x + wx, y + wy);
      // …plus hatching where the photo is dark
      const d = dark[i] + (noise(x / 170, y / 170, 23) - 0.5) * 0.1;
      for (const k of hatch) {
        const level = smoothstep(k.at - 0.04, k.at + 0.05, d);
        if (level > 0) pk *= 1 - k.alpha * level * hatchAt(x, y, k.cos, k.sin, k.period, k.seed);
      }
      pencilAlpha[i] = clamp01((1 - pk) * (0.7 + 0.3 * tooth));
    }
  }

  const roughSize = await writeLayer(roughAlpha, w, h, roughOut);
  const pencilSize = await writeLayer(pencilAlpha, w, h, pencilOut);

  // The first version of this script wrote a single <name>.webp.
  const legacy = path.join(OUT_DIR, `${name}.webp`);
  if (existsSync(legacy)) await unlink(legacy);

  return { file, size: `${w}x${h}`, roughSize, pencilSize };
}

const main = async () => {
  if (!existsSync(SRC_DIR)) throw new Error(`missing ${SRC_DIR}`);
  await mkdir(OUT_DIR, { recursive: true });
  const files = (await readdir(SRC_DIR))
    .filter((f) => /\.jpe?g$/i.test(f))
    .filter((f) => !only || only.includes(path.parse(f).name))
    .sort();
  if (!files.length) throw new Error("no project photos found");
  for (const file of files) {
    const r = await sketchOne(file);
    console.log(
      r.skipped
        ? `skip  ${file}`
        : `wrote ${file}  ${r.size}  rough ${(r.roughSize / 1024).toFixed(0)} KB  pencil ${(r.pencilSize / 1024).toFixed(0)} KB`
    );
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
