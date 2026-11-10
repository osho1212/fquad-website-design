import { firebaseProjectId, serviceAccountAccessToken } from '@/lib/firebase';
import { fetchWebConfig, type WebConfig } from '@/lib/firebase-web-config';
import type { GoogleSignInConfig } from '@/lib/firebase-client';

/**
 * The settings the login page needs to offer "Continue with Google", or null
 * when Google sign-in cannot be offered (the page then shows the password form
 * alone). Worked out when the page is served, not when the site is built.
 *
 * The web API key is public by design (it names the Firebase project, it does
 * not unlock it). It comes from, in order:
 *   1. NEXT_PUBLIC_FIREBASE_API_KEY (or FIREBASE_WEB_API_KEY), if set;
 *   2. the Firebase project's own web app settings, looked up with the service
 *      account the site already uses, so nothing needs setting in Vercel.
 * The project id comes from that service account, and the auth domain follows
 * from it. NEXT_PUBLIC_FIREBASE_PROJECT_ID / _AUTH_DOMAIN override them.
 */

const FOUND_FOR_MS = 60 * 60_000; // keep a found key for an hour per server instance
const FAILED_FOR_MS = 60_000; //    retry a failed lookup after a minute

let lookup: { at: number; ttl: number; value: Promise<WebConfig | null> } | null = null;

function lookedUpWebConfig(projectId: string): Promise<WebConfig | null> {
  const now = Date.now();
  if (lookup && now - lookup.at < lookup.ttl) return lookup.value;
  const entry = {
    at: now,
    ttl: FOUND_FOR_MS,
    value: (async () => {
      try {
        const accessToken = await serviceAccountAccessToken();
        if (!accessToken) return null;
        return await fetchWebConfig({ accessToken, projectId });
      } catch {
        return null;
      }
    })(),
  };
  lookup = entry;
  entry.value.then((v) => {
    if (!v) entry.ttl = FAILED_FOR_MS;
  });
  return entry.value;
}

export async function googleSignInConfig(): Promise<GoogleSignInConfig | null> {
  let projectId = (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '').trim();
  if (!projectId) {
    try {
      projectId = firebaseProjectId();
    } catch {
      return null; // a malformed service-account setting: no button rather than a broken page
    }
  }
  if (!projectId) return null;

  let apiKey = (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY || '').trim();
  let authDomain = (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '').trim();
  if (!apiKey) {
    const found = await lookedUpWebConfig(projectId);
    if (!found) return null;
    apiKey = found.apiKey;
    authDomain = authDomain || found.authDomain || '';
  }

  return {
    apiKey,
    projectId,
    authDomain: authDomain || `${projectId}.firebaseapp.com`,
    emulatorHost: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || '').trim() || undefined,
  };
}
