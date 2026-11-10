import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken, type SessionPayload } from './auth';
import { requestHostAllowed } from './forms';

/** The signed-in admin for this request, or null. Route handlers only. */
export async function getAdminSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

/**
 * Second lock on every admin API handler. `middleware.ts` already turns away
 * visitors without a session, but a single guard is one misconfiguration away
 * from an open CMS, so each handler checks again itself — and also refuses
 * requests that a different website made on a logged-in admin's behalf
 * (CSRF), by requiring any `Origin` header to match this site.
 *
 * Usage, first lines of a handler:
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!requestHostAllowed(await headers())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}
