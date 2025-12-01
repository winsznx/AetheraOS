/**
 * User Routes
 * Handles user profiles and authentication
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyWalletSignature } from '../utils/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/users/:address
 * Get user profile by wallet address
 */
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;

    let user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        agents: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          address: address.toLowerCase(),
          displayName: `${address.slice(0, 6)}...${address.slice(-4)}`
        }
      });
    }

    // Update last login
    await prisma.user.update({
      where: { address: address.toLowerCase() },
      data: { lastLogin: new Date() }
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/users/:address
 * Update user profile
 */
router.put('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const {  displayName, email, bio, avatar, theme, notifications, emailNotifications } = req.body;

    const user = await prisma.user.update({
      where: { address: address.toLowerCase() },
      data: {
        ...(displayName && { displayName }),
        ...(email && { email }),
        ...(bio && { bio }),
        ...(avatar && { avatar }),
        ...(theme && { theme }),
        ...(typeof notifications === 'boolean' && { notifications }),
        ...(typeof emailNotifications === 'boolean' && { emailNotifications })
      }
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/:address/stats
 * Get user statistics
 */
router.get('/:address/stats', async (req, res) => {
  try {
    const { address } = req.params;

    const [totalTasks, completedTasks, totalAgents, activeAgents] = await Promise.all([
      prisma.task.count({ where: { requester: address.toLowerCase() } }),
      prisma.task.count({ where: { requester: address.toLowerCase(), status: 'COMPLETED' } }),
      prisma.agent.count({ where: { owner: address.toLowerCase() } }),
      prisma.agent.count({ where: { owner: address.toLowerCase(), status: 'active' } })
    ]);

    // Calculate total earnings (from completed tasks where user is worker)
    const completedAsWorker = await prisma.task.findMany({
      where: {
        worker: address.toLowerCase(),
        status: 'COMPLETED',
        budget: { not: null }
      },
      select: { budget: true }
    });

    const totalEarnings = completedAsWorker.reduce((sum, task) => {
      return sum + parseFloat(task.budget || '0');
    }, 0);

    res.json({
      success: true,
      stats: {
        totalTasks,
        activeTasks: totalTasks - completedTasks,
        completedTasks,
        totalAgents,
        activeAgents,
        totalEarnings: totalEarnings.toFixed(4)
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
