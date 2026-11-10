import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAdminSession, requireAdmin } from '@/lib/admin-guard';
import { passwordProblem } from '@/lib/passwords';
import { clearHits, isLimited, recordHit } from '@/lib/rate-limit';

const WINDOW_MS = 15 * 60_000;
const MAX_FAILS = 5;

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let currentPassword = '';
  let newPassword = '';
  try {
    const body = await req.json();
    currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword.slice(0, 200) : '';
    newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const limitKey = `password:${session.userId}`;
  if (isLimited(limitKey, MAX_FAILS, WINDOW_MS)) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Please wait 15 minutes and try again.' },
      { status: 429, headers: { 'Retry-After': '900' } }
    );
  }

  const problem = passwordProblem(newPassword);
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 400 });
  }
  if (newPassword === currentPassword) {
    return NextResponse.json({ error: 'The new password must be different from the current one.' }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    recordHit(limitKey, WINDOW_MS);
    return NextResponse.json({ error: 'Your current password is not correct.' }, { status: 400 });
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });
  clearHits(limitKey);

  return NextResponse.json({ success: true });
}
