import { NextRequest, NextResponse } from 'next/server';
import { teamMembers, NotFoundError } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';
import { HREF_HELP, isSafeHref } from '@/lib/forms';

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

  const { name, role, bio, linkedIn, mediaId, featured, order } = body;

  const data: Record<string, unknown> = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }
    data.name = name.trim();
  }
  if (role !== undefined) {
    if (typeof role !== 'string' || !role.trim()) {
      return NextResponse.json({ error: 'Role cannot be empty' }, { status: 400 });
    }
    data.role = role.trim();
  }
  if (bio !== undefined) data.bio = bio ? String(bio).trim() : null;
  if (linkedIn && !isSafeHref(String(linkedIn))) {
    return NextResponse.json({ error: `The LinkedIn link ${HREF_HELP}.` }, { status: 400 });
  }
  if (linkedIn !== undefined) data.linkedIn = linkedIn ? String(linkedIn).trim() : null;
  if (mediaId !== undefined) data.mediaId = mediaId || null;
  if (featured !== undefined) data.featured = !!featured;
  if (order !== undefined) data.order = Number(order);

  try {
    const member = await teamMembers.update(params.id, data);
    return NextResponse.json({ member });
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    throw err;
  }
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  await teamMembers.remove(params.id);
  return NextResponse.json({ success: true });
}
