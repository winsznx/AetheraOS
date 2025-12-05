# AetheraOS 🚀

> Decentralized AI Agent Platform for Blockchain Intelligence

[![Nullshot Hacks S0](https://img.shields.io/badge/Nullshot-Hacks%20S0-blue)](https://nullshot.ai)
[![MCP](https://img.shields.io/badge/MCP-Powered-green)](https://modelcontextprotocol.io)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**AetheraOS** is a decentralized platform for deploying, discovering, and interacting with autonomous AI agents that provide real-time blockchain intelligence. Built on the Model Context Protocol (MCP) with Claude AI and Thirdweb x402 micropayments.

## 🎯 What is AetheraOS?

AetheraOS enables anyone to:
- **Deploy** custom AI agents with blockchain capabilities
- **Discover** agents in a decentralized marketplace
- **Interact** with agents using natural language
- **Pay** for agent services using x402 micropayments
- **Earn** by creating and sharing agents

## ✨ Key Features

### 🤖 Autonomous Agent Chat
- Natural language blockchain queries
- AI-powered execution planning with Claude 3.5
- Real-time blockchain data via ChainIntel MCP
- x402 micropayment integration

### 🏪 Agent Marketplace
- Discover blockchain intelligence agents
- Reviews and ratings system
- Filter by capabilities and categories
- Usage statistics and analytics

### 🚀 One-Click Agent Deployment
- Deploy to Cloudflare Workers
- Configure pricing (x402 or flat fee)
- Select capabilities and tools
- Automatic registration

### 🔧 ChainIntel MCP Tools
- `analyze-wallet`: Comprehensive wallet analysis
- `detect-whales`: Identify large holders
- `smart-money-tracker`: Track successful traders
- `risk-score`: Wallet risk assessment
- `trading-patterns`: Analyze trading behavior

### 📊 Task Management
- Create and track agent tasks
- Real-time status updates
- Blockchain synchronization
- Complete task history

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│  Marketplace | Deploy | Chat | Tasks    │
└────────┬────────────────────────────────┘
         │
         ├──► Backend API (Express + PostgreSQL)
         │    └─► User data, persistence, analytics
         │
         ├──► Cloudflare Workers
         │    ├─► Autonomous Agent (Claude AI)
         │    └─► ChainIntel MCP (Moralis API)
         │
         ├──► Thirdweb
         │    ├─► Wallet Auth
         │    └─► x402 Payments
         │
         └──► Base Sepolia Testnet
              └─► On-chain verification
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Cloudflare account (for Workers)
- API Keys:
  - Anthropic (Claude AI)
  - Moralis (Blockchain data)
  - Thirdweb (Web3 infrastructure)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AetheraOS.git
cd AetheraOS
```

#### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values:
# DATABASE_URL=postgresql://user:password@localhost:5432/aetheraos
# FRONTEND_URL=http://localhost:5173
# ALLOWED_ORIGINS=http://localhost:5173

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start backend
npm run dev
```

Backend will run on `http://localhost:3000`

#### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values:
# VITE_API_URL=http://localhost:3000/api
# VITE_AGENT_URL=https://your-agent.workers.dev
# VITE_THIRDWEB_CLIENT_ID=your_client_id

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

#### 4. Deploy Autonomous Agent (Cloudflare Workers)

```bash
cd ../autonomous-agent

# Install dependencies
npm install

# Create wrangler.toml
cp wrangler.toml.example wrangler.toml

# Edit wrangler.toml with your account details

# Set secrets
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put SERVER_WALLET

# Deploy
npx wrangler deploy
```

#### 5. Deploy ChainIntel MCP (Cloudflare Workers)

```bash
cd ../mcps/chainintel-mcp

# Install dependencies
npm install

# Set secrets
npx wrangler secret put MORALIS_API_KEY
npx wrangler secret put ANTHROPIC_API_KEY

# Deploy
npx wrangler deploy
```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/aetheraos
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_AGENT_URL=https://your-agent.workers.dev
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

### Autonomous Agent (Cloudflare Secrets)
```env
ANTHROPIC_API_KEY=your_claude_api_key
CHAININTEL_URL=https://chainintel-mcp.workers.dev
SERVER_WALLET=0x...
```

### ChainIntel MCP (Cloudflare Secrets)
```env
MORALIS_API_KEY=your_moralis_api_key
ANTHROPIC_API_KEY=your_claude_api_key
NETWORK=testnet
```

## 📖 Usage Guide

### 1. Connect Wallet
- Click "Connect Wallet" in the navigation
- Approve connection with your Web3 wallet
- Switch to Base Sepolia testnet

### 2. Chat with Agent
- Navigate to "AI Agent" page
- Ask a blockchain question (e.g., "Analyze wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4")
- Review the execution plan and cost
- Approve x402 payment
- View real-time results

### 3. Deploy Your Agent
- Go to "Deploy Agent" page
- Fill in agent details (name, description, endpoint)
- Select capabilities
- Configure pricing
- Deploy to Cloudflare Workers

### 4. Browse Marketplace
- Visit "Marketplace" page
- Search and filter agents
- View agent details and reviews
- Click to interact with agents

### 5. Manage Tasks
- Navigate to "Tasks" page
- Create new tasks for agents
- Track execution status
- View task history

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## 📁 Project Structure

```
AetheraOS/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── lib/             # API clients
│   │   └── store/           # State management
│   └── package.json
│
├── backend/                  # Express backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   └── utils/           # Utilities
│   ├── prisma/              # Database schema
│   └── package.json
│
├── autonomous-agent/         # Cloudflare Worker
│   ├── src/
│   │   ├── reasoning/       # AI planning & synthesis
│   │   ├── orchestrator/    # Execution engine
│   │   ├── payment/         # x402 integration
│   │   └── mcp-clients/     # MCP client
│   └── wrangler.toml
│
└── mcps/
    └── chainintel-mcp/      # ChainIntel MCP Server
        ├── src/
        │   ├── apis/        # Moralis & Claude
        │   └── tools/       # MCP tools
        └── wrangler.toml
```

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Thirdweb** - Web3 SDK
- **Wagmi** - React hooks for Ethereum
- **TailwindCSS** - Styling

### Backend
- **Express** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **Socket.IO** - Real-time communication

### Workers
- **Cloudflare Workers** - Serverless compute
- **Claude 3.5 Sonnet** - AI reasoning
- **Moralis API** - Blockchain data
- **Thirdweb x402** - Micropayments

## 🎬 Demo Video

[Watch the 4-minute demo](https://youtube.com/...)

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [MCP Integration](docs/MCP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Nullshot Hacks S0

This project is submitted for **Nullshot Hacks S0** competition.

**Track**: 1a - Brainstorm Submission  
**Tags**: `Nullshot Hacks S0`, `MCP`, `AI Agents`, `Web3`

## 🔗 Links

- **Live Demo**: https://aethera-os.vercel.app
- **Backend API**: https://aetheraos-backend.railway.app
- **Autonomous Agent**: https://aetheraos-autonomous-agent.workers.dev
- **ChainIntel MCP**: https://chainintel-mcp.workers.dev

## 👥 Team

Built by a solo developer passionate about decentralized AI and Web3.

## 🙏 Acknowledgments

- **Nullshot** for hosting the hackathon
- **Anthropic** for Claude AI
- **Thirdweb** for Web3 infrastructure
- **Moralis** for blockchain data
- **Cloudflare** for Workers platform

---

**Built with ❤️ for Nullshot Hacks S0**

*Where AI Meets Blockchain Intelligence*
