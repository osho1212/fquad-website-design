import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

/**
 * The one connection to Firebase (Firestore for data, Cloud Storage for files),
 * used from server code only.
 *
 * Configuration comes from environment variables — see .env.example:
 *   FIREBASE_SERVICE_ACCOUNT          the service-account JSON (one line), or
 *   FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 *   FIREBASE_STORAGE_BUCKET           e.g. my-project.firebasestorage.app
 *
 * For local work, the Firebase emulators need no credentials: set
 * FIRESTORE_EMULATOR_HOST and FIREBASE_STORAGE_EMULATOR_HOST (the
 * `npm run emulators` setup does).
 */

export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super(
      'Firebase is not configured. Set FIREBASE_SERVICE_ACCOUNT (or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and ' +
        'FIREBASE_PRIVATE_KEY) and FIREBASE_STORAGE_BUCKET, or start the emulators for local development.'
    );
    this.name = 'FirebaseNotConfiguredError';
  }
}

export const usingEmulator = () => Boolean(process.env.FIRESTORE_EMULATOR_HOST);

function credentials() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (json) {
    const sa = JSON.parse(json);
    return {
      projectId: sa.project_id as string,
      clientEmail: sa.client_email as string,
      privateKey: String(sa.private_key).replace(/\\n/g, '\n'),
    };
  }
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return {
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }
  return null;
}

const g = globalThis as typeof globalThis & { __fqFirestoreReady?: boolean };

function app(): App {
  if (getApps().length) return getApp();

  const creds = credentials();
  if (!creds && !usingEmulator()) {
    // Fail fast instead of waiting on a metadata-server lookup (a build with no
    // credentials would otherwise stall on every page that reads the database).
    throw new FirebaseNotConfiguredError();
  }

  return initializeApp({
    ...(creds ? { credential: cert(creds) } : {}),
    projectId: creds?.projectId || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'demo-fquad',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'demo-fquad.appspot.com',
  });
}

export function firestore(): Firestore {
  const db = getFirestore(app());
  if (!g.__fqFirestoreReady) {
    // Optional fields may be undefined in patches; treat them as "not set".
    db.settings({ ignoreUndefinedProperties: true });
    g.__fqFirestoreReady = true;
  }
  return db;
}

export function bucket() {
  return getStorage(app()).bucket();
}

/** Firebase Authentication, used only to check the Google ID token at sign-in. */
export function adminAuth() {
  return getAuth(app());
}
