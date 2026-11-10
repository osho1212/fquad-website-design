import { createHash } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { firestore } from './firebase';

/**
 * Rate limits for the public forms and the admin login, kept in Firestore.
 *
 * They cannot live in server memory: on Vercel every request may run on a
 * different short-lived instance, so an in-memory count would never add up.
 * One small document per key holds the timestamps of recent hits.
 *
 * Enable a Firestore TTL policy on the `rateLimits` collection's `expiresAt`
 * field so old keys are removed automatically (see DEPLOY.md).
 */

const COLLECTION = 'rateLimits';

const refFor = (key: string) =>
  firestore().collection(COLLECTION).doc(createHash('sha256').update(key).digest('hex').slice(0, 40));

/** True when `key` has already used up `limit` hits inside the window. */
export async function isLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const snap = await refFor(key).get();
  if (!snap.exists) return false;
  const hits: number[] = snap.data()?.hits ?? [];
  const now = Date.now();
  return hits.filter((t) => now - t < windowMs).length >= limit;
}

/** Counts one hit against `key`. */
export async function recordHit(key: string, windowMs: number): Promise<void> {
  const ref = refFor(key);
  await firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();
    const hits = ((snap.data()?.hits ?? []) as number[]).filter((t) => now - t < windowMs);
    hits.push(now);
    tx.set(ref, { hits: hits.slice(-200), windowMs, expiresAt: Timestamp.fromMillis(now + windowMs) });
  });
}

export async function clearHits(key: string): Promise<void> {
  await refFor(key).delete();
}
