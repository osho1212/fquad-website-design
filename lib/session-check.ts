import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { adminUsers } from './db';
import { SESSION_COOKIE_NAME, getSessionKey, verifySessionToken } from './auth';

export type AdminRole = 'SUPERADMIN' | 'ADMIN';

export interface AdminSession {
  userId: string;
  email: string;
  role: AdminRole;
}

/**
 * A login is tied to the password it was made with: the token carries a
 * keyed fingerprint of the stored password hash, and every admin request
 * compares it with the account as it is now. Changing the password (or
 * deleting the account) therefore signs out every other session at once,
 * without keeping a list of sessions. The fingerprint is keyed with the
 * session secret, so the hash cannot be worked out from the cookie.
 */
export function passwordFingerprint(passwordHash: string): string {
  return createHmac('sha256', getSessionKey()).update(passwordHash).digest('base64url').slice(0, 22);
}

/** The signed-in admin for this request as the database sees them now, or null. */
export async function currentAdmin(): Promise<AdminSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  // Logins made before this check existed carry no fingerprint: sign in again.
  if (!session || !session.pv) return null;

  const user = await adminUsers.findById(session.userId);
  if (!user) return null;

  const expected = Buffer.from(passwordFingerprint(user.passwordHash));
  const given = Buffer.from(session.pv);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  return { userId: user.id, email: user.email, role: user.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN' };
}
