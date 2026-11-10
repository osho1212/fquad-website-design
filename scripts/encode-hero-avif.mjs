/**
 * Re-encodes the hero film's WebP frames to AVIF alongside them.
 *
 * The frames are architectural linework, so chroma subsampling is forced to
 * 4:4:4 — 4:2:0 bleeds colour across the hard pencil edges. Quality 45 was
 * chosen by measuring SSIM against the existing WebP frames (0.979–0.989,
 * i.e. visually transparent) at ~44% of the bytes.
 *
 * The WebP frames are left in place as the fallback for browsers without
 * AVIF support; nothing here deletes them.
 *
 *   node scripts/encode-hero-avif.mjs            # encode anything missing
 *   node scripts/encode-hero-avif.mjs --force    # re-encode everything
 */
import sharp from "sharp";
import { readdir, stat, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "assets", "hero");
const QUALITY = 45;
const EFFORT = 6;
const force = process.argv.includes("--force");

const encodeOne = async (file) => {
  const src = path.join(DIR, file);
  const out = path.join(DIR, `${path.parse(file).name}.avif`);
  if (!force && existsSync(out)) return { file, skipped: true };
  await sharp(src)
    .avif({ quality: QUALITY, effort: EFFORT, chromaSubsampling: "4:4:4" })
    .toFile(out);
  const [a, b] = await Promise.all([stat(src), stat(out)]);
  return { file, from: a.size, to: b.size };
};

const main = async () => {
  if (!existsSync(DIR)) throw new Error(`missing ${DIR}`);
  const files = (await readdir(DIR)).filter((f) => /^[dm]-\d{3}\.webp$/.test(f)).sort();
  if (!files.length) throw new Error("no hero webp frames found");

  const workers = Math.max(1, Math.min(os.cpus().length, 8));
  let i = 0;
  let from = 0;
  let to = 0;
  let done = 0;
  let skipped = 0;

  await Promise.all(
    Array.from({ length: workers }, async () => {
      while (i < files.length) {
        const r = await encodeOne(files[i++]);
        if (r.skipped) { skipped++; continue; }
        from += r.from; to += r.to; done++;
        if (done % 40 === 0) process.stdout.write(`  ${done} encoded\n`);
      }
    })
  );

  const mb = (n) => (n / 1024 / 1024).toFixed(1);
  console.log(
    done
      ? `\nencoded ${done} frames (${skipped} already present)\n` +
        `  webp ${mb(from)} MB -> avif ${mb(to)} MB  (${(100 - (to / from) * 100).toFixed(0)}% smaller)`
      : `\nnothing to do (${skipped} frames already encoded)`
  );
};

main().catch((e) => { console.error(e); process.exit(1); });
