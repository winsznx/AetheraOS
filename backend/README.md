# AetheraOS Backend API

PostgreSQL + Express + Prisma backend for AetheraOS platform.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL (Railway)
- **ORM:** Prisma
- **Auth:** Wallet signatures (ethers.js)
- **Deployment:** Railway

## Features

- ✅ User profiles (keyed by wallet address)
- ✅ Task management with blockchain sync
- ✅ Agent registry and stats
- ✅ Chat rooms and messages
- ✅ IPFS upload tracking
- ✅ Analytics and events
- ✅ RESTful API
- ✅ Automatic migrations

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create `.env` file:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/aetheraos
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
PORT=3000
```

### 3. Run Migrations

```bash
# Push schema to database
npm run db:push

# OR run migrations (recommended for production)
npm run db:migrate
```

### 4. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on http://localhost:3000

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:address` | Get user profile |
| PUT | `/api/users/:address` | Update profile |
| GET | `/api/users/:address/stats` | Get user statistics |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks (with filters) |
| POST | `/api/tasks` | Create new task |
| GET | `/api/tasks/:id` | Get task by ID |
| PUT | `/api/tasks/:id` | Update task (sync from blockchain) |
| POST | `/api/tasks/sync` | Bulk sync from blockchain |
| DELETE | `/api/tasks/:id` | Cancel task |

### Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | List all agents (with filters) |
| POST | `/api/agents` | Register new agent |
| GET | `/api/agents/:id` | Get agent by ID |
| PUT | `/api/agents/:id` | Update agent |
| POST | `/api/agents/:id/call` | Track agent call (increment stats) |
| DELETE | `/api/agents/:id` | Deactivate agent |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/rooms` | List chat rooms |
| POST | `/api/chat/rooms` | Create chat room |
| GET | `/api/chat/rooms/:id/messages` | Get room messages |
| POST | `/api/chat/rooms/:id/messages` | Send message |

### IPFS

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ipfs/uploads` | List IPFS uploads |
| POST | `/api/ipfs/uploads` | Track new upload |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/events` | List events |
| POST | `/api/analytics/events` | Track new event |

## Deploy to Railway

### Method 1: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add

# Set environment variables
railway variables set FRONTEND_URL=https://your-frontend.vercel.app
railway variables set JWT_SECRET=your-secret-key

# Deploy
railway up
```

### Method 2: Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add PostgreSQL database
5. Set environment variables:
   - `DATABASE_URL` (automatically set by Railway)
   - `FRONTEND_URL`
   - `JWT_SECRET`
6. Deploy!

Railway will automatically:
- Install dependencies
- Generate Prisma client
- Push database schema
- Start the server

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS |
| `JWT_SECRET` | ✅ | Secret for JWT tokens |
| `PORT` | ❌ | Server port (default: 3000) |
| `NODE_ENV` | ❌ | Environment (production/development) |

## Database Schema

See `prisma/schema.prisma` for full schema.

**Models:**
- `User` - User profiles and preferences
- `Task` - Tasks with blockchain sync
- `Agent` - Registered agents
- `ChatRoom` - Chat rooms
- `ChatMessage` - Messages
- `IPFSUpload` - IPFS upload tracking
- `AnalyticsEvent` - Analytics events
- `WebhookSubscription` - Webhooks (future)

## Syncing with Blockchain

Tasks are stored both in database (for fast queries) and on blockchain (source of truth).

**Sync flow:**

```javascript
// Frontend creates task on blockchain
const tx = await taskEscrow.createTask(...);
const taskId = getTaskIdFromEvent(tx);

// Frontend saves to database
await fetch('/api/tasks', {
  method: 'POST',
  body: JSON.stringify({
    taskId,
    title,
    description,
    requester: userAddress,
    txHash: tx.hash
  })
});

// Backend periodically syncs status from blockchain
// (Called by frontend or cron job)
await fetch('/api/tasks/sync', {
  method: 'POST',
  body: JSON.stringify({
    tasks: blockchainTasks
  })
});
```

## Frontend Integration

Update frontend to use backend API:

```javascript
// frontend/src/lib/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function getUser(address) {
  const res = await fetch(`${API_URL}/users/${address}`);
  return res.json();
}

export async function createTask(taskData) {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  return res.json();
}

export async function getTasks(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_URL}/tasks?${params}`);
  return res.json();
}
```

## Development

```bash
# Watch mode
npm run dev

# View database in browser
npm run db:studio

# Reset database
npx prisma migrate reset

# Generate Prisma client (after schema changes)
npm run db:generate
```

## Production Checklist

- ✅ Set `NODE_ENV=production`
- ✅ Use strong `JWT_SECRET`
- ✅ Configure `FRONTEND_URL` correctly
- ✅ Enable Railway PostgreSQL backups
- ✅ Set up monitoring (Railway metrics)
- ✅ Configure rate limiting
- ✅ Add logging (Sentry/LogRocket)

## Troubleshooting

**Database connection error:**
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

**Prisma client not generated:**
```bash
npm run db:generate
```

**Railway deployment fails:**
```bash
# Check logs
railway logs

# Ensure buildCommand runs
railway run npm run db:generate
```

## License

MIT
