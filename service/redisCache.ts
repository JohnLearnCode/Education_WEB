import { getRedisClient, isRedisConnected } from '../config/redis.js';

export interface CacheOptions {
  ttl?: number; // seconds
}

/**
 * Safe cache get - returns null if Redis unavailable or error
 * Graceful degradation: never throws, allows fallback to DB
 */
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!isRedisConnected()) {
    console.warn('[Cache] Redis unavailable, skipping cache read');
    return null;
  }

  try {
    const redis = getRedisClient();
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('[Cache] Read error:', error);
    return null;
  }
};

/**
 * Safe cache set - silently fails if Redis unavailable
 * Returns boolean indicating success for logging purposes
 */
export const cacheSet = async <T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<boolean> => {
  if (!isRedisConnected()) {
    console.warn('[Cache] Redis unavailable, skipping cache write');
    return false;
  }

  try {
    const redis = getRedisClient();
    const serialized = JSON.stringify(value);

    if (options.ttl) {
      await redis.setex(key, options.ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error('[Cache] Write error:', error);
    return false;
  }
};

/**
 * Safe cache delete - silently fails if Redis unavailable
 */
export const cacheDel = async (key: string): Promise<boolean> => {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    const redis = getRedisClient();
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('[Cache] Delete error:', error);
    return false;
  }
};

/**
 * Delete multiple keys by pattern (e.g., "promotion:active:*")
 * Used for cache invalidation when admin updates promotions
 */
export const cacheDelPattern = async (pattern: string): Promise<number> => {
  if (!isRedisConnected()) {
    return 0;
  }

  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return keys.length;
  } catch (error) {
    console.error('[Cache] Pattern delete error:', error);
    return 0;
  }
};

/**
 * Increment counter with TTL (for rate limiting)
 * Returns current count after increment
 */
export const cacheIncr = async (key: string, ttl: number): Promise<number> => {
  if (!isRedisConnected()) {
    // Fail-open: return 0 to allow request when Redis down
    console.warn('[Cache] Redis unavailable, rate limit disabled');
    return 0;
  }

  try {
    const redis = getRedisClient();
    const count = await redis.incr(key);

    // Set TTL only on first increment (when count is 1)
    if (count === 1) {
      await redis.expire(key, ttl);
    }

    return count;
  } catch (error) {
    console.error('[Cache] Increment error:', error);
    return 0; // Fail-open
  }
};
