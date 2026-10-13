/**
 * Jednostavno ograničenje broja pokušaja u memoriji procesa.
 * Dovoljno za jedan server (VPS). Za više instanci koristite Redis.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  return { ok: true, retryAfterSec: 0 };
}

export function resetRateLimits() {
  buckets.clear();
}
