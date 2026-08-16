import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const awards = await prisma.award.findMany({
    orderBy: [{ year: 'desc' }, { order: 'asc' }],
  });
  return NextResponse.json({ awards });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { year, title, body: awardBody } = body;

  if (year === undefined || year === null || year === '' || !Number.isInteger(Number(year))) {
    return NextResponse.json({ error: 'Year is required and must be a valid integer' }, { status: 400 });
  }
  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  if (!awardBody || typeof awardBody !== 'string' || !awardBody.trim()) {
    return NextResponse.json({ error: 'Body is required' }, { status: 400 });
  }

  const maxOrder = await prisma.award.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? -1) + 1;

  const award = await prisma.award.create({
    data: {
      year: Number(year),
      title: title.trim(),
      body: awardBody.trim(),
      order,
    },
  });

  return NextResponse.json({ award }, { status: 201 });
}
