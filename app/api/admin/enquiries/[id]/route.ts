import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { status } = body;
  if (!status || !['NEW', 'CONTACTED', 'CLOSED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const enquiry = await prisma.enquiry.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json({ enquiry });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.enquiry.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}