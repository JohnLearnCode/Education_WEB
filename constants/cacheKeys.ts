/**
 * Cache Key Constants
 * Centralized key patterns for Redis caching
 */

export const CACHE_KEYS = {
  // Rate limiting - tracks request count per user per minute
  RATE_LIMIT_COUPON_VALIDATE: (userId: string) =>
    `ratelimit:coupon:validate:${userId}`,

  // Promotion caching - caches active promotions per course
  ACTIVE_PROMOTIONS: (courseId: string) =>
    `promotion:active:${courseId}`,

  // Coupon validation caching - caches validation result during checkout
  COUPON_VALIDATION: (userId: string, code: string, courseIdsHash: string) =>
    `coupon:validate:${userId}:${code}:${courseIdsHash}`,
} as const;

export const CACHE_TTL = {
  // Rate limit window: 60 seconds (10 req/min)
  RATE_LIMIT_WINDOW: 60,

  // Active promotions: 60 seconds (balance freshness vs performance)
  ACTIVE_PROMOTIONS: 60,

  // Coupon validation: 5 minutes (checkout session duration)
  COUPON_VALIDATION: 300,
} as const;

// Rate limit thresholds
export const RATE_LIMITS = {
  COUPON_VALIDATE: 10, // max 10 requests per minute per user
} as const;
