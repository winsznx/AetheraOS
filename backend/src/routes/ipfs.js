import express from 'express';
import prisma from '../db.js';
const router = express.Router();

router.post('/uploads', async (req, res) => {
  try {
    const { cid, filename, filesize, mimetype, uploader, purpose, taskId, agentId } = req.body;
    const upload = await prisma.iPFSUpload.create({
      data: { cid, filename, filesize, mimetype, uploader: uploader.toLowerCase(), purpose, taskId, agentId }
    });
    res.status(201).json({ success: true, upload });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/uploads', async (req, res) => {
  try {
    const { uploader, taskId } = req.query;
    const where = {};
    if (uploader) where.uploader = uploader.toLowerCase();
    if (taskId) where.taskId = taskId;
    const uploads = await prisma.iPFSUpload.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, uploads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
