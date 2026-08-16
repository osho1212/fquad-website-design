import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const data: {
    clientName?: string;
    projectName?: string | null;
    quote?: string;
    mediaId?: string | null;
    featured?: boolean;
    order?: number;
  } = {};

  if (typeof body.clientName === 'string') {
    if (!body.clientName.trim()) {
      return NextResponse.json({ error: 'Client name cannot be empty' }, { status: 400 });
    }
    data.clientName = body.clientName.trim();
  }

  if ('projectName' in body) {
    data.projectName = typeof body.projectName === 'string' && body.projectName.trim() ? body.projectName.trim() : null;
  }

  if (typeof body.quote === 'string') {
    if (!body.quote.trim()) {
      return NextResponse.json({ error: 'Quote cannot be empty' }, { status: 400 });
    }
    data.quote = body.quote.trim();
  }

  if ('mediaId' in body) {
    data.mediaId = typeof body.mediaId === 'string' && body.mediaId ? body.mediaId : null;
  }

  if (typeof body.featured === 'boolean') {
    data.featured = body.featured;
  }

  if (typeof body.order === 'number') {
    data.order = body.order;
  }

  const testimonial = await prisma.testimonial.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ testimonial });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.testimonial.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
