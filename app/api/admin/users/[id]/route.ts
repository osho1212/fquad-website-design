import { NextRequest, NextResponse } from 'next/server';
import { adminUsers, NotFoundError } from '@/lib/db';
import { getAdminSession, requireAdmin } from '@/lib/admin-guard';
import { ADMIN_ROLES, countSuperadmins, publicUser } from '@/lib/admin-users';
import { cleanLine } from '@/lib/forms';

const LAST_SUPERADMIN = 'There must always be at least one SUPERADMIN.';

// Change a teammate's role or name. SUPERADMIN only; takes effect on their
// next request (the role is read from the account every time).
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

  const target = await adminUsers.findById(params.id);
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const patch: { role?: string; name?: string | null } = {};
  if (body?.role !== undefined) {
    if (!ADMIN_ROLES.includes(body.role)) {
      return NextResponse.json({ error: 'Role must be ADMIN or SUPERADMIN.' }, { status: 400 });
    }
    if (target.role === 'SUPERADMIN' && body.role !== 'SUPERADMIN' && (await countSuperadmins()) <= 1) {
      return NextResponse.json({ error: LAST_SUPERADMIN }, { status: 400 });
    }
    patch.role = body.role;
  }
  if (body?.name !== undefined) patch.name = cleanLine(body.name, 100) || null;
  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: 'Nothing to change.' }, { status: 400 });
  }

  try {
    return NextResponse.json({ user: publicUser(await adminUsers.update(params.id, patch)) });
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    throw err;
  }
}

// Take a teammate's access away. Their sign-in stops working immediately.
export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;
  const session = await getAdminSession();

  if (session?.userId === params.id) {
    return NextResponse.json({ error: 'You cannot remove your own access.' }, { status: 400 });
  }
  const target = await adminUsers.findById(params.id);
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (target.role === 'SUPERADMIN' && (await countSuperadmins()) <= 1) {
    return NextResponse.json({ error: LAST_SUPERADMIN }, { status: 400 });
  }

  await adminUsers.remove(params.id);
  return NextResponse.json({ success: true });
}
