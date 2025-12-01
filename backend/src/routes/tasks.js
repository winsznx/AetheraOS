/**
 * Task Routes
 * Handles task creation, management, and blockchain sync
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/tasks
 * Get all tasks (with filters)
 */
router.get('/', async (req, res) => {
  try {
    const { status, requester, worker, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (requester) where.requester = requester.toLowerCase();
    if (worker) where.worker = worker.toLowerCase();

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.task.count({ where });

    res.json({
      success: true,
      tasks,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      budget,
      deadline,
      requester,
      taskId,
      txHash,
      agentId,
      operation,
      params
    } = req.body;

    // Validate required fields
    if (!title || !description || !requester) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, requester'
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        budget: budget || '0',
        deadline: deadline ? new Date(deadline) : null,
        requester: requester.toLowerCase(),
        taskId,
        txHash,
        agentId,
        operation,
        params: params || {},
        status: 'OPEN'
      }
    });

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/tasks/:id
 * Get task by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/tasks/blockchain/:taskId
 * Get task by blockchain taskId
 */
router.get('/blockchain/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { taskId }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/tasks/:id
 * Update task (sync from blockchain)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      worker,
      proofHash,
      result,
      claimedAt,
      submittedAt,
      completedAt
    } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(worker && { worker: worker.toLowerCase() }),
        ...(proofHash && { proofHash }),
        ...(result && { result }),
        ...(claimedAt && { claimedAt: new Date(claimedAt) }),
        ...(submittedAt && { submittedAt: new Date(submittedAt) }),
        ...(completedAt && { completedAt: new Date(completedAt) })
      }
    });

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tasks/sync
 * Sync tasks from blockchain
 */
router.post('/sync', async (req, res) => {
  try {
    const { tasks: blockchainTasks } = req.body;

    if (!Array.isArray(blockchainTasks)) {
      return res.status(400).json({
        success: false,
        error: 'tasks must be an array'
      });
    }

    const results = await Promise.allSettled(
      blockchainTasks.map(async (bcTask) => {
        // Try to find existing task by taskId
        const existing = await prisma.task.findUnique({
          where: { taskId: bcTask.taskId }
        });

        if (existing) {
          // Update existing task
          return await prisma.task.update({
            where: { taskId: bcTask.taskId },
            data: {
              status: bcTask.status,
              worker: bcTask.worker?.toLowerCase(),
              proofHash: bcTask.proofHash,
              budget: bcTask.budget
            }
          });
        } else {
          // Create new task
          return await prisma.task.create({
            data: {
              taskId: bcTask.taskId,
              title: bcTask.title || `Task #${bcTask.taskId}`,
              description: bcTask.description || '',
              budget: bcTask.budget,
              requester: bcTask.requester.toLowerCase(),
              worker: bcTask.worker?.toLowerCase(),
              proofHash: bcTask.proofHash,
              status: bcTask.status,
              deadline: bcTask.deadline ? new Date(bcTask.deadline) : null
            }
          });
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      synced: successful,
      failed,
      total: blockchainTasks.length
    });
  } catch (error) {
    console.error('Error syncing tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete task (soft delete by setting status)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Mark as cancelled instead of deleting
    const task = await prisma.task.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
