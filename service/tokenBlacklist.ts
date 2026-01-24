import { getRedisClient } from '../config/redis.js';
import jwt from 'jsonwebtoken';

const BLACKLIST_PREFIX = 'token:blacklist:';

/**
 * Thêm token vào blacklist với TTL bằng thời gian sống còn lại của token
 */
export const revokeToken = async (token: string): Promise<void> => {
  const redis = getRedisClient();
  const decoded = jwt.decode(token) as jwt.JwtPayload;

  if (!decoded || !decoded.exp) {
    throw new Error('Invalid token');
  }

  // Tính TTL còn lại của token (giây)
  const now = Math.floor(Date.now() / 1000);
  const ttl = decoded.exp - now;

  if (ttl > 0) {
    await redis.setex(`${BLACKLIST_PREFIX}${token}`, ttl, '1');
  }
};

/**
 * Kiểm tra token có trong blacklist không
 */
export const isTokenRevoked = async (token: string): Promise<boolean> => {
  const redis = getRedisClient();
  const result = await redis.get(`${BLACKLIST_PREFIX}${token}`);
  return result !== null;
};
