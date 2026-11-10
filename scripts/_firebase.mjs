// Shared by the command-line scripts: the same Firebase connection the site uses
// (lib/firebase.ts), for plain Node. Reads the same environment variables.
import { createHash } from 'node:crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function credentials() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    return { projectId: sa.project_id, clientEmail: sa.client_email, privateKey: String(sa.private_key).replace(/\\n/g, '\n') };
  }
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return { projectId: FIREBASE_PROJECT_ID, clientEmail: FIREBASE_CLIENT_EMAIL, privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') };
  }
  return null;
}

export function connect() {
  const creds = credentials();
  const emulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  if (!creds && !emulator) {
    console.error(
      'Firebase is not configured. Put FIREBASE_SERVICE_ACCOUNT (or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL,\n' +
        'FIREBASE_PRIVATE_KEY) and FIREBASE_STORAGE_BUCKET in .env.local, or start the emulators (npm run emulators).'
    );
    process.exit(1);
  }
  const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        ...(creds ? { credential: cert(creds) } : {}),
        projectId: creds?.projectId || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'demo-fquad',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'demo-fquad.appspot.com',
      });
  const db = getFirestore(app);
  db.settings({ ignoreUndefinedProperties: true });
  console.log(emulator ? 'Using the local Firebase emulators.' : `Using Firebase project ${app.options.projectId}.`);
  return { db, bucket: getStorage(app).bucket() };
}

/** Same derivation as lib/db: one account per email. */
export const adminId = (email) => 'a_' + createHash('sha256').update(email.toLowerCase().trim()).digest('hex').slice(0, 28);

export const WEAK_PASSWORDS = new Set(['changeme123', 'password', 'password123', 'admin123', 'fquad123']);

export function checkPassword(password) {
  return Boolean(password) && password.length >= 12 && !WEAK_PASSWORDS.has(password.toLowerCase());
}
