import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const data: { mediaId?: string; order?: number; active?: boolean } = {};
  if (body.mediaId !== undefined) data.mediaId = body.mediaId;
  if (body.order !== undefined) data.order = Number(body.order);
  if (body.active !== undefined) data.active = !!body.active;

  const slide = await prisma.heroSlide.update({
    where: { id: params.id },
    data,
    include: { media: { include: { variants: true } } },
  });

  return NextResponse.json({ slide });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.heroSlide.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
