import { createHash } from 'crypto';
import { firestore } from '../firebase';
import { byDate, byNumber, fromSnapshot, maxOf, table, type Row } from './core';

export { NotFoundError } from './core';
export type { Row } from './core';

/*
 * Every collection the site uses. Replaces the old Prisma/SQLite layer; the
 * shapes (field names, Date values, `media` with its `variants` attached)
 * are the same, so pages and API routes read the same way as before.
 *
 *   adminUsers   media   mediaFolders   pageContent   siteSettings
 *   enquiries    testimonials   awards   teamMembers   blogPosts
 *
 * A media record carries its `variants` (thumb / medium / full / webp) inside
 * the same document, and records that show a picture keep a `mediaId`.
 */

// ───────────────────────── media ─────────────────────────

export interface Variant {
  label: string;
  path: string;
  width?: number | null;
  height?: number | null;
  format: string;
}

type MediaFields = {
  type: string;
  filename: string;
  path: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  variants: Variant[];
  folderId: string | null;
  createdAt: Date;
}
export type MediaRow = Row<MediaFields>;

const mediaTable = table<MediaFields>('media');
const foldersTable = table<{ name: string; createdAt: Date; [key: string]: unknown }>('mediaFolders');

/** Records that show a picture have a `mediaId`; this attaches the picture. */
export async function withMedia<T extends { mediaId?: string | null }>(
  rows: T[]
): Promise<Array<T & { media: MediaRow | null }>> {
  const found = await mediaTable.getMany(rows.map((r) => r.mediaId || '').filter(Boolean));
  const byId = new Map(found.map((m) => [m.id, m]));
  return rows.map((r) => ({ ...r, media: r.mediaId ? byId.get(r.mediaId) ?? null : null }));
}

export const media = {
  /** Newest first. */
  async list(): Promise<MediaRow[]> {
    return (await mediaTable.all()).sort((a, b) => byDate<MediaRow>((m) => m.createdAt)(b, a));
  },
  get: (id: string) => mediaTable.get(id),
  getMany: (ids: string[]) => mediaTable.getMany(ids),
  count: () => mediaTable.count(),

  async create(data: Partial<MediaFields> & { type: string; filename: string }, id?: string): Promise<MediaRow> {
    return mediaTable.create(
      {
        path: '',
        alt: null,
        width: null,
        height: null,
        duration: null,
        variants: [],
        folderId: null,
        createdAt: new Date(),
        ...data,
      } as MediaFields,
      id
    );
  },
  update: (id: string, patch: Partial<MediaFields>) => mediaTable.update(id, patch),
  remove: (id: string) => mediaTable.remove(id),
  newId: () => firestore().collection('media').doc().id,

  /** True if a testimonial, team member, journal post or the share image uses this picture. */
  async inUse(id: string): Promise<boolean> {
    const db = firestore();
    for (const name of ['testimonials', 'teamMembers', 'blogPosts']) {
      const snap = await db.collection(name).where('mediaId', '==', id).limit(1).get();
      if (!snap.empty) return true;
    }
    const settings = await db.collection('siteSettings').doc('default').get();
    return settings.exists && settings.data()?.ogImageId === id;
  },
};

export const mediaFolders = {
  async list() {
    return (await foldersTable.all()).sort(byDate((f) => f.createdAt));
  },
  create: (name: string) => foldersTable.create({ name, createdAt: new Date() }),
  /** Deleting a folder keeps its files: they simply lose the folder. */
  async remove(id: string) {
    await foldersTable.remove(id);
    const db = firestore();
    const snap = await db.collection('media').where('folderId', '==', id).get();
    if (snap.empty) return;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.update(d.ref, { folderId: null }));
    await batch.commit();
  },
};

// ───────────────────────── page content ─────────────────────────

type PageFields = {
  page: string;
  section: string;
  /** JSON text of the section's saved fields. */
  data: string;
  updatedAt: Date;
}
const pageTable = table<PageFields>('pageContent');
const pageKey = (page: string, section: string) => `${encodeURIComponent(page)}__${encodeURIComponent(section)}`;

