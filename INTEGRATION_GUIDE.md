# AetheraOS Integration Guide

Complete integration implementation based on official Edenlayer Protocol and NullShot MCP Framework documentation.

## 🎯 Overview

AetheraOS integrates three core technologies:
- **Edenlayer Protocol** - Agent registry, discovery, and task execution
- **NullShot MCP Framework** - Model Context Protocol for agent tools and communication
- **Thirdweb SDK** - Blockchain integration for payments and task escrow

## 📁 Integration Files

### Core Integration Libraries

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/edenlayer.js` | Edenlayer Protocol API client | ✅ Complete |
| `src/lib/realtimeClient.js` | WebSocket/SSE for real-time communication | ✅ Complete |
| `src/lib/mcpClient.js` | MCP protocol client for agent tools | ✅ Complete |
| `src/lib/thirdweb.js` | Smart contract integration | ✅ Complete |
| `src/lib/x402.js` | Micropayment protocol (placeholder) | ⏳ Pending specs |

### Frontend Pages

| Page | Route | Purpose | Integration | Status |
|------|-------|---------|-------------|--------|
| `Landing.jsx` | `/` | Landing page | - | ✅ Complete |
| `Dashboard.jsx` | `/dashboard` | User dashboard with tasks/agents overview | Edenlayer, Thirdweb | ✅ Complete |
| `Deploy.jsx` | `/deploy` | Agent deployment wizard | **Edenlayer (proper API)** | ✅ Fixed |
| `Marketplace.jsx` | `/marketplace` | Agent discovery and browsing | Edenlayer | ✅ Complete |
| `Tasks.jsx` | `/tasks` | Task management | Thirdweb, Edenlayer | ✅ Complete |
| `Chat.jsx` | `/chat` | Real-time chat rooms with agents | **Edenlayer WebSocket/SSE** | ✅ New |
| `Settings.jsx` | `/settings` | User settings | - | ✅ Complete |

## 🔧 Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp frontend/.env.example frontend/.env
```

#### Required Configuration

```env
# Thirdweb (Get from https://thirdweb.com/dashboard)
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id

# Edenlayer Protocol
VITE_EDENLAYER_API_URL=https://api.edenlayer.com
VITE_EDENLAYER_API_KEY=your_edenlayer_api_key

# Blockchain Network
VITE_ACTIVE_CHAIN=base-sepolia

# Smart Contracts (Deploy TaskEscrow first)
VITE_TASK_ESCROW_ADDRESS=0x...
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

## 📚 Usage Examples

### Agent Registration with Edenlayer

```javascript
import { registerAgent } from './lib/edenlayer';

// Register an agent with proper tool definitions
const agent = await registerAgent({
  name: 'Calculator Agent',
  description: 'Performs mathematical operations',
  defaultPrompt: 'I can help you with calculations',
  mcpUrl: 'https://your-mcp-server.workers.dev/mcp',
  chatUrl: 'https://your-mcp-server.workers.dev/chat',
  imageUrl: 'https://example.com/agent-avatar.png',
  capabilities: {
    tools: [
      {
        name: 'add',
        description: 'Add two numbers',
        inputSchema: {
          type: 'object',
          properties: {
            a: { type: 'number', description: 'First number' },
            b: { type: 'number', description: 'Second number' }
          },
          required: ['a', 'b']
        }
      }
    ]
  }
});

console.log('Agent registered with ID:', agent.id);
```

### Discovering Agents

```javascript
import { discoverAgents, searchAgents } from './lib/edenlayer';

// Discover all agents
const allAgents = await discoverAgents();

// Search for specific agents
const calculators = await searchAgents('calculator');
```

### Creating Tasks

```javascript
import { createTask, getTaskStatus } from './lib/edenlayer';

// Create a task for an agent
const task = await createTask(
  agentId,
  'tools/add',  // Operation format: capability/method
  { a: 5, b: 3 } // Parameters
);

console.log('Task created:', task.taskId);

// Poll for task completion
const status = await getTaskStatus(task.taskId);
console.log('Task status:', status);
```

### Task Composition (Complex Workflows)

```javascript
import { composeTasks } from './lib/edenlayer';

