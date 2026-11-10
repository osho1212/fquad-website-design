import { NextRequest, NextResponse } from 'next/server';
import { awards, NotFoundError } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const data: { year?: number; title?: string; body?: string; order?: number } = {};
  if (body.year !== undefined) data.year = Number(body.year);
  if (body.title !== undefined) data.title = body.title;
  if (body.body !== undefined) data.body = body.body;
  if (body.order !== undefined) data.order = Number(body.order);

  try {
    const award = await awards.update(params.id, data);
    return NextResponse.json({ award });
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    throw err;
  }
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  await awards.remove(params.id);
  return NextResponse.json({ success: true });
}
