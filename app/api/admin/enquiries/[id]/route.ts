import { NextRequest, NextResponse } from 'next/server';
import { enquiries, NotFoundError } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const denied = await requireAdmin();
  if (denied) return denied;

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

  try {
    const enquiry = await enquiries.setStatus(params.id, status);
    return NextResponse.json({ enquiry });
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    throw err;
  }
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const denied = await requireAdmin();
  if (denied) return denied;

  await enquiries.remove(params.id);
  return NextResponse.json({ success: true });
}
