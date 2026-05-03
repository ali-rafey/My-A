import 'server-only';

// Simple in-memory token-bucket rate limiter.
// For multi-instance prod, swap this for @upstash/ratelimit + Redis.

type Bucket = { tokens: number; lastRefill: number };
const buckets = new Map<string, Bucket>();

const DEFAULT_LIMIT = Number(process.env.RATE_LIMIT_PER_MINUTE) || 10;
const WINDOW_MS = 60 * 1000;

export function rateLimit(key: string, limit: number = DEFAULT_LIMIT): { ok: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const refillRate = limit / WINDOW_MS;
  const bucket = buckets.get(key) ?? { tokens: limit, lastRefill: now };

  const elapsed = now - bucket.lastRefill;
  bucket.tokens = Math.min(limit, bucket.tokens + elapsed * refillRate);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    const retryAfterMs = Math.ceil((1 - bucket.tokens) / refillRate);
    return { ok: false, remaining: 0, retryAfterMs };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);

  // Opportunistic GC.
  if (buckets.size > 5000) {
    const cutoff = now - WINDOW_MS * 5;
    for (const [k, b] of buckets) {
      if (b.lastRefill < cutoff) buckets.delete(k);
    }
  }

  return { ok: true, remaining: Math.floor(bucket.tokens), retryAfterMs: 0 };
}

export function clientKey(headers: Headers, suffix = ''): string {
  const ip =
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown';
  return `${ip}:${suffix}`;
}
