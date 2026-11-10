/**
 * Brings an existing site's content from its old SQLite database (dev.db) and
 * media folder (public/uploads) into Firebase: Firestore for the records, Cloud
 * Storage for the pictures. Ids are kept, so every stored picture address
 * (/uploads/<id>/<file>) keeps working.
 *
 *   npm run db:import -- <path-to>/dev.db [--uploads <path-to>/uploads] [--skip-admin] [--dry-run]
 *
 * Needs Node 22 (it reads the old file with the built-in node:sqlite). Safe to
 * run again: records are overwritten with the same data, files are re-uploaded.
 *
 * The old database's admin account carries the old default password. After the
 * import run `npm run admin:password` to set a new one (or pass --skip-admin
 * and create the admin with `npm run db:seed`).
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { adminId, connect } from './_firebase.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const sqlitePath = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--uploads');
const uploadsDir = option('--uploads');
const dryRun = flag('--dry-run');
const skipAdmin = flag('--skip-admin');

if (!sqlitePath) {
  console.error('Usage: npm run db:import -- <path-to>/dev.db [--uploads <path-to>/uploads] [--skip-admin] [--dry-run]');
  process.exit(1);
}

const old = new DatabaseSync(path.resolve(sqlitePath), { readOnly: true });
const rows = (table) => old.prepare(`SELECT * FROM ${table}`).all();

// SQLite stored dates as milliseconds (or ISO text); Firestore wants Dates.
const date = (v) => (v === null || v === undefined ? null : new Date(typeof v === 'number' ? v : Date.parse(v)));
const bool = (v) => v === 1 || v === true;

const { db, bucket } = connect();
const writes = []; // [collection, id, data]
const queue = (collection, id, data) => writes.push([collection, id, data]);

// ── media (with its sizes inside the same record), folders
const variantsByMedia = new Map();
for (const v of rows('MediaVariant')) {
  if (!variantsByMedia.has(v.mediaId)) variantsByMedia.set(v.mediaId, []);
  variantsByMedia.get(v.mediaId).push({ label: v.label, path: v.path, width: v.width, height: v.height, format: v.format });
}
for (const m of rows('Media')) {
  queue('media', m.id, {
    type: m.type, filename: m.filename, path: m.path, alt: m.alt, width: m.width, height: m.height, duration: m.duration,
    variants: variantsByMedia.get(m.id) ?? [], folderId: m.folderId, createdAt: date(m.createdAt),
  });
}
for (const f of rows('MediaFolder')) queue('mediaFolders', f.id, { name: f.name, createdAt: date(f.createdAt) });

// ── page content, settings, enquiries
for (const p of rows('PageContent')) {
  queue('pageContent', `${encodeURIComponent(p.page)}__${encodeURIComponent(p.section)}`, {
    page: p.page, section: p.section, data: p.data, updatedAt: date(p.updatedAt),
  });
}
for (const s of rows('SiteSettings')) {
  const { id, ...rest } = s;
  queue('siteSettings', id, rest);
}
for (const e of rows('Enquiry')) {
  queue('enquiries', e.id, {
    name: e.name, email: e.email, phone: e.phone, message: e.message, whatsapp: bool(e.whatsapp), status: e.status, createdAt: date(e.createdAt),
  });
}

// ── people & proof, journal
for (const t of rows('Testimonial')) {
  queue('testimonials', t.id, {
    clientName: t.clientName, projectName: t.projectName, quote: t.quote, mediaId: t.mediaId, featured: bool(t.featured), order: t.order, createdAt: date(t.createdAt),
  });
}
for (const a of rows('Award')) queue('awards', a.id, { year: a.year, title: a.title, body: a.body, order: a.order, createdAt: date(a.createdAt) });
for (const t of rows('TeamMember')) {
  queue('teamMembers', t.id, {
    name: t.name, role: t.role, bio: t.bio, linkedIn: t.linkedIn, mediaId: t.mediaId, featured: bool(t.featured), order: t.order, createdAt: date(t.createdAt),
  });
}
for (const b of rows('BlogPost')) {
  queue('blogPosts', b.id, {
    title: b.title, slug: b.slug, excerpt: b.excerpt, body: b.body, mediaId: b.mediaId, published: bool(b.published),
    publishedAt: date(b.publishedAt), order: b.order, createdAt: date(b.createdAt),
  });
}

// ── admin accounts (one per email; the password hash comes across unchanged)
if (!skipAdmin) {
  for (const u of rows('AdminUser')) {
    queue('adminUsers', adminId(u.email), {
      email: u.email.toLowerCase(), passwordHash: u.passwordHash, name: u.name, role: u.role, createdAt: date(u.createdAt), updatedAt: date(u.updatedAt),
    });
  }
}

const counts = {};
for (const [c] of writes) counts[c] = (counts[c] ?? 0) + 1;
console.log('Records to import:', counts);

// ── the picture files
const files = [];
if (uploadsDir) {
  for (const folder of await readdir(uploadsDir)) {
    const dir = path.join(uploadsDir, folder);
    if (!(await stat(dir)).isDirectory()) continue;
    for (const name of await readdir(dir)) files.push({ local: path.join(dir, name), remote: `uploads/${folder}/${name}` });
  }
  console.log(`Files to upload: ${files.length}`);
}

if (dryRun) {
  console.log('Dry run: nothing written.');
  process.exit(0);
}

for (let i = 0; i < writes.length; i += 400) {
  const batch = db.batch();
  for (const [collection, id, data] of writes.slice(i, i + 400)) batch.set(db.collection(collection).doc(id), data);
  await batch.commit();
}
console.log('Records written.');

const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif' };
let done = 0;
for (let i = 0; i < files.length; i += 8) {
  await Promise.all(
    files.slice(i, i + 8).map(async ({ local, remote }) => {
      const contentType = TYPES[path.extname(local).toLowerCase()] ?? 'application/octet-stream';
      await bucket.file(remote).save(await readFile(local), {
        resumable: false,
        contentType,
        metadata: { cacheControl: 'public, max-age=31536000, immutable' },
      });
      done += 1;
    })
  );
  process.stdout.write(`\rUploaded ${done}/${files.length} files`);
}
if (files.length) console.log();

// ── check
let ok = true;
for (const [collection, expected] of Object.entries(counts)) {
  const actual = (await db.collection(collection).count().get()).data().count;
  const line = `${collection.padEnd(14)} imported ${expected}, now in Firestore: ${actual}`;
  if (actual < expected) ok = false;
  console.log(line);
}
if (files.length) {
  const [stored] = await bucket.getFiles({ prefix: 'uploads/' });
  console.log(`Storage uploads/: ${stored.length} files (expected at least ${files.length})`);
  if (stored.length < files.length) ok = false;
}
console.log(ok ? 'Import complete.' : 'Import finished with differences — see above.');
process.exit(ok ? 0 : 1);
