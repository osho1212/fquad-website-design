import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, role, bio, linkedIn, mediaId, featured, order } = body;

  const data: Record<string, unknown> = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }
    data.name = name.trim();
  }
  if (role !== undefined) {
    if (typeof role !== 'string' || !role.trim()) {
      return NextResponse.json({ error: 'Role cannot be empty' }, { status: 400 });
    }
    data.role = role.trim();
  }
  if (bio !== undefined) data.bio = bio ? String(bio).trim() : null;
  if (linkedIn !== undefined) data.linkedIn = linkedIn ? String(linkedIn).trim() : null;
  if (mediaId !== undefined) data.mediaId = mediaId || null;
  if (featured !== undefined) data.featured = !!featured;
  if (order !== undefined) data.order = Number(order);

  const member = await prisma.teamMember.update({
    where: { id: params.id },
    data,
    include: { media: { include: { variants: true } } },
  });

  return NextResponse.json({ member });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.teamMember.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
