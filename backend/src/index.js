/**
 * AetheraOS Backend API
 * Express + PostgreSQL + Prisma
 */

console.log('============================================');
console.log('🔧 Loading AetheraOS Backend...');
console.log('============================================');

// Catch all unhandled errors
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import prisma from './db.js';
import logger from './utils/logger.js';

console.log('✅ Core modules imported');

// Import routes
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import agentRoutes from './routes/agents.js';
import chatRoutes from './routes/chat.js';
import ipfsRoutes from './routes/ipfs.js';
import analyticsRoutes from './routes/analytics.js';

console.log('✅ All routes imported');

dotenv.config();
console.log('✅ Environment configured');

const app = express();
const PORT = process.env.PORT || 3000;

console.log(`✅ Express app created, PORT=${PORT}`);

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'];

const isDevelopment = process.env.NODE_ENV === 'development';

app.use(cors({
  origin: (origin, callback) => {
    // In production, require origin header
    if (!isDevelopment && !origin) {
      return callback(new Error('Origin header required'));
    }

    // Development: allow localhost only
    if (isDevelopment) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow requests with no origin in dev (like curl)
      if (!origin) return callback(null, true);
    }

    // Production: strict whitelist
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  maxAge: 86400, // 24 hours
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-wallet-address', 'x-signature', 'x-timestamp']
}));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Separate route for IPFS uploads (larger files)
app.use('/api/ipfs/upload', express.json({ limit: '10mb' }));

import RedisStore from 'rate-limit-redis';
import redisClient from './utils/redis.js';

// Rate limiting (uses Redis if available, otherwise in-memory)
const limiterConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};

// Add Redis store only if Redis is available
if (redisClient) {
  limiterConfig.store = new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  });
  console.log('✅ Rate limiting with Redis (distributed)');
} else {
  console.log('⚠️  Rate limiting with in-memory store (single instance only)');
}

const limiter = rateLimit(limiterConfig);
app.use('/api/', limiter);

console.log('✅ Middleware configured');

// Health check
app.get('/health', async (req, res) => {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Info
app.get('/', (req, res) => {
  res.json({
    name: 'AetheraOS Backend API',
    version: '1.0.0',
    description: 'Backend API for AetheraOS - AI Agent Platform',
    endpoints: {
      users: '/api/users',
      tasks: '/api/tasks',
      agents: '/api/agents',
      chat: '/api/chat',
      ipfs: '/api/ipfs',
      analytics: '/api/analytics'
    },
    documentation: 'https://github.com/your-repo/api-docs'
  });
});

// API Routes
console.log('⚙️  Registering API routes...');
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/analytics', analyticsRoutes);
console.log('✅ All routes registered');

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.id
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
console.log(`🚀 Attempting to start server on port ${PORT}...`);

try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('============================================');
    console.log(`✅ AetheraOS Backend API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    console.log(`🌐 Listening on http://0.0.0.0:${PORT}`);
    console.log('============================================');
  });

  server.on('error', (error) => {
    console.error('💥 SERVER ERROR:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('💥 FAILED TO START SERVER:', error);
  process.exit(1);
}

export { prisma };
