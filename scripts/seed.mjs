/**
 * First-time setup of a new, empty Firebase project: creates the first admin
 * and the default site settings. Safe to run again (it never overwrites).
 *
 *   ADMIN_EMAIL=you@fquadstudio.com ADMIN_PASSWORD='a-unique-12+-character-password' npm run db:seed
 *
 * or, for an account that signs in with Google only (no password at all):
 *
 *   ADMIN_EMAIL=you@gmail.com npm run db:seed
 *
 * There is deliberately no default password: this account controls the whole
 * site. To bring over an existing site's content instead, see `npm run db:import`.
 */
import bcrypt from 'bcryptjs';
import { adminId, checkPassword, connect } from './_firebase.mjs';

const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD || '';

const googleOnly = !password;

// No guessed address: the account controls the whole site.
if (!email) {
  console.error(
    'Set ADMIN_EMAIL to the Google address that should sign in (no password is created),\n' +
      'or set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) for a password account.'
  );
  process.exit(1);
}
if (!googleOnly && !checkPassword(password)) {
  console.error(
    'ADMIN_PASSWORD must be a unique password of at least 12 characters.\n' +
      'There is deliberately no default: this account controls the whole site.'
  );
  process.exit(1);
}

const { db } = connect();

const adminRef = db.collection('adminUsers').doc(adminId(email));
if ((await adminRef.get()).exists) {
  console.log(`Admin user already exists: ${email}`);
} else {
  const now = new Date();
  await adminRef.create({
    email,
    passwordHash: googleOnly ? null : await bcrypt.hash(password, 12),
    name: 'F.QUAD Admin',
    role: 'SUPERADMIN',
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  });
  console.log(googleOnly ? `Created admin user (signs in with Google only): ${email}` : `Created admin user: ${email}`);
}

const settingsRef = db.collection('siteSettings').doc('default');
if ((await settingsRef.get()).exists) {
  console.log('Site settings already exist');
} else {
  await settingsRef.set({
    email: 'contact@fquadstudio.com',
    phone: null,
    whatsapp: '+91 76748 17987',
    address: 'Hyderabad, Telangana, India',
    instagramUrl: 'https://instagram.com/fquadstudio',
    mapLat: null,
    mapLng: null,
    // Left empty on purpose: the site's own title and description (lib/site.ts)
    // apply until an editor types their own in Admin → Settings. Saving
    // placeholders here would override them.
    metaTitle: null,
    metaDescription: null,
    ogImageId: null,
  });
  console.log('Created default site settings');
}

// Page content is not seeded: every editable string and image has its shipped
// value in lib/cms/pages/*, and saved edits are merged over those.
console.log('Seed complete.');