export const pageContent = {
  /** Saved sections of one page. */
  async forPage(page: string): Promise<Row<PageFields>[]> {
    const snap = await firestore().collection('pageContent').where('page', '==', page).get();
    return snap.docs.map((d) => fromSnapshot<PageFields>(d)!);
  },
  /** How many sections of each page have been edited. */
  async editedCounts(): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    for (const row of await pageTable.all()) counts.set(row.page, (counts.get(row.page) ?? 0) + 1);
    return counts;
  },
  async upsert(page: string, section: string, data: string): Promise<{ section: string; updatedAt: Date }> {
    const updatedAt = new Date();
    await pageTable.set(pageKey(page, section), { page, section, data, updatedAt });
    return { section, updatedAt };
  },
  async remove(page: string, section: string) {
    await pageTable.remove(pageKey(page, section));
  },
  all: () => pageTable.all(),
};

// ───────────────────────── site settings ─────────────────────────

export type SettingsFields = {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  instagramUrl: string | null;
  mapLat: number | null;
  mapLng: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageId: string | null;
}
const settingsTable = table<SettingsFields>('siteSettings');
const SETTINGS_BLANK: SettingsFields = {
  email: null,
  phone: null,
  whatsapp: null,
  address: null,
  instagramUrl: null,
  mapLat: null,
  mapLng: null,
  metaTitle: null,
  metaDescription: null,
  ogImageId: null,
};

export const siteSettings = {
  /** The studio's contact details and share image, or null before the first save. */
  async get(): Promise<(Row<SettingsFields> & { ogImage: MediaRow | null }) | null> {
    const stored = await settingsTable.get('default');
    if (!stored) return null;
    // Fields never saved read as null, as they did before.
    const row = { ...SETTINGS_BLANK, ...stored };
    const ogImage = row.ogImageId ? await mediaTable.get(row.ogImageId) : null;
    return { ...row, ogImage };
  },
  async upsert(patch: Partial<SettingsFields>) {
    await firestore().collection('siteSettings').doc('default').set(patch, { merge: true });
    return (await siteSettings.get())!;
  },
};

// ───────────────────────── enquiries ─────────────────────────

type EnquiryFields = {
  name: string;
  email: string;
  phone: string;
  message: string;
  whatsapp: boolean;
  status: string;
  createdAt: Date;
}
const enquiriesTable = table<EnquiryFields>('enquiries');

export const enquiries = {
  /** Newest first. */
  async list() {
    return (await enquiriesTable.all()).sort((a, b) => byDate<Row<EnquiryFields>>((e) => e.createdAt)(b, a));
  },
  create: (data: { name: string; email: string; phone: string; message: string; whatsapp: boolean }) =>
    enquiriesTable.create({ ...data, status: 'NEW', createdAt: new Date() }),
  setStatus: (id: string, status: string) => enquiriesTable.update(id, { status }),
  remove: (id: string) => enquiriesTable.remove(id),
  async countNew() {
    const snap = await firestore().collection('enquiries').where('status', '==', 'NEW').count().get();
    return snap.data().count;
  },
};

// ───────────────────────── people & proof ─────────────────────────

type TestimonialFields = {
  clientName: string;
  projectName: string | null;
  quote: string;
  mediaId: string | null;
  featured: boolean;
  order: number;
  createdAt: Date;
}
const testimonialsTable = table<TestimonialFields>('testimonials');

export const testimonials = {
  async list() {
    const rows = (await testimonialsTable.all()).sort(byNumber((t) => t.order));
    return withMedia(rows);
  },
  async featured() {
    const first = (await testimonialsTable.all()).filter((t) => t.featured).sort(byNumber((t) => t.order))[0];
    return first ? (await withMedia([first]))[0] : null;
  },
  async create(data: Omit<TestimonialFields, 'order' | 'createdAt'>) {
    const order = maxOf((await testimonialsTable.all()).map((t) => t.order)) + 1;
    return testimonialsTable.create({ ...data, order, createdAt: new Date() });
  },
  update: (id: string, patch: Partial<TestimonialFields>) => testimonialsTable.update(id, patch),
  remove: (id: string) => testimonialsTable.remove(id),
  count: () => testimonialsTable.count(),
};

type AwardFields = {
  year: number;
  title: string;
  body: string;
  order: number;
  createdAt: Date;
}
const awardsTable = table<AwardFields>('awards');

