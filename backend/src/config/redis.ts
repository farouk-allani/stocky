import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

let redisClient: ReturnType<typeof createClient>;

export const initializeRedis = async () => {
  try {
    // Skip Redis if URL not provided (development mode)
    if (!process.env.REDIS_URL) {
      logger.info('Redis URL not provided, skipping Redis initialization');
      return;
    }
    
    redisClient = createClient({
      url: process.env.REDIS_URL
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });
    
    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call initializeRedis first.');
  }
  return redisClient;
};

export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.disconnect();
    logger.info('Redis connection closed');
  }
};
