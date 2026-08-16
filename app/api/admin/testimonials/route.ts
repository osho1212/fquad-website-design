import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: 'asc' },
  });
  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { clientName, projectName, quote, mediaId, featured } = body;

  if (!clientName || typeof clientName !== 'string' || !clientName.trim()) {
    return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
  }
  if (!quote || typeof quote !== 'string' || !quote.trim()) {
    return NextResponse.json({ error: 'Quote is required' }, { status: 400 });
  }

  const maxOrder = await prisma.testimonial.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? -1) + 1;

  const testimonial = await prisma.testimonial.create({
    data: {
      clientName: clientName.trim(),
      projectName: typeof projectName === 'string' && projectName.trim() ? projectName.trim() : null,
      quote: quote.trim(),
      mediaId: typeof mediaId === 'string' && mediaId ? mediaId : null,
      featured: typeof featured === 'boolean' ? featured : false,
      order,
    },
  });

  return NextResponse.json({ testimonial }, { status: 201 });
}
