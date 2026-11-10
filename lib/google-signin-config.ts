import { firebaseProjectId } from '@/lib/firebase';
import type { GoogleSignInConfig } from '@/lib/firebase-client';

/**
 * The settings the login page needs to offer "Continue with Google", or null
 * when Google sign-in is not set up (the page then shows the password form
 * alone). Read when the page is served, not when the site is built, so adding
 * the key in Vercel only needs a redeploy, never a rebuild.
 *
 * Only the web API key is required: the project id comes from the Firebase
 * service account the site already uses, and the auth domain follows from it.
 * All three are public by design (see lib/firebase-client.ts).
 */
export function googleSignInConfig(): GoogleSignInConfig | null {
  const apiKey = (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY || '').trim();
  if (!apiKey) return null;

  let projectId = (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '').trim();
  if (!projectId) {
    try {
      projectId = firebaseProjectId();
    } catch {
      return null; // a malformed service-account setting: no button rather than a broken page
    }
  }
  if (!projectId) return null;

  return {
    apiKey,
    projectId,
    authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '').trim() || `${projectId}.firebaseapp.com`,
    emulatorHost: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || '').trim() || undefined,
  };
}
