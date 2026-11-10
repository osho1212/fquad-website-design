/**
 * Creates the two test admin accounts the end-to-end test signs in with.
 * EMULATOR ONLY: it refuses to run against a real Firebase project.
 */
import bcrypt from 'bcryptjs';
import { adminId, connect } from './_firebase.mjs';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('e2e-setup only runs against the local emulators (FIRESTORE_EMULATOR_HOST is not set).');
  process.exit(1);
}

export const E2E_PASSWORD = 'E2e-test-password-1!';
const { db } = connect();
const now = new Date();

for (const [email, role] of [
  ['e2e-super@example.com', 'SUPERADMIN'],
  ['e2e-limited@example.com', 'ADMIN'],
]) {
  await db.collection('adminUsers').doc(adminId(email)).set({
    email,
    passwordHash: await bcrypt.hash(E2E_PASSWORD, 10),
    name: 'E2E ' + role,
    role,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`test ${role}: ${email}`);
}
