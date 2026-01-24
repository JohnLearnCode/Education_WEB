import Redis from 'ioredis';

/**
 * Redis Connection - TypeScript Version
 */

let redisClient: Redis | null = null;

/**
 * Kết nối Redis
 */
export const connectRedis = async (): Promise<Redis> => {
  try {
    const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('❌ Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully!');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
    });

    await redisClient.ping();
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    throw error;
  }
};

/**
 * Đóng kết nối Redis
 */
export const closeRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      console.log('✅ Redis connection closed successfully!');
      redisClient = null;
    }
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error);
    throw error;
  }
};

/**
 * Lấy Redis client instance
 */
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redisClient;
};

/**
 * Check if Redis is connected and ready
 * Used for graceful degradation when Redis is unavailable
 */
export const isRedisConnected = (): boolean => {
  return redisClient !== null && redisClient.status === 'ready';
};
