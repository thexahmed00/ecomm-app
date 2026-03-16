type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitEntry>();

export function rateLimit(ip: string, action: string, limit: number, windowMs: number) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false, resetTime: entry.resetTime };
  }

  entry.count += 1;
  store.set(key, entry);
  return { success: true };
}