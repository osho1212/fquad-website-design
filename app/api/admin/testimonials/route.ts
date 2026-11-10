import { NextRequest, NextResponse } from 'next/server';
import { testimonials } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  return NextResponse.json({ testimonials: await testimonials.list() });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

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

  const testimonial = await testimonials.create({
    clientName: clientName.trim(),
    projectName: typeof projectName === 'string' && projectName.trim() ? projectName.trim() : null,
    quote: quote.trim(),
    mediaId: typeof mediaId === 'string' && mediaId ? mediaId : null,
    featured: typeof featured === 'boolean' ? featured : false,
  });

  return NextResponse.json({ testimonial }, { status: 201 });
}
