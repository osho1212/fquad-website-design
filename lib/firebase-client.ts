'use client';

import { getApp, getApps, initializeApp } from 'firebase/app';
import { GoogleAuthProvider, connectAuthEmulator, getAuth, inMemoryPersistence, setPersistence, signInWithPopup, signOut } from 'firebase/auth';

/**
 * The browser half of "Continue with Google". It exists only to open Google's
 * account chooser and hand back an ID token; the site checks that token on the
 * server and keeps its own session, so nothing is left signed in here.
 *
 * The settings are public by design (they identify the Firebase project, they
 * do not unlock it). The server passes them to the login page each time it is
 * served (see lib/google-signin-config.ts), so adding or changing them never
 * needs the site to be rebuilt.
 */
export interface GoogleSignInConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  /** Only for local development with the Auth emulator. */
  emulatorHost?: string;
}

let emulatorConnected = false;

function auth(config: GoogleSignInConfig) {
  const app = getApps().length ? getApp() : initializeApp({ apiKey: config.apiKey, authDomain: config.authDomain, projectId: config.projectId });
  const instance = getAuth(app);
  if (config.emulatorHost && !emulatorConnected) {
    connectAuthEmulator(instance, `http://${config.emulatorHost}`, { disableWarnings: true });
    emulatorConnected = true;
  }
  return instance;
}

export class GoogleSignInCancelled extends Error {}

/** Opens Google's account chooser and returns a fresh ID token for the chosen account. */
export async function googleIdToken(config: GoogleSignInConfig): Promise<string> {
  const instance = auth(config);
  await setPersistence(instance, inMemoryPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(instance, provider);
    const token = await result.user.getIdToken();
    await signOut(instance);
    return token;
  } catch (err: any) {
    const code = String(err?.code || '');
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') throw new GoogleSignInCancelled();
    if (code === 'auth/popup-blocked') throw new Error('Your browser blocked the Google window. Allow pop-ups for this site and try again.');
    if (code === 'auth/unauthorized-domain') throw new Error('Google sign-in is not enabled for this web address yet. Ask the site owner to add it in Firebase.');
    throw new Error('Google sign-in did not complete. Please try again.');
  }
}
