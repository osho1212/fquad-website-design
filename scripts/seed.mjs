/**
 * First-time setup of a new, empty Firebase project: creates the first admin
 * and the default site settings. Safe to run again (it never overwrites).
 *
 *   ADMIN_EMAIL=you@fquad.com ADMIN_PASSWORD='a-unique-12+-character-password' npm run db:seed
 *
 * There is deliberately no default password: this account controls the whole
 * site. To bring over an existing site's content instead, see `npm run db:import`.
 */
import bcrypt from 'bcryptjs';
import { adminId, checkPassword, connect } from './_firebase.mjs';

const email = (process.env.ADMIN_EMAIL || 'admin@fquad.com').toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD || '';

if (!checkPassword(password)) {
  console.error(
    'Set ADMIN_PASSWORD to a unique password of at least 12 characters before seeding.\n' +
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
    passwordHash: await bcrypt.hash(password, 12),
    name: 'F.QUAD Admin',
    role: 'SUPERADMIN',
    createdAt: now,
    updatedAt: now,
  });
  console.log(`Created admin user: ${email}`);
}

const settingsRef = db.collection('siteSettings').doc('default');
if ((await settingsRef.get()).exists) {
  console.log('Site settings already exist');
} else {
  await settingsRef.set({
    email: 'admin@fquad.com',
    phone: null,
    whatsapp: null,
    address: 'Hyderabad, Telangana, India',
    instagramUrl: 'https://instagram.com/fquadstudio',
    mapLat: null,
    mapLng: null,
    metaTitle: 'F.QUAD — Architecture & Interior Design Studio',
    metaDescription:
      'Architecture and interior design studio based in Hyderabad, working across homes, workplaces, and hospitality spaces.',
    ogImageId: null,
  });
  console.log('Created default site settings');
}

// Page content is not seeded: every editable string and image has its shipped
// value in lib/cms/pages/*, and saved edits are merged over those.
console.log('Seed complete.');
