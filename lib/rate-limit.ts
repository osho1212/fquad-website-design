/**
 * Small in-memory rate limiter for the public forms and the admin login.
 *
 * It lives in this Node process only, which is exactly the deployment the
 * site uses (one PM2 instance behind Nginx — see SERVER_SETUP.md). If the app
 * is ever run as several instances, move this to a shared store or enforce
 * the limits in Nginx (`limit_req`) instead.
 */

type Bucket = { hits: number[]; windowMs: number };

const g = globalThis as typeof globalThis & { __fqRateBuckets?: Map<string, Bucket>; __fqRateSweep?: number };
const buckets: Map<string, Bucket> = (g.__fqRateBuckets ??= new Map());

function live(bucket: Bucket | undefined, now: number): number[] {
  if (!bucket) return [];
  return bucket.hits.filter((t) => now - t < bucket.windowMs);
}

function sweep(now: number) {
  if (now - (g.__fqRateSweep ?? 0) < 60_000) return;
  g.__fqRateSweep = now;
  buckets.forEach((bucket, key) => {
    if (live(bucket, now).length === 0) buckets.delete(key);
  });
}

/** True when `key` has already used up `limit` hits inside the window. */
export function isLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);
  const existing = buckets.get(key);
  const hits = live(existing ? { hits: existing.hits, windowMs } : undefined, now);
  return hits.length >= limit;
}

/** Counts one hit against `key`. */
export function recordHit(key: string, windowMs: number): void {
  const now = Date.now();
  const hits = live(buckets.get(key) ? { hits: buckets.get(key)!.hits, windowMs } : undefined, now);
  hits.push(now);
  buckets.set(key, { hits, windowMs });
}

export function clearHits(key: string): void {
  buckets.delete(key);
}
