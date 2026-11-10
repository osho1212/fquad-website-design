import { createRemoteJWKSet, decodeJwt, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from 'jose';

/**
 * Checks the Firebase ID token the browser receives after "Continue with
 * Google". It does what firebase-admin's verifyIdToken does, written against
 * `jose`, which the site already uses for its own sessions.
 *
 * Why not firebase-admin/auth: it loads `jose` with require(), which Node
 * versions before 22.12 refuse (ERR_REQUIRE_ESM). On such a runtime, merely
 * importing it crashed every route that touched Firebase: forms, uploads,
 * pictures and the admin login. This file keeps that failure out of the import
 * path of everything else.
 *
 * Kept free of imports from the rest of the site so a test can run it alone
 * (scripts/test-google-token.mjs).
 */

const GOOGLE_KEYS = new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
let remoteKeys: JWTVerifyGetKey | null = null;
const googleKeys = (): JWTVerifyGetKey => (remoteKeys ??= createRemoteJWKSet(GOOGLE_KEYS));

export interface VerifiedIdentity {
  uid: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  /** How the person signed in: "google.com" for Google. */
  provider: string | null;
  /** Seconds since the epoch when they actually signed in. */
  authTime: number;
}

export class IdTokenError extends Error {}

export interface VerifyOptions {
  /** The Firebase project the token must have been issued for. */
  projectId: string;
  /** The Auth emulator issues unsigned tokens; accept those (never set in production). */
  emulator?: boolean;
  /** Signing keys; tests pass their own. Defaults to Google's published keys. */
  keys?: JWTVerifyGetKey;
  /** The current time, for tests. */
  now?: Date;
}

export async function verifyFirebaseIdToken(idToken: string, opts: VerifyOptions): Promise<VerifiedIdentity> {
  const { projectId } = opts;
  const issuer = `https://securetoken.google.com/${projectId}`;
  const nowSeconds = Math.floor((opts.now ?? new Date()).getTime() / 1000);

  let payload: JWTPayload;
  try {
    if (opts.emulator) {
      payload = decodeJwt(idToken);
      const audience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      if (payload.iss !== issuer || !audience.includes(projectId) || typeof payload.exp !== 'number' || payload.exp <= nowSeconds) {
        throw new Error('claims');
      }
    } else {
      ({ payload } = await jwtVerify(idToken, opts.keys ?? googleKeys(), {
        algorithms: ['RS256'],
        issuer,
        audience: projectId,
        currentDate: opts.now,
      }));
    }
  } catch {
    throw new IdTokenError('The sign-in token is not valid.');
  }

  const claims = payload as JWTPayload & {
    email?: unknown;
    email_verified?: unknown;
    name?: unknown;
    auth_time?: unknown;
    firebase?: { sign_in_provider?: unknown };
  };

  if (typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 128) throw new IdTokenError('The sign-in token has no subject.');
  // Firebase ID tokens always say when the person signed in, and never in the future.
  if (typeof claims.auth_time !== 'number' || claims.auth_time > nowSeconds + 60) throw new IdTokenError('The sign-in time is not valid.');

  return {
    uid: payload.sub,
    email: typeof claims.email === 'string' ? claims.email : '',
    emailVerified: claims.email_verified === true,
    name: typeof claims.name === 'string' ? claims.name : null,
    provider: typeof claims.firebase?.sign_in_provider === 'string' ? claims.firebase.sign_in_provider : null,
    authTime: claims.auth_time,
  };
}
