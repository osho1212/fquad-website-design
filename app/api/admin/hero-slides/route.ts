import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { order: 'asc' },
    include: { media: { include: { variants: true } } },
  });
  return NextResponse.json({ slides });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { mediaId, order, active } = body;

  if (!mediaId || typeof mediaId !== 'string') {
    return NextResponse.json({ error: 'Media is required' }, { status: 400 });
  }

  const slide = await prisma.heroSlide.create({
    data: {
      mediaId,
      order: order ?? 0,
      active: active ?? true,
    },
    include: { media: { include: { variants: true } } },
  });

  return NextResponse.json({ slide }, { status: 201 });
}
