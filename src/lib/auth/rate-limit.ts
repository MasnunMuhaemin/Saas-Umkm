/**
 * Rate limiter in-memory (fallback dev). Untuk produksi multi-instance,
 * ganti dengan @upstash/ratelimit + Redis.
 */
const hits = new Map<string, number[]>();

/** true = boleh lanjut; false = melebihi batas. */
export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  return true;
}

export function clearRateLimit(key: string) {
  hits.delete(key);
}