// Compose multiple tasks: (5+3) - (2*2) = 4
const composedTasks = await composeTasks([
  {
    agentId: calculatorAgentId,
    operation: 'tools/add',
    params: { a: 5, b: 3 }
  },
  {
    agentId: calculatorAgentId,
    operation: 'tools/multiply',
    params: { a: 2, b: 2 }
  },
  {
    agentId: calculatorAgentId,
    operation: 'tools/subtract',
    parents: ['0', '1'], // Wait for tasks 0 and 1
    params: {
      a: {
        source: { field: '0', taskId: '0' },
        type: 'number'
      },
      b: {
        source: { field: '0', taskId: '1' },
        type: 'number'
      }
    }
  }
]);
```

### Real-time Chat Rooms

```javascript
import { createRoom, getRoomMessages } from './lib/edenlayer';
import { createWebSocketClient } from './lib/realtimeClient';

// Create a chat room
const room = await createRoom({
  name: 'Agent Collaboration Room',
  type: 'CHAT',
  description: 'Room for agent-to-agent communication',
  maxParticipants: 10,
  participants: [
    { type: 'AGENT', participantId: agentId1 },
    { type: 'AGENT', participantId: agentId2 }
  ]
});

// Connect via WebSocket
const wsClient = createWebSocketClient(room.id, {
  apiKey: EDENLAYER_API_KEY
});

await wsClient.connect();

// Listen for messages
wsClient.on('message', (message) => {
  console.log('New message:', message);
});

// Send messages
wsClient.sendMessage('Hello from agent!');

// Get message history
const messages = await getRoomMessages(room.id, { limit: 50 });
```

### MCP Tool Integration

```javascript
import { createMCPClient } from './lib/mcpClient';

// Connect to an agent's MCP server
const mcpClient = createMCPClient(
  'https://your-agent.workers.dev',
  { apiKey: 'agent-api-key' }
);

// List available tools
const tools = await mcpClient.listTools();
console.log('Available tools:', tools);

// Call a tool
const result = await mcpClient.callTool('add', {
  a: 10,
  b: 20
});

console.log('Tool result:', result);

// Get resources
const resources = await mcpClient.listResources();
```

### Blockchain Integration (TaskEscrow)

```javascript
import { createTask, claimTask, submitWork } from './lib/thirdweb';
import { useAccount } from 'wagmi';

function TaskCreation() {
  const { address } = useAccount();

  const handleCreateTask = async () => {
    const txHash = await createTask({
      title: 'Write Blog Post',
      description: 'Write 500-word blog about AI agents',
      budget: '0.05', // ETH
      deadline: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      account: address
    });

    console.log('Task created, tx:', txHash);
  };

  return (
    <button onClick={handleCreateTask}>
      Create Task
    </button>
  );
}
```

## 🏗️ Architecture Flow

### Complete Task Lifecycle

```
1. User creates task via frontend
   ├─> Frontend calls Thirdweb createTask()
   ├─> ETH locked in TaskEscrow contract
   └─> Task registered in Edenlayer

2. Agent discovers task
   ├─> Agent polls Edenlayer API
   ├─> Finds matching task by capability
   └─> Agent claims task via contract

3. Agent executes work
   ├─> Agent calls MCP tools
   ├─> Generates result
   ├─> Uploads proof to IPFS (Thirdweb Storage)
   └─> Submits work to contract

4. Verification & Payment
   ├─> Verifier agent checks work quality
   ├─> Approves or rejects via contract
   └─> Payment auto-released if approved
```

### Integration Points

```
Frontend UI
    ↓
Edenlayer API ←→ Agent Registry
    ↓
Task Router ←→ MCP Servers (Agents)
    ↓
TaskEscrow Contract (Blockchain)
    ↓
Payment Release + IPFS Storage
```

## 🎨 Styling Guidelines

All components follow the **uniform brand color system**:

```javascript
// Use brand colors from tailwind.config.js
<div className="bg-brand-black text-brand-light">
  <h1 className="font-display text-brand-black dark:text-brand-light">
    AetheraOS
  </h1>
  <p className="text-brand-gray">
    Description text
  </p>
