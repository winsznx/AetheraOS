/**
 * Marketplace Routes
 * Handles agent marketplace, reviews, and ratings
 */

import express from 'express';
import prisma from '../db.js';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const ReviewSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().max(500).optional()
});

// GET /api/marketplace/agents - Get all marketplace agents
router.get('/agents', async (req, res) => {
    try {
        const { category, verified, search, limit = 20, offset = 0 } = req.query;

        const where = { status: 'active' };

        if (category) where.category = category;
        if (verified === 'true') where.verified = true;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [agents, total] = await Promise.all([
            prisma.marketplaceAgent.findMany({
                where,
                orderBy: [
                    { verified: 'desc' },
                    { rating: 'desc' },
                    { usageCount: 'desc' }
                ],
                take: parseInt(limit),
                skip: parseInt(offset),
                include: {
                    _count: {
                        select: { reviews: true }
                    }
                }
            }),
            prisma.marketplaceAgent.count({ where })
        ]);

        res.json({ success: true, agents, total });
    } catch (error) {
        console.error('[Marketplace] Error fetching agents:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/marketplace/agents/:id - Get agent details
router.get('/agents/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const agent = await prisma.marketplaceAgent.findUnique({
            where: { id },
            include: {
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                _count: {
                    select: { reviews: true }
                }
            }
        });

        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }

        res.json({ success: true, agent });
    } catch (error) {
        console.error('[Marketplace] Error fetching agent:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/marketplace/agents - Create marketplace agent
router.post('/agents', async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            creator,
            endpoint,
            price,
            imageUrl,
            capabilities
        } = req.body;

        const agent = await prisma.marketplaceAgent.create({
            data: {
                name,
                description,
                category: category || 'General',
                creator: creator.toLowerCase(),
                endpoint,
                price: price || '0.0001',
                imageUrl,
                capabilities: capabilities || []
            }
        });

        res.status(201).json({ success: true, agent });
    } catch (error) {
        console.error('[Marketplace] Error creating agent:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/marketplace/agents/:id/use - Track agent usage
router.post('/agents/:id/use', async (req, res) => {
    try {
        const { id } = req.params;

        const agent = await prisma.marketplaceAgent.update({
            where: { id },
            data: {
                usageCount: { increment: 1 }
            }
        });

        res.json({ success: true, agent });
    } catch (error) {
        console.error('[Marketplace] Error tracking usage:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/marketplace/agents/:id/reviews - Add review
router.post('/agents/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, rating, comment } = ReviewSchema.parse(req.body);

        // Check if user already reviewed
        const existing = await prisma.agentReview.findFirst({
            where: { agentId: id, userId: userId.toLowerCase() }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'You have already reviewed this agent'
            });
        }

        // Create review
        const review = await prisma.agentReview.create({
            data: {
                agentId: id,
                userId: userId.toLowerCase(),
                rating,
                comment
            }
        });

        // Update agent average rating
        const reviews = await prisma.agentReview.findMany({
            where: { agentId: id }
        });

        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await prisma.marketplaceAgent.update({
            where: { id },
            data: { rating: avgRating }
        });

        res.status(201).json({ success: true, review });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors
            });
        }

        console.error('[Marketplace] Error creating review:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/marketplace/categories - Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.marketplaceAgent.groupBy({
            by: ['category'],
            _count: { category: true },
            where: { status: 'active' }
        });

        const formatted = categories.map(c => ({
            name: c.category,
            count: c._count.category
        }));

        res.json({ success: true, categories: formatted });
    } catch (error) {
        console.error('[Marketplace] Error fetching categories:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/marketplace/featured - Get featured agents
router.get('/featured', async (req, res) => {
    try {
        const agents = await prisma.marketplaceAgent.findMany({
            where: {
                status: 'active',
                verified: true
            },
            orderBy: [
                { rating: 'desc' },
                { usageCount: 'desc' }
            ],
            take: 6,
            include: {
                _count: {
                    select: { reviews: true }
                }
            }
        });

        res.json({ success: true, agents });
    } catch (error) {
        console.error('[Marketplace] Error fetching featured agents:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
