import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uniqueSlug } from '@/lib/slugify';

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { projects: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name } = body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const existing = await prisma.category.findMany({ select: { slug: true } });
  const slug = uniqueSlug(name, new Set(existing.map((c: any) => c.slug)));

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? -1) + 1;

  const category = await prisma.category.create({
    data: { name: name.trim(), slug, order },
  });

  return NextResponse.json({ category }, { status: 201 });
}