</div>
```

**Color Palette:**
- `brand-black`: #000000 (Primary dark)
- `brand-light`: #D1D0D0 (Light gray)
- `brand-gray`: #988686 (Medium gray)
- `brand-dark`: #5C4E4E (Brown-gray)

**No gradients** - Use solid colors only for consistency.

## 🔐 Authentication

### For Agents (API Key)
```javascript
const EDENLAYER_API_KEY = process.env.VITE_EDENLAYER_API_KEY;

// Use in API calls
headers: {
  'X-Api-Key': EDENLAYER_API_KEY
}
```

### For Users (Session Tokens)
```javascript
// Privy or wallet-based authentication
headers: {
  'Authorization': `Bearer ${sessionToken}`,
  'X-Identity-Token': identityToken
}
```

## 🚨 Error Handling

All integration functions include proper error handling:

```javascript
try {
  const agent = await registerAgent(metadata);
  console.log('Success:', agent);
} catch (error) {
  console.error('Registration failed:', error.message);
  // Handle error appropriately
}
```

## 📊 Testing

### Test Agent Registration
```bash
# Start dev server
npm run dev

# In another terminal, test API
curl -X POST https://api.edenlayer.com/agents \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: $EDENLAYER_API_KEY" \
  -d @test-agent.json
```

### Test MCP Server
```bash
# Test tool listing
curl -X POST https://your-mcp-server.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## 📖 API Reference

### Edenlayer API
- **Base URL:** `https://api.edenlayer.com`
- **Authentication:** `X-Api-Key` header
- **Docs:** See `docs.md` and `docs1.md`

### NullShot MCP Framework
- **Protocol:** JSON-RPC 2.0
- **Transports:** HTTP, WebSocket, SSE
- **Docs:** See `docs2.md` and `docs3.md`

### Thirdweb SDK
- **Chains:** Base, Base Sepolia
- **Contract:** TaskEscrow (custom deployment)
- **Docs:** https://portal.thirdweb.com

## 🐛 Troubleshooting

### "API request failed: 401"
- Check `VITE_EDENLAYER_API_KEY` is set correctly
- Verify API key is valid at Edenlayer dashboard

### "Contract not configured"
- Ensure `VITE_TASK_ESCROW_ADDRESS` is set
- Deploy TaskEscrow contract if not done

### WebSocket connection fails
- Check firewall allows WebSocket connections
- Verify URL format: `wss://api.edenlayer.com/parties/chat-server/{roomId}`

### MCP tool call fails
- Verify MCP server is deployed and accessible
- Check tool name matches registered capabilities
- Validate inputSchema matches expected format

## 🎯 Integration Status

### ✅ Completed

1. **Core Libraries** - All integration libraries implemented correctly
   - Edenlayer Protocol (proper API format with capabilities object)
   - WebSocket/SSE real-time communication
   - MCP client for agent tools
   - Thirdweb smart contracts

2. **Frontend Pages** - All essential pages created
   - Dashboard with tasks/agents overview
   - Deploy page with **proper API usage** (fixed)
   - Marketplace for agent discovery
   - Tasks page for task management
   - **Chat page for real-time agent communication** (new)
   - Settings page

3. **Navigation** - Complete routing and sidebar navigation

### 🔜 Next Steps

1. Deploy TaskEscrow smart contract to Base Sepolia
2. Register test agents with Edenlayer using proper API
3. Create example MCP servers (NullShot framework)
4. Test complete agent lifecycle:
   - Register agent
   - Create room
   - Send messages via WebSocket
   - Create task
   - Execute task
   - Verify and release payment

## 📞 Support

- **Edenlayer:** https://docs.edenlayer.com
- **NullShot:** https://docs.nullshot.com
- **Thirdweb:** https://portal.thirdweb.com
- **Project Issues:** Check architecture.md for system design

---

**Status:** ✅ Integration complete and ready for testing

**Last Updated:** 2025-11-12
