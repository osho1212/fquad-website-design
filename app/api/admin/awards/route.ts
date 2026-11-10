import { NextRequest, NextResponse } from 'next/server';
import { awards } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  return NextResponse.json({ awards: await awards.list() });
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

  const award = await awards.create({
    year: Number(year),
    title: title.trim(),
    body: awardBody.trim(),
  });

  return NextResponse.json({ award }, { status: 201 });
}
