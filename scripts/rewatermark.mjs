// scripts/rewatermark.mjs
// Rebuilds the sizes of photos that are already on the site, so a watermark
// changed in Admin -> Settings reaches pictures uploaded before the change.
//
// The mark is painted into each file at upload time, so there is no way to
// lighten it in place: the sizes are made again from the untouched original
// that lib/media.ts keeps at originals/<mediaId>/original. A photo uploaded
// before originals were kept has nothing to rebuild from — it is reported and
// left exactly as it is.
//
//   npm run watermark:rebuild                 every photo that can be rebuilt
//   npm run watermark:rebuild -- --dry-run    just say what would change
//   npm run watermark:rebuild -- --id=<id>    one photo (repeatable)
//   npm run watermark:rebuild -- --force      rebuild even if it looks current
//
// Reads the same environment variables as the site (see .env.example).

import process from 'node:process';
import { connect } from './_firebase.mjs';
import { renderVariants } from '../lib/image-pipeline.mjs';
import { normaliseWatermark } from '../lib/watermark.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const onlyIds = args.filter((a) => a.startsWith('--id=')).map((a) => a.slice('--id='.length));

const CACHE = 'public, max-age=31536000, immutable';

const { db, bucket } = connect();

async function savedWatermark() {
  const snap = await db.collection('siteSettings').doc('default').get();
  const data = snap.exists ? snap.data() : {};
  return normaliseWatermark(data);
}

/** The untouched upload, or null when this photo was stored before originals were kept. */
async function readOriginal(mediaId) {
  const file = bucket.file(`originals/${mediaId}/original`);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [data] = await file.download();
  return data;
}

async function rebuild(doc, watermark) {
  const media = doc.data();
  const original = await readOriginal(doc.id);
  if (!original) return { id: doc.id, filename: media.filename, status: 'no-original' };

  // A backdrop (hero slide) carries no mark. A record that predates this flag
  // cannot say which it was, and guessing would stamp the mark across a hero
  // image, so it is left alone.
  if (typeof media.background !== 'boolean') {
    return { id: doc.id, filename: media.filename, status: 'unknown-kind' };
  }
  if (dryRun) return { id: doc.id, filename: media.filename, status: 'would-rebuild' };

  const rendered = await renderVariants(original, {
    watermark: denormalise(watermark),
    isBackground: media.background,
  });
  const variants = [];
  for (const file of rendered.files) {
    await bucket.file(`uploads/${doc.id}/${file.filename}`).save(file.data, {
      contentType: file.contentType,
      metadata: { cacheControl: CACHE },
    });
    variants.push({
      label: file.label,
      path: `/uploads/${doc.id}/${file.filename}`,
      width: file.width ?? null,
      height: file.height ?? null,
      format: file.format,
    });
  }

  await doc.ref.update({
    variants,
    width: rendered.width ?? null,
    height: rendered.height ?? null,
    watermark: media.background
      ? null
      : { opacity: watermark.opacity, scale: watermark.scale, rebuiltAt: new Date() },
  });

  return { id: doc.id, filename: media.filename, status: 'rebuilt' };
}

/** renderVariants takes the settings shape, not the normalised pair. */
function denormalise({ opacity, scale }) {
  return { watermarkOpacity: opacity, watermarkScale: scale };
}

/** True when this photo already carries the watermark that is set now. */
function isCurrent(media, watermark) {
  if (media.background === true) return true; // never marked, nothing to change
  const stamped = media.watermark;
  return Boolean(stamped && stamped.opacity === watermark.opacity && stamped.scale === watermark.scale);
}

const watermark = await savedWatermark();
console.log(
  `Watermark in use: strength ${(watermark.opacity * 100).toFixed(1)}%, ` +
    `size ${(watermark.scale * 100).toFixed(1)}% of each picture's width.`
);
if (dryRun) console.log('Dry run: nothing will be written.\n');

const snap = await db.collection('media').get();
let docs = snap.docs.filter((d) => (d.data().type || 'IMAGE') === 'IMAGE');
if (onlyIds.length) docs = docs.filter((d) => onlyIds.includes(d.id));

const counts = { rebuilt: 0, 'no-original': 0, 'would-rebuild': 0, 'unknown-kind': 0, current: 0, failed: 0 };
const missing = [];

for (const doc of docs) {
  if (!force && isCurrent(doc.data(), watermark)) {
    counts.current += 1;
    continue;
  }
  try {
    const result = await rebuild(doc, watermark);
    counts[result.status] += 1;
    if (result.status === 'no-original' || result.status === 'unknown-kind') missing.push(result);
    else console.log(`  ${result.status === 'rebuilt' ? '✓' : '·'} ${result.filename} (${result.id})`);
  } catch (err) {
    counts.failed += 1;
    console.error(`  ✗ ${doc.id}: ${err.message}`);
  }
}

console.log('\n' + '─'.repeat(60));
console.log(`photos checked     ${docs.length}`);
if (counts.current) console.log(`already current    ${counts.current}`);
if (counts['would-rebuild']) console.log(`would rebuild      ${counts['would-rebuild']}`);
if (counts.rebuilt) console.log(`rebuilt            ${counts.rebuilt}`);
if (counts.failed) console.log(`failed             ${counts.failed}`);
if (missing.length) {
  console.log(
    `left alone         ${missing.length}  (no original kept, or it is not recorded whether they are backdrops — re-upload to change their mark)`
  );
  for (const m of missing.slice(0, 20)) console.log(`     ${m.filename} (${m.id}) — ${m.status}`);
  if (missing.length > 20) console.log(`     …and ${missing.length - 20} more`);
}
process.exit(0);
