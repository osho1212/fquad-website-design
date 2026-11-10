import { SignJWT, jwtVerify } from 'jose';

// Used only when SESSION_SECRET is unset during local development. It is
// printed in a public repository, so production must never accept it.
const DEV_FALLBACK_SECRET = 'dev-only-secret-change-in-production';
const PLACEHOLDER_SECRETS = new Set([
  DEV_FALLBACK_SECRET,
  'replace-with-a-long-random-string',
]);

let cachedSecret: Uint8Array | null = null;

/**
 * Resolved lazily so `next build` (which loads route modules without the
 * runtime environment) never fails — but the first real login or admin
 * request in production refuses to proceed without a proper secret, instead of
 * silently signing sessions with a value anyone can read.
 */
function getSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const raw = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!raw || raw.length < 32 || PLACEHOLDER_SECRETS.has(raw)) {
      throw new Error(
        'SESSION_SECRET must be set to a random value of at least 32 characters in production. ' +
          'Generate one with: openssl rand -base64 32'
      );
    }
  }
  cachedSecret = new TextEncoder().encode(raw || DEV_FALLBACK_SECRET);
  return cachedSecret;
}

export const SESSION_COOKIE_NAME = 'fquad_admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours, in seconds

export interface SessionPayload {
  userId: string;
  email: string;
  /** Fingerprint of the password this login was made with (see lib/session-check.ts). */
  pv?: string;
}

/** The signing key, for the node-side session check. Throws in production if unset. */
export function getSessionKey(): Uint8Array {
  return getSecret();
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE)
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  // Outside the try on purpose: a missing production secret should surface as
  // an error, not look like "everyone is logged out".
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    if (typeof payload.userId === 'string' && typeof payload.email === 'string') {
      return {
        userId: payload.userId,
        email: payload.email,
        ...(typeof payload.pv === 'string' ? { pv: payload.pv } : {}),
      };
    }
    return null;
  } catch {
    return null;
  }
}
