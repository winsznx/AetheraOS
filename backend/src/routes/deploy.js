/**
 * Deploy Routes
 * Handles agent deployment to Cloudflare Workers
 */

import express from 'express';
import prisma from '../db.js';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const DeployAgentSchema = z.object({
    name: z.string().min(3).max(50),
    description: z.string().max(500),
    template: z.string().optional(),
    config: z.object({
        capabilities: z.array(z.string()).optional(),
        pricingModel: z.enum(['x402', 'flat']).optional(),
        priceAmount: z.string().optional(),
        env: z.record(z.string()).optional()
    }).optional()
});

// GET /api/deploy/templates - Get deployment templates
router.get('/templates', async (req, res) => {
    try {
        const templates = [
            {
                id: 'chainintel',
                name: 'ChainIntel MCP',
                description: 'Blockchain intelligence and wallet analysis',
                capabilities: ['analyze-wallet', 'detect-whales', 'risk-score'],
                price: '0.0001 ETH',
                category: 'Blockchain'
            },
            {
                id: 'basic-mcp',
                name: 'Basic MCP',
                description: 'Simple MCP server template',
                capabilities: ['custom-tool'],
                price: '0.0001 ETH',
                category: 'General'
            },
            {
                id: 'data-analysis',
                name: 'Data Analysis MCP',
                description: 'Data processing and analysis tools',
                capabilities: ['analyze-data', 'generate-insights'],
                price: '0.0001 ETH',
                category: 'Analytics'
            }
        ];

        res.json({ success: true, templates });
    } catch (error) {
        console.error('[Deploy] Error fetching templates:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/deploy/agents - Deploy new agent
router.post('/agents', authenticate, async (req, res) => {
    try {
        const { name, description, template, config } = DeployAgentSchema.parse(req.body);

        // Use authenticated user as owner
        const owner = req.user.address;

        // Create deployment record
        const deployment = await prisma.agentDeployment.create({
            data: {
                name,
                description,
                template: template || 'basic-mcp',
                config: config || {},
                owner: owner.toLowerCase(),
                status: 'pending'
            }
        });

        // In a real implementation, this would:
        // 1. Generate worker code from template
        // 2. Deploy to Cloudflare Workers via API
        // 3. Update deployment status

        // For now, simulate deployment
        setTimeout(async () => {
            try {
                const endpoint = `https://${name.toLowerCase().replace(/\s+/g, '-')}.${owner.slice(0, 8)}.workers.dev`;

                await prisma.agentDeployment.update({
                    where: { id: deployment.id },
                    data: {
                        status: 'deployed',
                        endpoint,
                        deployedAt: new Date()
                    }
                });

                // Also create agent record
                await prisma.agent.create({
                    data: {
                        name,
                        description,
                        endpoint,
                        owner: owner.toLowerCase(),
                        capabilities: config?.capabilities || [],
                        pricingModel: config?.pricingModel || 'x402',
                        priceAmount: config?.priceAmount || '0.0001'
                    }
                });
            } catch (error) {
                console.error('[Deploy] Error updating deployment:', error);
                await prisma.agentDeployment.update({
                    where: { id: deployment.id },
                    data: {
                        status: 'failed',
                        error: error.message
                    }
                });
            }
        }, 3000); // Simulate 3s deployment time

        res.status(201).json({ success: true, deployment });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors
            });
        }

        console.error('[Deploy] Error creating deployment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/deploy/agents/:id - Get deployment status
router.get('/agents/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deployment = await prisma.agentDeployment.findUnique({
            where: { id }
        });

        if (!deployment) {
            return res.status(404).json({
                success: false,
                error: 'Deployment not found'
            });
        }

        res.json({ success: true, deployment });
    } catch (error) {
        console.error('[Deploy] Error fetching deployment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/deploy/agents - Get user's deployments
router.get('/agents', async (req, res) => {
    try {
        const { owner, status, limit = 20 } = req.query;

        const where = {};
        if (owner) where.owner = owner.toLowerCase();
        if (status) where.status = status;

        const deployments = await prisma.agentDeployment.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit)
        });

        res.json({ success: true, deployments });
    } catch (error) {
        console.error('[Deploy] Error fetching deployments:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/deploy/agents/:id - Undeploy agent
router.delete('/agents/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const deployment = await prisma.agentDeployment.findUnique({
            where: { id }
        });

        if (!deployment) {
            return res.status(404).json({
                success: false,
                error: 'Deployment not found'
            });
        }

        // Verify ownership
        if (deployment.owner !== req.user.address) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized: You can only undeploy your own agents'
            });
        }

        // In real implementation, would call Cloudflare API to delete worker

        await prisma.agentDeployment.update({
            where: { id },
            data: {
                status: 'undeployed',
                undeployedAt: new Date()
            }
        });

        // Deactivate agent
        if (deployment.endpoint) {
            await prisma.agent.updateMany({
                where: { endpoint: deployment.endpoint },
                data: { status: 'inactive' }
            });
        }

        res.json({ success: true, message: 'Agent undeployed successfully' });
    } catch (error) {
        console.error('[Deploy] Error undeploying agent:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
