import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

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

router.get('/events', async (req, res) => {
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
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
