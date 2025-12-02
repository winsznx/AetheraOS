
import express from 'express';
import prisma from '../db.js';
const router = express.Router();

router.post('/events', async (req, res) => {
  try {
    const { eventType, userAddress, data } = req.body;
    const event = await prisma.analyticsEvent.create({
      data: { eventType, userAddress: userAddress?.toLowerCase(), data }
    });
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

import redisClient from '../utils/redis.js';
import logger from '../utils/logger.js';

/**
 * Cache middleware (uses Redis if available, otherwise disabled)
 * @param {number} ttlSeconds - Time to live in seconds
 */
function cacheMiddleware(ttlSeconds = 60) {
  return async (req, res, next) => {
    // Skip caching if Redis is not available or nocache param is set
    if (!redisClient || req.query.nocache) return next();

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redisClient.get(key);

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Override res.json to cache response
      const originalJson = res.json;
      res.json = function (data) {
        redisClient.setEx(key, ttlSeconds, JSON.stringify(data)).catch((err) => {
          logger.error('Cache set error:', err);
        });
        originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache error:', error);
      next(); // Continue without cache on error
    }
  };
}

router.get('/events', cacheMiddleware(300), async (req, res) => {
  try {
    const { eventType, userAddress, limit = 100 } = req.query;
    const where = {};
    if (eventType) where.eventType = eventType;
    if (userAddress) where.userAddress = userAddress.toLowerCase();
    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });
    res.json({ success: true, events });
  } catch (error) {
    logger.error('Error fetching analytics events:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
