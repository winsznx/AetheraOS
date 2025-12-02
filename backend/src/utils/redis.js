import { createClient } from 'redis';
import logger from './logger.js';

let redisClient = null;

// Only create Redis client if REDIS_URL is provided
if (process.env.REDIS_URL) {
    redisClient = createClient({
        url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    redisClient.on('connect', () => logger.info('Redis Client Connected'));

    await redisClient.connect().catch((error) => {
        logger.error('Failed to connect to Redis:', error);
        redisClient = null; // Disable Redis if connection fails
    });
} else {
    logger.warn('Redis is disabled - REDIS_URL not configured');
}

export default redisClient;
