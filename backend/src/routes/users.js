/**
 * User Routes
 * Handles user profiles and authentication
 */

import express from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

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

import { z } from 'zod';

const UpdateUserSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  theme: z.enum(['light', 'dark']).optional(),
  notifications: z.boolean().optional(),
  emailNotifications: z.boolean().optional()
});

/**
 * PUT /api/users/:address
 * Update user profile
 */
router.put('/:address', authenticate, async (req, res) => {
  try {
    const { address } = req.params;

    // Ensure user can only update their own profile
    if (req.user.address !== address.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this profile'
      });
    }

    // Validate input
    const validatedData = UpdateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { address: address.toLowerCase() },
      data: validatedData
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

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
        status: 'COMPLETED'
      },
      select: { budget: true }
    });

    const totalEarnings = completedAsWorker.reduce((sum, task) => {
      // Filter out null/undefined budgets during calculation
      if (task.budget) {
        return sum + parseFloat(task.budget);
      }
      return sum;
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