export const awards = {
  /** Newest year first, then by order. */
  async list() {
    return (await awardsTable.all()).sort((a, b) => b.year - a.year || a.order - b.order);
  },
  async create(data: Omit<AwardFields, 'order' | 'createdAt'>) {
    const order = maxOf((await awardsTable.all()).map((a) => a.order)) + 1;
    return awardsTable.create({ ...data, order, createdAt: new Date() });
  },
  update: (id: string, patch: Partial<AwardFields>) => awardsTable.update(id, patch),
  remove: (id: string) => awardsTable.remove(id),
  count: () => awardsTable.count(),
};

type TeamFields = {
  name: string;
  role: string;
  bio: string | null;
  linkedIn: string | null;
  mediaId: string | null;
  featured: boolean;
  order: number;
  createdAt: Date;
}
const teamTable = table<TeamFields>('teamMembers');

export const teamMembers = {
  async list() {
    return withMedia((await teamTable.all()).sort(byNumber((m) => m.order)));
  },
  async create(data: Omit<TeamFields, 'order' | 'createdAt'>) {
    const order = maxOf((await teamTable.all()).map((m) => m.order)) + 1;
    const row = await teamTable.create({ ...data, order, createdAt: new Date() });
    return (await withMedia([row]))[0];
  },
  async update(id: string, patch: Partial<TeamFields>) {
    const row = await teamTable.update(id, patch);
    return (await withMedia([row]))[0];
  },
  remove: (id: string) => teamTable.remove(id),
  count: () => teamTable.count(),
};

// ───────────────────────── journal ─────────────────────────

type PostFields = {
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  mediaId: string | null;
  published: boolean;
  publishedAt: Date | null;
  order: number;
  createdAt: Date;
}
const postsTable = table<PostFields>('blogPosts');

export const blogPosts = {
  /** Every post, by order (admin). */
  async list() {
    return withMedia((await postsTable.all()).sort(byNumber((p) => p.order)));
  },
  /** Published posts, newest first (public). */
  async published() {
    const rows = (await postsTable.all())
      .filter((p) => p.published)
      .sort((a, b) => byDate<Row<PostFields>>((p) => p.publishedAt)(b, a));
    return withMedia(rows);
  },
  async bySlug(slug: string) {
    const snap = await firestore().collection('blogPosts').where('slug', '==', slug).limit(5).get();
    const row = snap.docs.map((d) => fromSnapshot<PostFields>(d)!).find((p) => p.published);
    return row ? (await withMedia([row]))[0] : null;
  },
  async slugs() {
    return (await postsTable.all()).map((p) => p.slug);
  },
  get: (id: string) => postsTable.get(id),
  async create(data: Omit<PostFields, 'order' | 'createdAt'>) {
    const order = maxOf((await postsTable.all()).map((p) => p.order)) + 1;
    return postsTable.create({ ...data, order, createdAt: new Date() });
  },
  update: (id: string, patch: Partial<PostFields>) => postsTable.update(id, patch),
  remove: (id: string) => postsTable.remove(id),
  count: () => postsTable.count(),
};

// ───────────────────────── admin accounts ─────────────────────────

type AdminFields = {
  email: string;
  passwordHash: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
const adminTable = table<AdminFields>('adminUsers');

/** One account per email: the document id is derived from the (lower-cased) email. */
const adminId = (email: string) => 'a_' + createHash('sha256').update(email.toLowerCase().trim()).digest('hex').slice(0, 28);

export const adminUsers = {
  findByEmail: (email: string) => adminTable.get(adminId(email)),
  findById: (id: string) => adminTable.get(id),
  async create(data: { email: string; passwordHash: string; name?: string | null; role?: string }) {
    const email = data.email.toLowerCase().trim();
    const now = new Date();
    return adminTable.create(
      { email, passwordHash: data.passwordHash, name: data.name ?? null, role: data.role ?? 'ADMIN', createdAt: now, updatedAt: now },
      adminId(email)
    );
  },
  setPassword: (id: string, passwordHash: string) => adminTable.update(id, { passwordHash, updatedAt: new Date() }),
  idFor: adminId,
};
