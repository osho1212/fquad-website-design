import { NextRequest, NextResponse } from 'next/server';
import { media } from '@/lib/db';
import { processImage, deleteMediaFiles } from '@/lib/media';
import { deleteObject, readObject, statObject } from '@/lib/storage';
import { requireAdmin } from '@/lib/admin-guard';
import { cleanLine } from '@/lib/forms';

// The media library is never static: it lists live uploads and runs image
// processing.
export const dynamic = 'force-dynamic';
// Making the sizes of a large photo takes a few seconds.
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 40 * 1024 * 1024;
const UPLOAD_ID = /^[A-Za-z0-9]{10,40}$/;

export async function GET() {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  return NextResponse.json({ media: await media.list() });
}

/**
 * Step 3 of adding an image: the browser has sent the file to incoming/<id>/original
 * (see upload-url); this makes the sizes, stores them and records the image.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const uploadId = typeof body?.uploadId === 'string' ? body.uploadId : '';
  if (!UPLOAD_ID.test(uploadId)) {
    return NextResponse.json({ error: 'Invalid upload' }, { status: 400 });
  }
  const filename = cleanLine(body?.filename, 200) || 'image';
  const alt = typeof body?.alt === 'string' && body.alt.trim() ? cleanLine(body.alt, 300) : null;
  const folderId = typeof body?.folderId === 'string' && body.folderId ? body.folderId : null;
  const isBackground = body?.background === true;

  const incoming = `incoming/${uploadId}/original`;
  const info = await statObject(incoming);
  if (!info) {
    return NextResponse.json({ error: 'The file did not arrive. Please try the upload again.' }, { status: 400 });
  }
  if (info.size > MAX_IMAGE_BYTES) {
    await deleteObject(incoming);
    return NextResponse.json({ error: 'That file is too large (40 MB maximum).' }, { status: 413 });
  }

  try {
    const original = await readObject(incoming);
    const result = await processImage(original, uploadId, isBackground);
    const main = result.variants.find((v) => v.label === 'full');

    const created = await media.create(
      {
        type: 'IMAGE',
        filename,
        path: main?.path || '',
        alt,
        folderId,
        width: result.width ?? null,
        height: result.height ?? null,
        variants: result.variants.map((v) => ({
          label: v.label,
          path: v.path,
          width: v.width ?? null,
          height: v.height ?? null,
          format: v.format,
        })),
      },
      uploadId
    );

    await deleteObject(incoming);
    return NextResponse.json({ media: created }, { status: 201 });
  } catch (err) {
    console.error('Media processing failed:', err);
    await deleteMediaFiles(uploadId).catch(() => {});
    await deleteObject(incoming).catch(() => {});
    return NextResponse.json(
      { error: 'Failed to process the file. Check it is a valid image and try again.' },
      { status: 500 }
    );
  }
}
