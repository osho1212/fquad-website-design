import { NextRequest, NextResponse } from 'next/server';
import { adminUsers } from '@/lib/db';
import { adminAuth } from '@/lib/firebase';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/auth';
import { clientIp, requestHostAllowed } from '@/lib/forms';
import { passwordFingerprint } from '@/lib/session-check';
import { isLimited, recordHit } from '@/lib/rate-limit';

// Same budget as password sign-ins: failed attempts from one address share it.
const WINDOW_MS = 15 * 60_000;
const MAX_FAILS_PER_IP = 10;
// The Google sign-in must have happened just now, not be an old token replayed.
const MAX_TOKEN_AGE_SECONDS = 5 * 60;

/**
 * "Continue with Google": the browser signs in with Google through Firebase
 * Authentication and sends us the resulting ID token. We never trust the
 * browser's word for who it is; the token is verified against Google's keys,
 * must come from a Google sign-in with a verified email, and that email must
 * already be on the admin list (added by a SUPERADMIN under Admin Team).
 * Then it is exactly like a password sign-in: our own session cookie.
 */
export async function POST(req: NextRequest) {
  if (!requestHostAllowed(req.headers)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let idToken = '';
  try {
    const body = await req.json();
    idToken = typeof body?.idToken === 'string' ? body.idToken : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (idToken.length < 100 || idToken.length > 8192) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const ipKey = `login:ip:${clientIp(req.headers)}`;
  if (await isLimited(ipKey, MAX_FAILS_PER_IP, WINDOW_MS)) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Please wait 15 minutes and try again.' },
      { status: 429, headers: { 'Retry-After': '900' } }
    );
  }

  const refuse = async (status: number, error: string) => {
    await recordHit(ipKey, WINDOW_MS);
    return NextResponse.json({ error }, { status });
  };

  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(idToken);
  } catch {
    return refuse(401, 'Google sign-in could not be verified. Please try again.');
  }

  const email = typeof decoded.email === 'string' ? decoded.email.toLowerCase().trim() : '';
  if (decoded.firebase?.sign_in_provider !== 'google.com' || !email || decoded.email_verified !== true) {
    return refuse(401, 'Sign in with a Google account that has a verified email address.');
  }
  if (Math.floor(Date.now() / 1000) - decoded.auth_time > MAX_TOKEN_AGE_SECONDS) {
    return refuse(401, 'That sign-in has expired. Please try again.');
  }

  const user = await adminUsers.findByEmail(email);
  if (!user) {
    // The person has proved they own this Google address, so saying which one
    // it was (to fix a typo or a different Google account) reveals nothing.
    return refuse(403, `${email} is not on the admin list. Ask a SUPERADMIN to add this address under Admin Team.`);
  }

  await adminUsers.touchLogin(user.id, user.name ? null : typeof decoded.name === 'string' ? decoded.name.slice(0, 100) : null);

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
