import { NextRequest, NextResponse } from 'next/server';
import { teamMembers } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';
import { HREF_HELP, isSafeHref } from '@/lib/forms';

export async function GET() {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  return NextResponse.json({ members: await teamMembers.list() });
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

  const { name, role, bio, linkedIn, mediaId, featured } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!role || typeof role !== 'string' || !role.trim()) {
    return NextResponse.json({ error: 'Role is required' }, { status: 400 });
  }

  if (linkedIn && !isSafeHref(String(linkedIn))) {
    return NextResponse.json({ error: `The LinkedIn link ${HREF_HELP}.` }, { status: 400 });
  }

  const member = await teamMembers.create({
    name: name.trim(),
    role: role.trim(),
    bio: bio ? String(bio).trim() : null,
    linkedIn: linkedIn ? String(linkedIn).trim() : null,
    mediaId: mediaId || null,
    featured: typeof featured === 'boolean' ? featured : false,
  });

  return NextResponse.json({ member }, { status: 201 });
}
