import { createClient } from 'redis';
import logger from './logger.js';

let redisClient = null;

/**
 * Initialize Redis client
 * Uses async IIFE to safely handle connection
 */
async function initRedis() {
    if (!process.env.REDIS_URL) {
        logger.warn('Redis is disabled - REDIS_URL not configured');
        return null;
    }

    try {
        const client = createClient({
            url: process.env.REDIS_URL
        });

        client.on('error', (err) => logger.error('Redis Client Error', err));
        client.on('connect', () => logger.info('Redis Client Connected'));

        await client.connect();
        return client;
    } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        return null; // Disable Redis if connection fails
    }
}

// Initialize Redis (best effort - won't crash if it fails)
(async () => {
    redisClient = await initRedis();
})();

/**
 * Get Redis client instance
 * @returns {Object|null} Redis client or null if not available
 */
export function getRedisClient() {
    return redisClient;
}

export default redisClient;

