import { deletePrefix, deleteObject, putObject } from './storage';
import { renderVariants } from './image-pipeline.mjs';

/**
 * Images are made here (resized, watermarked, converted) and kept in Cloud
 * Storage under uploads/<mediaId>/. Visitors reach them at /uploads/..., which
 * app/uploads streams from the bucket.
 */
export const MEDIA_URL_PREFIX = '/uploads';
const CACHE = 'public, max-age=31536000, immutable';

/**
 * Where the untouched upload is kept, so the watermark can be changed on a
 * photo that is already published (scripts/rewatermark.mjs rebuilds its sizes
 * from here). Deliberately outside `uploads/`: app/uploads serves that prefix
 * and nothing else, so visitors only ever get the watermarked sizes.
 */
const ORIGINALS_PREFIX = 'originals';

/** The two numbers Admin -> Settings keeps; either may be unset. */
export interface WatermarkSettings {
  watermarkOpacity?: number | null;
  watermarkScale?: number | null;
}

export interface VariantResult {
  label: string;
  path: string;
  width?: number;
  height?: number;
  format: string;
}

export interface ProcessResult {
  type: 'IMAGE' | 'VIDEO';
  width?: number;
  height?: number;
  duration?: number;
  variants: VariantResult[];
}

function urlFor(mediaId: string, filename: string): string {
  return `${MEDIA_URL_PREFIX}/${mediaId}/${filename}`;
}

function objectPath(mediaId: string, filename: string): string {
  return `uploads/${mediaId}/${filename}`;
}

/** Where the untouched upload of one media record lives. */
export function originalPath(mediaId: string): string {
  return `${ORIGINALS_PREFIX}/${mediaId}/original`;
}

/**
 * Makes the sizes the site serves (thumb 400w, medium 1000w, full 1920w, plus
 * a WebP of the full size) and stores them under uploads/<mediaId>/.
 * Watermarks every size unless isBackground is true (e.g. hero slides, where a
 * visible watermark would be distracting). Watermarking happens once here —
 * never re-applied on render.
 *
 * `watermark` is the saved Admin -> Settings pair; leaving it out uses the
 * defaults in lib/watermark.mjs. `keepOriginal` writes the source file to
 * originals/<mediaId>/original so the mark can be changed later
 * (scripts/rewatermark.mjs); it is on unless the caller stored it already.
 */
export async function processImage(
  buffer: Buffer,
  mediaId: string,
  isBackground = false,
  options: { watermark?: WatermarkSettings | null; keepOriginal?: boolean } = {}
): Promise<ProcessResult> {
  const { watermark = null, keepOriginal = true } = options;
  const rendered = await renderVariants(buffer, { watermark, isBackground });

  if (keepOriginal) {
    // Kept private and untouched: it is the only way back to an unmarked
    // picture once the watermarked sizes below are written.
    await putObject(originalPath(mediaId), buffer, `image/${rendered.format}`, CACHE);
  }

  const variants: VariantResult[] = [];
  for (const file of rendered.files) {
    await putObject(objectPath(mediaId, file.filename), file.data, file.contentType, CACHE);
    variants.push({
      label: file.label,
      path: urlFor(mediaId, file.filename),
      width: file.width,
      height: file.height,
      format: file.format,
    });
  }

  return { type: 'IMAGE', width: rendered.width, height: rendered.height, variants };
}

/** Removes every file of one media record (all sizes, and the kept original). */
export async function deleteMediaFiles(mediaId: string) {
  await deletePrefix(`uploads/${mediaId}/`);
  await deleteObject(originalPath(mediaId)).catch(() => {});
}
