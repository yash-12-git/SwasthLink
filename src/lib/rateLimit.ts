/**
 * Simple in-memory rate limiter for server actions.
 * Resets every WINDOW_MS. Good for serverful Next.js (not edge functions).
 * For serverless / edge, replace with an external store like Upstash Redis.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW: Record<string, number> = {
  joinQueue: 3,   // max 3 queue joins per mobile per minute
  default:   20,
};

export function checkRateLimit(key: string, action = 'default'): { allowed: boolean; retryAfterMs?: number } {
  const now    = Date.now();
  const limit  = MAX_PER_WINDOW[action] ?? MAX_PER_WINDOW['default'];
  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true };
}
