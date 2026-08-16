import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}
if (ffprobeStatic?.path) {
  ffmpeg.setFfprobePath(ffprobeStatic.path);
}

// Where files live on disk, and the URL prefix used to serve them.
// Dev default: public/uploads, served automatically by Next at /uploads/*
// Production: point MEDIA_DIR at a persistent path and have Nginx serve
// MEDIA_URL_PREFIX from it (see SERVER_SETUP.md).
export const MEDIA_DIR = process.env.MEDIA_DIR || path.join(process.cwd(), 'public', 'uploads');
export const MEDIA_URL_PREFIX = process.env.MEDIA_URL_PREFIX || '/uploads';

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

function diskPathFor(mediaId: string, filename: string): string {
  return path.join(MEDIA_DIR, mediaId, filename);
}

async function ensureMediaDir(mediaId: string) {
  await fs.mkdir(path.join(MEDIA_DIR, mediaId), { recursive: true });
}

// Sized relative to each variant's own width so the mark reads proportionally
// the same on a 400px thumb as on a 1920px full image, instead of one fixed
// pixel size looking oversized on small variants and tiny on large ones.
function watermarkSvgFor(width: number): Buffer {
  const svgWidth = Math.round(width * 0.35);
  const svgHeight = Math.round(svgWidth * 0.2);
  const fontSize = Math.round(svgWidth * 0.18);
  const letterSpacing = Math.round(svgWidth * 0.015);
  return Buffer.from(
    `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="bold" letter-spacing="${letterSpacing}" fill="rgba(255,255,255,0.22)">F.QUAD</text></svg>`
  );
}

/**
 * Generates thumb (400w), medium (1000w), full (1920w) JPEGs plus a WebP
 * version of the full size. Skips upscaling if the source is smaller.
 * Watermarks every size unless isBackground is true (e.g. hero slides,
 * where a visible watermark would be distracting). Watermarking happens
 * once at upload time — never re-applied on render.
 */
export async function processImage(buffer: Buffer, mediaId: string, isBackground = false): Promise<ProcessResult> {
  await ensureMediaDir(mediaId);

  const base = sharp(buffer).rotate(); // auto-orient based on EXIF
  const meta = await base.metadata();
  const origWidth = meta.width || 0;
  const origHeight = meta.height || 0;

  const sizes = [
    { label: 'thumb', width: 400 },
    { label: 'medium', width: 1000 },
    { label: 'full', width: 1920 },
  ];

  const variants: VariantResult[] = [];

  for (const size of sizes) {
    const targetWidth = origWidth ? Math.min(size.width, origWidth) : size.width;
    let resized = base.clone().resize({ width: targetWidth, withoutEnlargement: true });
    if (!isBackground) {
      resized = resized.composite([{ input: watermarkSvgFor(targetWidth), gravity: 'center' }]);
    }

    const jpgBuffer = await resized.clone().jpeg({ quality: 80, mozjpeg: true }).toBuffer();
    const jpgMeta = await sharp(jpgBuffer).metadata();
    const jpgFilename = `${size.label}.jpg`;
    await fs.writeFile(diskPathFor(mediaId, jpgFilename), jpgBuffer);
    variants.push({
      label: size.label,
      path: urlFor(mediaId, jpgFilename),
      width: jpgMeta.width,
      height: jpgMeta.height,
      format: 'jpg',
    });

    if (size.label === 'full') {
      const webpBuffer = await resized.clone().webp({ quality: 80 }).toBuffer();
      const webpMeta = await sharp(webpBuffer).metadata();
      const webpFilename = 'full.webp';
      await fs.writeFile(diskPathFor(mediaId, webpFilename), webpBuffer);
      variants.push({
        label: 'webp',
        path: urlFor(mediaId, webpFilename),
        width: webpMeta.width,
        height: webpMeta.height,
        format: 'webp',
      });
    }
  }

  return { type: 'IMAGE', width: origWidth, height: origHeight, variants };
}

interface FfprobeStream {
  codec_type?: string;
  width?: number;
  height?: number;
}

interface FfprobeData {
  streams: FfprobeStream[];
  format: { duration?: number };
}

/**
 * Compresses video to H.264 MP4 (capped at 1920px wide) and extracts a
 * poster frame at the 1s mark. `inputPath` must be a file on disk (ffmpeg
 * needs a real path, not a buffer).
 */
export async function processVideo(inputPath: string, mediaId: string): Promise<ProcessResult> {
  await ensureMediaDir(mediaId);

  const metadata = await new Promise<FfprobeData>((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, data) => {
      if (err) reject(err);
      else resolve(data as unknown as FfprobeData);
    });
  });

  const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
  const width = videoStream?.width;
  const height = videoStream?.height;
  const duration = metadata.format?.duration ? Math.round(metadata.format.duration) : undefined;
  const needsResize = !!(width && width > 1920);

  const outputPath = diskPathFor(mediaId, 'compressed.mp4');

  await new Promise<void>((resolve, reject) => {
    const cmd = ffmpeg(inputPath);
    cmd.on('error', reject);
    cmd.on('end', () => resolve());

    cmd
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions(['-crf 28', '-preset medium', '-movflags +faststart', '-pix_fmt yuv420p']);

    if (needsResize) cmd.size('1920x?');

    cmd.save(outputPath);
  });

  const posterDir = path.join(MEDIA_DIR, mediaId);
  await new Promise<void>((resolve, reject) => {
    const cmd = ffmpeg(inputPath);
    cmd.on('error', reject);
    cmd.on('end', () => resolve());

    cmd.screenshots({
      timestamps: ['10%'], // percentage-based so it still works on very short clips
      filename: 'poster.jpg',
      folder: posterDir,
      ...(needsResize ? { size: '1920x?' } : {}),
    });
  });

  const outWidth = needsResize ? 1920 : width;
  const outHeight = needsResize && width ? Math.round((height || 0) * (1920 / width)) : height;

  const variants: VariantResult[] = [
    { label: 'compressed', path: urlFor(mediaId, 'compressed.mp4'), width: outWidth, height: outHeight, format: 'mp4' },
    { label: 'poster', path: urlFor(mediaId, 'poster.jpg'), width: outWidth, height: outHeight, format: 'jpg' },
  ];

  return { type: 'VIDEO', width: outWidth, height: outHeight, duration, variants };
}

export async function deleteMediaFiles(mediaId: string) {
  await fs.rm(path.join(MEDIA_DIR, mediaId), { recursive: true, force: true });
}