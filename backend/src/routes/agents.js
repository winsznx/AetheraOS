/**
 * Agent Routes
 * Handles agent registration and management
 */

import express from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { emitAgentEvent, EventTypes } from '../utils/events.js';

const router = express.Router();

/**
 * GET /api/agents
 * Get all agents
 */
router.get('/', async (req, res) => {
  try {
    const { owner, status, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (owner) where.owner = owner.toLowerCase();
    if (status) where.status = status;

    const agents = await prisma.agent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.agent.count({ where });

    res.json({
      success: true,
      agents,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/agents
 * Create/register a new agent
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      description,
      endpoint,
      owner,
      agentId,
      imageUrl,
      capabilities,
      pricingModel,
      priceAmount
    } = req.body;

    if (!name || !description || !endpoint || !owner) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, description, endpoint, owner'
      });
    }

    // Ensure owner matches authenticated user
    if (req.user.address !== owner.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Owner must match authenticated user'
      });
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        endpoint,
        owner: owner.toLowerCase(),
        agentId,
        imageUrl,
        capabilities: capabilities || [],
        pricingModel: pricingModel || 'x402',
        priceAmount: priceAmount || '0.01',
        status: 'active'
      }
    });

    emitAgentEvent(agent.id, EventTypes.AGENT_UPDATED, agent);

    res.status(201).json({
      success: true,
      agent
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/agents/:id
 * Get agent by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await prisma.agent.findUnique({
      where: { id }
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/agents/:id
 * Update agent
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      endpoint,
      imageUrl,
      capabilities,
      pricingModel,
      priceAmount,
      status
    } = req.body;

    // Check ownership
    const existing = await prisma.agent.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Agent not found' });

    if (existing.owner !== req.user.address) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(endpoint && { endpoint }),
        ...(imageUrl && { imageUrl }),
        ...(capabilities && { capabilities }),
        ...(pricingModel && { pricingModel }),
        ...(priceAmount && { priceAmount }),
        ...(status && { status })
      }
    });

    emitAgentEvent(agent.id, EventTypes.AGENT_UPDATED, agent);

    if (status && status !== existing.status) {
      emitAgentEvent(agent.id, EventTypes.AGENT_STATUS_CHANGED, { status });
    }

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/agents/:id/call
 * Track agent call (increment stats)
 * Note: This might be called by the system or another agent, so we might keep it open or use a different auth mechanism (API Key).
 * For now, we'll leave it open but rate limited.
 */
router.post('/:id/call', async (req, res) => {
  try {
    const { id } = req.params;
    const { revenue } = req.body;

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        totalCalls: { increment: 1 },
        totalRevenue: revenue
          ? { increment: parseFloat(revenue) }
          : undefined,
        lastUsed: new Date()
      }
    });

    emitAgentEvent(agent.id, EventTypes.AGENT_CALLED, {
      totalCalls: agent.totalCalls,
      totalRevenue: agent.totalRevenue
    });

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    console.error('Error tracking agent call:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/agents/:id
 * Delete agent (soft delete - set status to inactive)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const existing = await prisma.agent.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Agent not found' });

    if (existing.owner !== req.user.address) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const agent = await prisma.agent.update({
      where: { id },
      data: { status: 'inactive' }
    });

    emitAgentEvent(agent.id, EventTypes.AGENT_STATUS_CHANGED, { status: 'inactive' });

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
