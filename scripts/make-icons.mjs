/**
 * Builds every icon the site ships from the F.QUAD mark in public/fquad-icon.svg:
 *
 *   app/icon.svg                the browser-tab icon (Chrome, Firefox, Edge)
 *   app/favicon.ico             16, 32 and 48 px frames (Safari and older browsers)
 *   app/apple-icon.png          180 px, full bleed (iOS home screen)
 *   public/icon-192.png         web-app manifest, purpose "any"
 *   public/icon-512.png         web-app manifest, purpose "any"; also the logo in the site's JSON-LD
 *   public/icon-maskable-512.png  web-app manifest, purpose "maskable" (the mark kept inside the safe zone)
 *
 * The mark is a square with the F and the 4 cut out of it. Used as it was drawn,
 * the cut-outs are transparent, so on a dark browser tab the lines fill with the
 * tab's own colour and the icon all but disappears; and at 16 px the lines are
 * about half a pixel wide. Here the tile is painted white and the lines are
 * drawn in ink, thickened a little, so the icon is bright and legible on a light
 * or a dark tab at any size.
 *
 *   node scripts/make-icons.mjs        (npm run icons)
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PAPER = "#ffffff"; // the tile
const INK = "#111111"; // the mark, and the thin rim that keeps a white tile visible on a light tab
const STROKE = 14; // how much the lines are thickened, in the mark's own units (it is 204 wide)
const RADIUS = 34; // corner radius of the tile, in the same units

const source = await readFile(path.join(ROOT, "public", "fquad-icon.svg"), "utf8");
const d = source.match(/<path d="([^"]+)"/)?.[1];
const box = source.match(/viewBox="([\d.\s-]+)"/)?.[1].trim().split(/\s+/).map(Number);
if (!d || !box || box.length !== 4) throw new Error("public/fquad-icon.svg: could not read the mark");
const [bx, by, bw, bh] = box;

/** The icon as SVG. `rx` rounds the tile; 0 gives a full-bleed square. */
const svg = (rx) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bx} ${by} ${bw} ${bh}">
  <defs><clipPath id="t"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${rx}"/></clipPath></defs>
  <g clip-path="url(#t)">
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${INK}"/>
    <path d="${d}" fill="${PAPER}" stroke="${INK}" stroke-width="${STROKE}" stroke-linejoin="round"/>
  </g>
</svg>
`;

/** A PNG of the icon at `size` px, drawn large and scaled down so small sizes stay crisp. */
const png = (rx, size) =>
  sharp(Buffer.from(svg(rx)), { density: Math.ceil((72 * size * 4) / bw) })
    .resize(size, size)
    .png()
    .toBuffer();

/** An .ico holding PNG frames (supported by every browser that reads .ico). */
function ico(frames) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(frames.length, 4);
  let offset = 6 + 16 * frames.length;
  const entries = frames.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e[0] = e[1] = size >= 256 ? 0 : size;
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([head, ...entries, ...frames.map((f) => f.data)]);
}

const out = (file, data) => writeFile(path.join(ROOT, file), data).then(() => console.log("wrote", file, `${Math.round(data.length / 1024 * 10) / 10} KB`));

await out("app/icon.svg", svg(RADIUS));
await out("app/favicon.ico", ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(RADIUS, size) })))));
// iOS rounds the corners itself and turns transparency black, so: full bleed, opaque.
await out("app/apple-icon.png", await sharp(await png(0, 180)).flatten({ background: PAPER }).png().toBuffer());
await out("public/icon-192.png", await png(RADIUS, 192));
await out("public/icon-512.png", await png(RADIUS, 512));
// Maskable: the platform crops to a circle, so the tile is drawn at 56% on a solid ink
// ground — its corners then stay inside the circle's safe zone.
const inner = Math.round(512 * 0.56);
await out(
  "public/icon-maskable-512.png",
  await sharp({ create: { width: 512, height: 512, channels: 3, background: INK } })
    .composite([{ input: await png(RADIUS, inner), gravity: "center" }])
    .flatten({ background: INK })
    .png()
    .toBuffer()
);
