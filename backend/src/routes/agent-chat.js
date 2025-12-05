/**
 * Agent Chat Routes
 * Handles agent conversation history and messages
 */

import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// GET /api/agent-chat/conversations
// Get all conversations for a user
router.get('/conversations', async (req, res) => {
    try {
        const { userId, limit = 50 } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId is required' });
        }

        const conversations = await prisma.agentConversation.findMany({
            where: { userId: userId.toLowerCase() },
            orderBy: { updatedAt: 'desc' },
            take: parseInt(limit),
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 1 // Just the first message for preview
                },
                _count: {
                    select: { messages: true }
                }
            }
        });

        res.json({ success: true, conversations });
    } catch (error) {
        console.error('[AgentChat] Error fetching conversations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/agent-chat/conversations
// Create a new conversation
router.post('/conversations', async (req, res) => {
    try {
        const { userId, title, metadata } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId is required' });
        }

        const conversation = await prisma.agentConversation.create({
            data: {
                userId: userId.toLowerCase(),
                title: title || 'New Conversation',
                metadata: metadata || {}
            }
        });

        res.status(201).json({ success: true, conversation });
    } catch (error) {
        console.error('[AgentChat] Error creating conversation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/agent-chat/conversations/:id
// Get a specific conversation with all messages
router.get('/conversations/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const conversation = await prisma.agentConversation.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }

        res.json({ success: true, conversation });
    } catch (error) {
        console.error('[AgentChat] Error fetching conversation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/agent-chat/conversations/:id/messages
// Add a message to a conversation
router.post('/conversations/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, content, metadata } = req.body;

        if (!role || !content) {
            return res.status(400).json({ success: false, error: 'role and content are required' });
        }

        // Verify conversation exists
        const conversation = await prisma.agentConversation.findUnique({
            where: { id }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }

        // Create message
        const message = await prisma.agentMessage.create({
            data: {
                conversationId: id,
                role,
                content,
                metadata: metadata || {}
            }
        });

        // Update conversation timestamp and title if needed
        const updateData = { updatedAt: new Date() };

        // Auto-generate title from first user message if not set
        if (!conversation.title || conversation.title === 'New Conversation') {
            if (role === 'user') {
                const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
                updateData.title = title;
            }
        }

        await prisma.agentConversation.update({
            where: { id },
            data: updateData
        });

        // Emit real-time event
        if (req.io) {
            req.io.to(`agent-chat-${id}`).emit('agent-message', {
                type: 'MESSAGE',
                data: message
            });
        }

        res.status(201).json({ success: true, message });
    } catch (error) {
        console.error('[AgentChat] Error creating message:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/agent-chat/conversations/:id
// Update conversation (e.g., title, metadata)
router.put('/conversations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, metadata } = req.body;

        const conversation = await prisma.agentConversation.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(metadata && { metadata })
            }
        });

        res.json({ success: true, conversation });
    } catch (error) {
        console.error('[AgentChat] Error updating conversation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/agent-chat/conversations/:id
// Delete a conversation and all its messages
router.delete('/conversations/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.agentConversation.delete({
            where: { id }
        });

        res.json({ success: true, message: 'Conversation deleted' });
    } catch (error) {
        console.error('[AgentChat] Error deleting conversation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
