/**
 * Chat Routes
 * Handles chat rooms and messages
 */

import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// GET /api/chat/rooms
router.get('/rooms', async (req, res) => {
  try {
    const { participant, limit = 50 } = req.query;

    const where = participant
      ? { participants: { has: participant.toLowerCase() } }
      : {};

    const rooms = await prisma.chatRoom.findMany({
      where,
      orderBy: { lastMessage: 'desc' },
      take: parseInt(limit),
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Just the last message
        }
      }
    });

    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/chat/rooms
router.post('/rooms', async (req, res) => {
  try {
    const { name, description, type, participants, private: isPrivate, maxParticipants } = req.body;

    const room = await prisma.chatRoom.create({
      data: {
        name,
        description,
        type: type || 'CHAT',
        participants: participants || [],
        private: isPrivate || false,
        maxParticipants
      }
    });

    res.status(201).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/chat/rooms/:id/messages
router.get('/rooms/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100, before } = req.query;

    const where = { roomId: id };
    if (before) where.createdAt = { lt: new Date(before) };

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        user: true
      }
    });

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/chat/rooms/:id/messages
router.post('/rooms/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, sender, messageType, metadata } = req.body;

    const senderAddress = sender.toLowerCase();

    // Ensure sender user exists in database
    let user = await prisma.user.findUnique({
      where: { address: senderAddress }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          address: senderAddress,
          displayName: `${senderAddress.slice(0, 6)}...${senderAddress.slice(-4)}`
        }
      });
    }

    const message = await prisma.chatMessage.create({
      data: {
        content,
        sender: senderAddress,
        roomId: id,
        messageType: messageType || 'text',
        metadata
      },
      include: {
        user: true
      }
    });

    // Update room's lastMessage timestamp
    await prisma.chatRoom.update({
      where: { id },
      data: { lastMessage: new Date() }
    });

    // Emit real-time event
    if (req.io) {
      req.io.to(id).emit('message', {
        type: 'MESSAGE',
        data: message
      });
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
