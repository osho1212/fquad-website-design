import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteMediaFiles } from '@/lib/media';

// The media library is never static: this route lists live uploads and runs
// image/video processing. Marking it dynamic also keeps `next build` from
// trying to evaluate it, which times out loading sharp and the ffmpeg binaries.
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { folderId, alt } = body;

  try {
    const updated = await prisma.media.update({
      where: { id },
      data: {
        ...(folderId !== undefined ? { folderId: folderId || null } : {}),
        ...(alt !== undefined ? { alt } : {}),
      },
      include: { variants: true },
    });
    return NextResponse.json({ media: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await prisma.media.delete({ where: { id } });
  } catch (err: any) {
    if (err?.code === 'P2003') {
      return NextResponse.json(
        { error: 'This file is in use elsewhere on the site and can\u2019t be deleted yet.' },
        { status: 409 }
      );
    }
    throw err;
  }

  await deleteMediaFiles(id);

  return NextResponse.json({ success: true });
}
