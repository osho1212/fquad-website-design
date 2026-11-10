import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminUsers } from '@/lib/db';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/auth';
import { clientIp, requestHostAllowed } from '@/lib/forms';
import { passwordFingerprint } from '@/lib/session-check';
import { clearHits, isLimited, recordHit } from '@/lib/rate-limit';

const WINDOW_MS = 15 * 60_000;
const MAX_FAILS_PER_IP = 10;
const MAX_FAILS_PER_ACCOUNT = 5;

// A real bcrypt hash (of a random value nobody knows). Checking against it
// when the email is unknown makes a wrong email take as long as a wrong
// password, so response time does not reveal which admin emails exist.
const DUMMY_HASH = '$2b$10$RdhGKcrGa8N4xF6bLFhsiObskZ1mPkXwMpmryguuUsZXyQuPWcp0K';

export async function POST(req: NextRequest) {
  if (!requestHostAllowed(req.headers)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let email = '';
  let password = '';

  try {
    const body = await req.json();
    email = typeof body?.email === 'string' ? body.email.toLowerCase().trim().slice(0, 254) : '';
    password = typeof body?.password === 'string' ? body.password.slice(0, 200) : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  // Brute-force protection: failed attempts are counted per address and per
  // account, so neither one machine nor a spread of machines can keep guessing.
  const ipKey = `login:ip:${clientIp(req.headers)}`;
  const accountKey = `login:acct:${email}`;
  if ((await isLimited(ipKey, MAX_FAILS_PER_IP, WINDOW_MS)) || (await isLimited(accountKey, MAX_FAILS_PER_ACCOUNT, WINDOW_MS))) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Please wait 15 minutes and try again.' },
      { status: 429, headers: { 'Retry-After': '900' } }
    );
  }

  const user = await adminUsers.findByEmail(email);
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !valid) {
    await recordHit(ipKey, WINDOW_MS);
    await recordHit(accountKey, WINDOW_MS);
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  await clearHits(accountKey);

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    pv: passwordFingerprint(user.passwordHash),
  });

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
