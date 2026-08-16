import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let email: string | undefined;
  let password: string | undefined;

  try {
    const body = await req.json();
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  // Compare against a dummy hash if user not found, to avoid timing-based
  // enumeration of which emails exist.
  const hashToCheck = user?.passwordHash ?? '$2a$10$invalidsaltinvalidsaltinvalidsa';
  const valid = await bcrypt.compare(password, hashToCheck);

  if (!user || !valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = await createSessionToken({ userId: user.id, email: user.email });

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return res;
}
