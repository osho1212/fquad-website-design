import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { page: string } }) {
  const blocks = await prisma.pageContent.findMany({
    where: { page: params.page },
  });

  const result: Record<string, any> = {};
  for (const block of blocks) {
    result[block.section] = JSON.parse(block.data);
  }

  return NextResponse.json({ content: result });
}

export async function PATCH(req: NextRequest, { params }: { params: { page: string } }) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { section, data } = body;
  if (!section || typeof section !== 'string') {
    return NextResponse.json({ error: 'section is required' }, { status: 400 });
  }
  if (data === undefined) {
    return NextResponse.json({ error: 'data is required' }, { status: 400 });
  }

  const updated = await prisma.pageContent.upsert({
    where: { page_section: { page: params.page, section } },
    update: { data: JSON.stringify(data) },
    create: { page: params.page, section, data: JSON.stringify(data) },
  });

  return NextResponse.json({ section: updated.section, data: JSON.parse(updated.data) });
}