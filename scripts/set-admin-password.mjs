/**
 * Sets (or creates) an admin account's password from the command line. Use it
 * to create the first admin on a new project, or to recover a lost password.
 *
 *   ADMIN_EMAIL=you@fquad.com ADMIN_PASSWORD='a-long-unique-password' npm run admin:password
 *
 * The password is read from the environment so it never appears in shell
 * history as a command argument, but do clear your history afterwards.
 */
import bcrypt from 'bcryptjs';
import { FieldValue } from 'firebase-admin/firestore';
import { adminId, checkPassword, connect } from './_firebase.mjs';

const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD || '';

if (!email || !checkPassword(password)) {
  console.error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters (not a common one like "changeme123").');
  process.exit(1);
}

const { db } = connect();
const ref = db.collection('adminUsers').doc(adminId(email));
const passwordHash = await bcrypt.hash(password, 12);
const existing = await ref.get();

if (existing.exists) {
  await ref.update({ passwordHash, updatedAt: FieldValue.serverTimestamp() });
  console.log(`Password updated for ${email} (every other signed-in session is now signed out).`);
} else {
  const now = new Date();
  await ref.create({ email, passwordHash, name: 'F.QUAD Admin', role: 'SUPERADMIN', createdAt: now, updatedAt: now });
  console.log(`Created SUPERADMIN ${email}`);
}
