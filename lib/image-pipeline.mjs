// lib/image-pipeline.mjs
// Turning one uploaded picture into the sizes the site serves.
//
// Plain JavaScript (not TypeScript) on purpose, like lib/watermark.mjs: this is
// used both by lib/media.ts at upload time and by scripts/rewatermark.mjs when
// the watermark changes, so a photo rebuilt later comes out of exactly the same
// pipeline as one uploaded today.
//
// This module only makes the files. Storing them and recording them is the
// caller's job — lib/media.ts writes to Cloud Storage, the script overwrites
// what is already there.

import sharp from 'sharp';
import { watermarkSvg } from './watermark.mjs';

/** The widths the site serves. A picture smaller than a size is left alone. */
export const IMAGE_SIZES = [
  { label: 'thumb', width: 400 },
  { label: 'medium', width: 1000 },
  { label: 'full', width: 1920 },
];

export const JPEG_QUALITY = 80;
export const WEBP_QUALITY = 80;

/**
 * Every file one picture becomes: thumb/medium/full JPEGs plus a WebP of the
 * full size, watermarked unless `isBackground` (hero slides, where a visible
 * mark would be distracting).
 *
 * `watermark` is the saved Admin -> Settings pair ({ watermarkOpacity,
 * watermarkScale }); null uses the defaults in lib/watermark.mjs.
 *
 * @param {Buffer} buffer
 * @param {{ watermark?: import('./watermark.mjs').WatermarkInput, isBackground?: boolean }} [options]
 */
export async function renderVariants(buffer, { watermark = null, isBackground = false } = {}) {
  const base = sharp(buffer).rotate(); // auto-orient based on EXIF
  const meta = await base.metadata();
  const origWidth = meta.width || 0;
  const origHeight = meta.height || 0;

  const files = [];

  for (const size of IMAGE_SIZES) {
    const targetWidth = origWidth ? Math.min(size.width, origWidth) : size.width;
    let resized = base.clone().resize({ width: targetWidth, withoutEnlargement: true });
    if (!isBackground) {
      // Sized against this variant's own width, so the mark reads
      // proportionally the same on a 400px thumb as on a 1920px full image.
      resized = resized.composite([{ input: watermarkSvg(targetWidth, watermark), gravity: 'center' }]);
    }

    const jpg = await resized.clone().jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    const jpgMeta = await sharp(jpg).metadata();
    files.push({
      label: size.label,
      filename: `${size.label}.jpg`,
      contentType: 'image/jpeg',
      format: 'jpg',
      data: jpg,
      width: jpgMeta.width,
      height: jpgMeta.height,
    });

    if (size.label === 'full') {
      const webp = await resized.clone().webp({ quality: WEBP_QUALITY }).toBuffer();
      const webpMeta = await sharp(webp).metadata();
      files.push({
        label: 'webp',
        filename: 'full.webp',
        contentType: 'image/webp',
        format: 'webp',
        data: webp,
        width: webpMeta.width,
        height: webpMeta.height,
      });
    }
  }

  return { width: origWidth, height: origHeight, format: meta.format || 'jpeg', files };
}
