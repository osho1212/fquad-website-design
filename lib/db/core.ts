import { Timestamp, type DocumentSnapshot } from 'firebase-admin/firestore';
import { firestore } from '../firebase';

/** A stored record: its fields plus the document id. Dates come back as Date. */
export type Row<T> = T & { id: string };

export class NotFoundError extends Error {
  code = 'NOT_FOUND';
  constructor(collection: string, id: string) {
    super(`${collection}/${id} not found`);
    this.name = 'NotFoundError';
  }
}

/** Firestore stores dates as Timestamps; the rest of the app works with Date. */
export function fromSnapshot<T>(snap: DocumentSnapshot): Row<T> | null {
  if (!snap.exists) return null;
  const data = snap.data() ?? {};
  const out: Record<string, unknown> = { id: snap.id };
  for (const [key, value] of Object.entries(data)) {
    out[key] = value instanceof Timestamp ? value.toDate() : value;
  }
  return out as Row<T>;
}

/** Small typed wrapper over one collection. Lists are small, so sorting is done in code. */
export function table<T extends Record<string, unknown>>(name: string) {
  const coll = () => firestore().collection(name);

  return {
    name,

    async all(): Promise<Row<T>[]> {
      const snap = await coll().get();
      return snap.docs.map((d) => fromSnapshot<T>(d)!);
    },

    async get(id: string): Promise<Row<T> | null> {
      return fromSnapshot<T>(await coll().doc(id).get());
    },

    async getMany(ids: string[]): Promise<Row<T>[]> {
      const unique = Array.from(new Set(ids.filter(Boolean)));
      if (!unique.length) return [];
      const snaps = await firestore().getAll(...unique.map((id) => coll().doc(id)));
      return snaps.map((s) => fromSnapshot<T>(s)).filter((r): r is Row<T> => r !== null);
    },

    /** Creates a document (fails if the id already exists). */
    async create(data: T, id?: string): Promise<Row<T>> {
      const ref = id ? coll().doc(id) : coll().doc();
      await ref.create(data);
      return { ...data, id: ref.id } as Row<T>;
    },

    async set(id: string, data: T): Promise<Row<T>> {
      await coll().doc(id).set(data);
      return { ...data, id } as Row<T>;
    },

    /** Changes some fields; throws NotFoundError if the document does not exist. */
    async update(id: string, patch: Partial<T>): Promise<Row<T>> {
      const ref = coll().doc(id);
      try {
        await ref.update(patch as Record<string, unknown>);
      } catch (err: any) {
        if (err?.code === 5 || /NOT_FOUND/.test(String(err?.message))) throw new NotFoundError(name, id);
        throw err;
      }
      return fromSnapshot<T>(await ref.get())!;
    },

    async remove(id: string): Promise<void> {
      await coll().doc(id).delete();
    },

    async count(): Promise<number> {
      const snap = await coll().count().get();
      return snap.data().count;
    },
  };
}

export const byNumber = <T>(pick: (row: T) => number | null | undefined) => (a: T, b: T) =>
  (pick(a) ?? 0) - (pick(b) ?? 0);

export const byDate = <T>(pick: (row: T) => Date | null | undefined) => (a: T, b: T) =>
  (pick(a)?.getTime() ?? 0) - (pick(b)?.getTime() ?? 0);

export function maxOf(values: Array<number | null | undefined>): number {
  return values.reduce<number>((m, v) => Math.max(m, v ?? -1), -1);
}
