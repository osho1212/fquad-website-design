import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const members = await prisma.teamMember.findMany({
    orderBy: { order: 'asc' },
    include: { media: { include: { variants: true } } },
  });
  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, role, bio, linkedIn, mediaId, featured } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!role || typeof role !== 'string' || !role.trim()) {
    return NextResponse.json({ error: 'Role is required' }, { status: 400 });
  }

  const maxOrder = await prisma.teamMember.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? -1) + 1;

  const member = await prisma.teamMember.create({
    data: {
      name: name.trim(),
      role: role.trim(),
      bio: bio ? String(bio).trim() : null,
      linkedIn: linkedIn ? String(linkedIn).trim() : null,
      mediaId: mediaId || null,
      featured: typeof featured === 'boolean' ? featured : false,
      order,
    },
    include: { media: { include: { variants: true } } },
  });

  return NextResponse.json({ member }, { status: 201 });
}
