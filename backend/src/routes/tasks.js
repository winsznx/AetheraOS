/**
 * Task Routes
 * Handles task creation, management, and blockchain sync
 */

import express from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

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

import { z } from 'zod';

const CreateTaskSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().min(10).max(5000).trim(),
  budget: z.string().regex(/^\d+(\.\d{1,18})?$/, 'Invalid budget format'),
  deadline: z.string().datetime().refine(
    (date) => new Date(date) > new Date(),
    { message: 'Deadline must be in the future' }
  ).optional().nullable(),
  requester: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address'),
  taskId: z.string().optional(),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid tx hash').optional(),
  agentId: z.string().uuid().optional(),
  operation: z.string().max(100).optional(),
  params: z.record(z.any()).optional()
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', authenticate, async (req, res) => {
  try {
    // Validate input
    const validatedData = CreateTaskSchema.parse(req.body);

    // Ensure user matches requester
    if (req.user.address !== validatedData.requester.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Requester must match authenticated user'
      });
    }

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        budget: validatedData.budget,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        requester: validatedData.requester.toLowerCase(),
        taskId: validatedData.taskId,
        txHash: validatedData.txHash,
        agentId: validatedData.agentId,
        operation: validatedData.operation,
        params: validatedData.params || {},
        status: 'OPEN'
      }
    });

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

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
router.put('/:id', authenticate, async (req, res) => {
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

    // TODO: Add strict ownership check here depending on what is being updated
    // For now, we assume if you are authenticated you can update (e.g. worker claiming)
    // In a real app, we'd check if msg.sender is the worker or requester

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
 * Optimized to use transactions
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

    // 1. Identify which tasks already exist
    const taskIds = blockchainTasks.map(t => t.taskId);
    const existingTasks = await prisma.task.findMany({
      where: { taskId: { in: taskIds } },
      select: { taskId: true }
    });
    const existingTaskIds = new Set(existingTasks.map(t => t.taskId));

    // 2. Prepare operations
    const operations = blockchainTasks.map(bcTask => {
      if (existingTaskIds.has(bcTask.taskId)) {
        // Update
        return prisma.task.update({
          where: { taskId: bcTask.taskId },
          data: {
            status: bcTask.status,
            worker: bcTask.worker?.toLowerCase(),
            proofHash: bcTask.proofHash,
            budget: bcTask.budget
          }
        });
      } else {
        // Create
        return prisma.task.create({
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
    });

    // 3. Execute in transaction
    const results = await prisma.$transaction(operations);

    res.json({
      success: true,
      synced: results.length,
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
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (task.requester !== req.user.address) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Mark as cancelled instead of deleting
    const updated = await prisma.task.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      success: true,
      task: updated
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
