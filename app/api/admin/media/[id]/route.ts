import { NextRequest, NextResponse } from 'next/server';
import { media, NotFoundError } from '@/lib/db';
import { deleteMediaFiles } from '@/lib/media';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  const { id } = params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { folderId, alt } = body;

  try {
    const updated = await media.update(id, {
      ...(folderId !== undefined ? { folderId: folderId || null } : {}),
      ...(alt !== undefined ? { alt } : {}),
    });
    return NextResponse.json({ media: updated });
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  const { id } = params;

  const existing = await media.get(id);
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (await media.inUse(id)) {
    return NextResponse.json(
      { error: 'This file is in use elsewhere on the site and can’t be deleted yet.' },
      { status: 409 }
    );
  }

  await media.remove(id);
  await deleteMediaFiles(id);

  return NextResponse.json({ success: true });
}
