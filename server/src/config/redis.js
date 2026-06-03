import Redis from 'ioredis';
import logger from './logger.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redisClient = null;
let redisConnected = false;

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      // Limit reconnect attempts to prevent flooding logs if Redis is down
      if (times > 3) {
        logger.warn(`Redis connection failed after ${times} attempts. Caching is disabled.`);
        return null; // Stop reconnecting
      }
      return Math.min(times * 100, 2000);
    },
  });

  redisClient.on('connect', () => {
    redisConnected = true;
    logger.info('Connected to Redis');
  });

  redisClient.on('error', (err) => {
    redisConnected = false;
    logger.warn(`Redis error: ${err.message}. Running without caching.`);
  });
} catch (error) {
  logger.warn(`Failed to initialize Redis: ${error.message}. Running without caching.`);
}

/**
 * Get cached item by key
 */
export const getCache = async (key) => {
  if (!redisConnected || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Redis get error for key ${key}: ${error.message}`);
    return null;
  }
};

/**
 * Set item in cache with expiration
 */
export const setCache = async (key, value, expirySeconds = 300) => {
  if (!redisConnected || !redisClient) return false;
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', expirySeconds);
    return true;
  } catch (error) {
    logger.error(`Redis set error for key ${key}: ${error.message}`);
    return false;
  }
};

/**
 * Delete cache matching a key or pattern
 */
export const deleteCache = async (pattern) => {
  if (!redisConnected || !redisClient) return false;
  try {
    if (pattern.includes('*')) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.debug(`Cleared Redis cache keys matching pattern: ${pattern}`);
      }
    } else {
      await redisClient.del(pattern);
      logger.debug(`Cleared Redis cache key: ${pattern}`);
    }
    return true;
  } catch (error) {
    logger.error(`Redis delete error for pattern ${pattern}: ${error.message}`);
    return false;
  }
};

export default redisClient;
