import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export { redis };

// Cache TTL strategy
export const CACHE_TTL = {
  PRODUCT_LIST: 300,   // 5 min
  SINGLE_PRODUCT: 600, // 10 min
  CATEGORIES: 3600,    // 1 hr
  USER_CART: 120,      // 2 min
  SEARCH_RESULTS: 60,  // 1 min
  HOMEPAGE: 300,       // 5 min
};

export async function cache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  try {
    // Check Redis first
    const cachedData = await redis.get<T>(key);
    
    if (cachedData) {
      return cachedData;
    }

    // On miss, call fetcher
    const data = await fetcher();

    // Store result in Redis
    if (data) {
      await redis.set(key, data, { ex: ttlSeconds });
    }

    return data;
  } catch (error) {
    console.error(`Cache error for key ${key}:`, error);
    // Fallback to fetcher on cache error
    return fetcher();
  }
}
