import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const folders = await prisma.mediaFolder.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ folders });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, projectId } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const folder = await prisma.mediaFolder.create({
    data: { name: name.trim(), projectId: projectId || null },
  });

  return NextResponse.json({ folder }, { status: 201 });
}
