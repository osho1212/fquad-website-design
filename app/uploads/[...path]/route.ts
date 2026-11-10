import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { bucket } from '@/lib/firebase';

// Reads from storage on every request (Vercel's CDN caches the response).
export const dynamic = 'force-dynamic';

/**
 * Serves the CMS media library from Cloud Storage at /uploads/<id>/<file>.
 *
 * The bucket stays private. This route only ever reads under `uploads/`, so
 * visitors can see the site's pictures and nothing else in the bucket (plans
 * sent by enquirers live under `private/`). Pictures are small (the largest
 * size is a 1920 px JPEG), so each is read whole.
 */

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
};

// Plain names only: no dots at the start (hidden files), no slashes, no "..".
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const notFound = () => new NextResponse('Not found', { status: 404 });

export async function GET(_req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await props.params;
  if (!segments.length || !segments.every((s) => SEGMENT.test(s) && !s.includes('..'))) return notFound();

  const type = TYPES[path.extname(segments[segments.length - 1]).toLowerCase()];
  if (!type) return notFound();

  let data: Buffer;
  try {
    [data] = await bucket().file(`uploads/${segments.join('/')}`).download();
  } catch (err: any) {
    if (err?.code === 404) return notFound();
    throw err;
  }

  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': type,
      'Content-Length': String(data.length),
      // Each upload has its own id, so a file at a given address never changes.
      'Cache-Control': 'public, max-age=2592000, s-maxage=31536000',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
