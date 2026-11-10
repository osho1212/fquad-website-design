import { NextRequest, NextResponse } from 'next/server';
import { media } from '@/lib/db';
import { createUploadTarget } from '@/lib/storage';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_BYTES = 40 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff']);

/**
 * Step 1 of adding an image: hand the browser a short-lived address to send the
 * file to directly (Vercel functions refuse bodies over 4.5 MB). The file waits
 * at incoming/<id>/original until POST /api/admin/media makes the sizes.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const contentType = typeof body?.contentType === 'string' ? body.contentType.toLowerCase() : '';
  const size = Number(body?.size);

  if (contentType.startsWith('video/')) {
    return NextResponse.json(
      { error: 'Video upload is not available on this host. Use an image, or link to a hosted video.' },
      { status: 400 }
    );
  }
  if (!IMAGE_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'Unsupported file type — please upload a JPG, PNG, WebP, GIF or AVIF image.' }, { status: 400 });
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'That file is too large (40 MB maximum).' }, { status: 413 });
  }

  const uploadId = media.newId();
  const upload = await createUploadTarget({
    path: `incoming/${uploadId}/original`,
    contentType,
    maxBytes: MAX_IMAGE_BYTES,
  });

  return NextResponse.json({ uploadId, upload });
}
