import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteMediaFiles } from '@/lib/media';

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
