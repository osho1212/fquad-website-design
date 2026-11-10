import { NextRequest, NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';
import { MEDIA_DIR } from '@/lib/media-dir';

// Reads from disk on every request.
export const dynamic = 'force-dynamic';

/**
 * Serves the CMS media library from MEDIA_DIR.
 *
 * Why the app serves files at all: Next.js only serves `public/` files that
 * existed when it started, so a photo uploaded through the admin would 404,
 * and the image optimiser (which fetches `/uploads/...` through the app, not
 * through Nginx) could not read files kept in a folder outside the project.
 * Nginx may still serve `/uploads/` directly for speed (see SERVER_SETUP.md);
 * this route is what makes the site correct without it.
 */

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

// Plain names only: no dots at the start (hidden files), no slashes, no "..".
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const notFound = () => new NextResponse('Not found', { status: 404 });

export async function GET(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await props.params;
  if (!segments.length || !segments.every((s) => SEGMENT.test(s) && !s.includes('..'))) return notFound();

  const type = TYPES[path.extname(segments[segments.length - 1]).toLowerCase()];
  if (!type) return notFound();

  const base = path.resolve(MEDIA_DIR);
  const full = path.resolve(base, ...segments);
  if (!full.startsWith(base + path.sep)) return notFound();

  let info;
  try {
    info = await stat(full);
  } catch {
    return notFound();
  }
  if (!info.isFile()) return notFound();

  const size = info.size;
  const headers: Record<string, string> = {
    'Content-Type': type,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=2592000',
    'Last-Modified': info.mtime.toUTCString(),
    'X-Content-Type-Options': 'nosniff',
  };

  // Video needs byte ranges (Safari will not play it without).
  const range = req.headers.get('range');
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    let start = m && m[1] !== '' ? Number(m[1]) : NaN;
    let end = m && m[2] !== '' ? Number(m[2]) : NaN;
    if (m && Number.isNaN(start) && !Number.isNaN(end)) {
      // "bytes=-500": the last 500 bytes.
      start = Math.max(0, size - end);
      end = size - 1;
    } else if (m && !Number.isNaN(start) && Number.isNaN(end)) {
      end = size - 1;
    }
    if (!m || Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
      return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    }
    end = Math.min(end, size - 1);
    return new NextResponse(Readable.toWeb(createReadStream(full, { start, end })) as ReadableStream, {
      status: 206,
      headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1) },
    });
  }

  return new NextResponse(Readable.toWeb(createReadStream(full)) as ReadableStream, {
    headers: { ...headers, 'Content-Length': String(size) },
  });
}
