import { NextRequest, NextResponse } from 'next/server';
import { adminUsers } from '@/lib/db';
import { getAdminSession, requireAdmin } from '@/lib/admin-guard';
import { ADMIN_ROLES, publicUser } from '@/lib/admin-users';
import { cleanLine, isEmail } from '@/lib/forms';

// The people who can sign in to the admin. SUPERADMIN only.
export async function GET() {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;
  const session = await getAdminSession();
  return NextResponse.json({ users: (await adminUsers.all()).map(publicUser), currentUserId: session?.userId ?? null });
}

// Give a teammate access. They sign in with Google using this address; no
// password is created. SUPERADMIN only.
export async function POST(req: NextRequest) {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';
  const name = cleanLine(body?.name, 100) || null;
  const role = body?.role === undefined ? 'ADMIN' : body.role;

  if (!email || email.length > 254 || !isEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (!ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Role must be ADMIN or SUPERADMIN.' }, { status: 400 });
  }
  if (await adminUsers.findByEmail(email)) {
    return NextResponse.json({ error: 'That email already has access.' }, { status: 409 });
  }

  const user = await adminUsers.create({ email, name, role });
  return NextResponse.json({ user: publicUser(user) }, { status: 201 });
}
