/**
 * Writes AVIF and WebP copies beside every shipped photograph in
 * public/assets/images. The site serves AVIF first, then WebP, then the JPEG
 * (see lib/photo-sources.ts), so every browser gets the smallest file it can
 * read. The JPEG stays as the fallback and master.
 *
 *   node scripts/encode-photo-formats.mjs            # build anything missing
 *   node scripts/encode-photo-formats.mjs --force    # rebuild everything
 *
 * Run it after adding a photo to public/assets/images. A JPEG with no copies
 * beside it still works — <picture> falls back to it — but it goes out at
 * full weight, and these are the largest files the site ships.
 */
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "assets", "images");
const FORCE = process.argv.includes("--force");
// Encoded from a JPEG that is already lossy. These settings keep the copy
// within ~36-41 dB PSNR of the JPEG (visually the same) while staying smaller;
// going higher makes the WebP as big as the JPEG.
const WEBP = { quality: 76, effort: 5 };
const AVIF = { quality: 55, effort: 4 };

const kb = (n) => `${Math.round(n / 1024)} KB`;
// Mirrors SHIPPED in lib/photo-sources.ts, so what is encoded here is exactly
// what the site knows how to ask for. Finder's " 2" duplicates have a space in
// the name and are skipped by the same token.
const names = (await readdir(DIR)).filter((f) => /^[a-z0-9-]+\.jpg$/.test(f)).sort();
let made = 0;

for (const file of names) {
  const base = file.replace(/\.jpg$/, "");
  const src = path.join(DIR, file);
  const out = { webp: path.join(DIR, `${base}.webp`), avif: path.join(DIR, `${base}.avif`) };
  if (!FORCE && existsSync(out.webp) && existsSync(out.avif)) continue;
  const jpg = (await stat(src)).size;
  const w = await sharp(src).webp(WEBP).toFile(out.webp);
  const a = await sharp(src).avif(AVIF).toFile(out.avif);
  made++;
  console.log(`${base.padEnd(22)} jpg ${kb(jpg).padStart(7)}   webp ${kb(w.size).padStart(7)}   avif ${kb(a.size).padStart(7)}`);
}
console.log(made ? `wrote ${made} photo(s)` : "nothing to do");
