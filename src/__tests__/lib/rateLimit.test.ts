import { describe, it, expect, beforeEach } from 'vitest';

// We test the module through dynamic import so the Map is fresh each test file run.
// For isolation between tests we reset via a hack: reimport the module fresh.
// Vitest resets module registry per test file; individual tests use unique keys.

let checkRateLimit: (key: string, action?: string) => { allowed: boolean; retryAfterMs?: number };

beforeEach(async () => {
  // Re-import to get a fresh module instance
  const mod = await import('@/lib/rateLimit');
  checkRateLimit = mod.checkRateLimit;
});

describe('checkRateLimit', () => {
  it('allows the first request', () => {
    const result = checkRateLimit('patient-test-1', 'joinQueue');
    expect(result.allowed).toBe(true);
  });

  it('allows up to the limit', () => {
    const key = `rl-test-${Date.now()}`;
    expect(checkRateLimit(key, 'joinQueue').allowed).toBe(true); // 1
    expect(checkRateLimit(key, 'joinQueue').allowed).toBe(true); // 2
    expect(checkRateLimit(key, 'joinQueue').allowed).toBe(true); // 3 (limit)
  });

  it('blocks when limit is exceeded', () => {
    const key = `rl-over-${Date.now()}`;
    checkRateLimit(key, 'joinQueue'); // 1
    checkRateLimit(key, 'joinQueue'); // 2
    checkRateLimit(key, 'joinQueue'); // 3
    const blocked = checkRateLimit(key, 'joinQueue'); // 4 → blocked
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it('uses independent buckets for different keys', () => {
    const key1 = `rl-k1-${Date.now()}`;
    const key2 = `rl-k2-${Date.now()}`;
    checkRateLimit(key1, 'joinQueue');
    checkRateLimit(key1, 'joinQueue');
    checkRateLimit(key1, 'joinQueue');
    const blockedKey1 = checkRateLimit(key1, 'joinQueue');
    const allowedKey2 = checkRateLimit(key2, 'joinQueue');
    expect(blockedKey1.allowed).toBe(false);
    expect(allowedKey2.allowed).toBe(true);
  });
});
