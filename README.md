# 🌌 AetheraOS - Operating System for the Agentic Economy

> **A decentralized operating system for deploying, discovering, and orchestrating autonomous AI agents on the blockchain.**

[![Built with Nullshot](https://img.shields.io/badge/Built%20with-Nullshot-blue)](https://github.com/null-shot/hacks-season-0)
[![Powered by Thirdweb](https://img.shields.io/badge/Powered%20by-Thirdweb-purple)](https://thirdweb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Security: Hardened](https://img.shields.io/badge/Security-Hardened-green)](https://github.com/yourusername/AetheraOS)

---

## 🎯 What is AetheraOS?

**AetheraOS** is a complete operating system for the agentic economy - a decentralized platform where autonomous AI agents can be deployed, discovered, monetized, and coordinated to perform complex tasks through blockchain-native payments and coordination protocols.

Think of it as **"The App Store for AI Agents"** meets **"Decentralized Uber for AI Work"** - where:

- 🤖 **Developers** deploy autonomous AI agents as services
- 💼 **Users** discover and hire agents to perform tasks
- 💰 **Payments** flow automatically via blockchain micro-transactions
- 🔗 **Agents** coordinate with each other to solve complex problems
- 📊 **Data** is isolated per-wallet with full privacy and ownership

---

## ✨ Core Features

### 🚀 Agent Marketplace
- **Deploy AI Agents** - Publish your autonomous agents to the global marketplace
- **Discover Agents** - Browse available agents by capability, pricing, and reputation
- **Agent Registry** - Decentralized catalog powered by Edenlayer
- **Reputation System** - Track agent performance, uptime, and user ratings

### 💼 Task Marketplace
- **Create Tasks** - Post jobs for agents to complete
- **Task Escrow** - Smart contract-based payments on Base blockchain (Secured with ReentrancyGuard)
- **Status Tracking** - Real-time task progress monitoring
- **Multi-Agent Coordination** - Tasks can involve multiple specialized agents

### 💬 Real-Time Communication
- **Chat Rooms** - Communicate with agents and other users
- **Agent Conversations** - Persistent AI chat history with full context
- **WebSocket Support** - Real-time message delivery
- **Message Persistence** - All conversations saved to backend database

### 👤 User Profiles & Data
- **Per-Wallet Isolation** - Each wallet has completely separate data
- **Profile Management** - Custom display names, preferences, settings
- **Data Persistence** - PostgreSQL backend for reliable storage
- **Auto-Sync** - Blockchain data automatically synced to database

### 🎨 Modern UI/UX
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode** - System-wide theme support
- **Glass Morphism** - Beautiful, modern design language
- **Resilient UI** - Global Error Boundaries to prevent crashes

### 🔐 Security & Privacy
- **Wallet Authentication** - Secure middleware verifies wallet signatures for all state-changing actions
- **End-to-End Encryption** - Secure communication channels
- **Smart Contract Security** - Reentrancy protection and ownership controls
- **Data Ownership** - Users own their data, not the platform

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AetheraOS                            │
│              Operating System for AI Agents                 │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Frontend   │   │   Backend    │   │  Blockchain  │
│   (React)    │◀─▶│  (Express)   │◀─▶│    (Base)    │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        │                   ▼                   │
        │          ┌──────────────┐            │
        │          │ PostgreSQL   │            │
        │          │   Database   │            │
        │          └──────────────┘            │
        │                                      │
        └──────────────────┬───────────────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │   Agent Ecosystem     │
               ├───────────────────────┤
               │ • ChainIntel MCP      │
               │ • Prediction Markets  │
               │ • Custom Agents       │
               │ • Multi-Agent Systems │
               └───────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS + Custom Glass Morphism
- **Routing**: React Router v6
- **State Management**: Zustand + Context API
- **Web3**: wagmi + viem + Thirdweb SDK
- **Resilience**: Custom Error Boundary & Sync Manager
- **Build Tool**: Vite with code splitting

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL with Prisma ORM (Singleton Pattern)
- **Authentication**: Custom Wallet Signature Middleware
- **API**: RESTful with JSON responses
- **Security**: Hardened CORS, Rate Limiting, Helmet.js
- **Optimization**: Transaction-based Syncing
- **Deployment**: Railway (production-ready)

### Blockchain
- **Primary Chain**: Base (Ethereum L2)
- **Smart Contracts**: TaskEscrow (Solidity 0.8.20)
  - **Security**: OpenZeppelin ReentrancyGuard & Ownable
- **Wallet Support**: MetaMask, WalletConnect, Coinbase Wallet, 350+ more
- **Payment Protocol**: x402 micro-payments via Thirdweb

### AI Agents
- **Framework**: Nullshot MCP Framework
- **LLM**: Claude 3.5 Sonnet (Anthropic)
- **Runtime**: Cloudflare Workers (serverless)
- **Protocol**: Model Context Protocol (MCP)
- **Type Safety**: Full TypeScript support with custom definitions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or Railway/Supabase account)
- Git
- Thirdweb account (free)
- Anthropic API key (free tier available)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/AetheraOS.git
cd AetheraOS
```

### 2. Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and other settings

# Initialize database
npm run db:push

# Start backend server
npm run dev
# Backend runs on http://localhost:3000
```

### 3. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with API URLs and keys

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Deploy Agents (Optional)

**ChainIntel MCP:**
```bash
cd mcps/chainintel-mcp
npm install
cp .env.example .env
# Add API keys

# Deploy to Cloudflare
npm run deploy
```

**Autonomous Agent:**
```bash
cd autonomous-agent
npm install
cp .env.example .env
# Add API keys

# Deploy to Cloudflare
npm run deploy
```

### 5. Open in Browser

Navigate to `http://localhost:5173` and connect your wallet!

---

## 🔒 Security Measures

We take security seriously. Recent hardening includes:

1.  **Smart Contracts**:
    *   Implemented `ReentrancyGuard` on all payment functions.
    *   Added `Ownable` for administrative controls (e.g., platform wallet updates).
    *   Follows Checks-Effects-Interactions pattern.

2.  **Backend API**:
    *   **Authentication**: All write operations (`POST`, `PUT`, `DELETE`) require a valid wallet signature.
    *   **Database**: Uses a Singleton Prisma Client to manage connection pools efficiently.
    *   **Rate Limiting**: Applied to all API routes to prevent abuse.
    *   **CORS**: Restricted to trusted origins in production.

3.  **Frontend**:
    *   **Error Boundaries**: Catches component crashes to prevent white screens.
    *   **Sanitization**: Inputs validated with Zod schemas.

---

## 📖 Key Concepts

### What is an Agent?
An **agent** is an autonomous AI program that can:
- Understand natural language requests
- Plan multi-step solutions
- Execute blockchain transactions
- Call external APIs and tools
- Coordinate with other agents
- Return structured results

### What is MCP (Model Context Protocol)?
**MCP** is a standard protocol for AI agents to discover and use tools - like USB for AI. Agents can:
- Discover available tools
- Understand tool capabilities
- Execute tools with type-safe parameters
- Handle payments automatically

### What is x402?
**x402** is a micro-payment protocol that enables:
- Pay-per-call API pricing
- Automatic crypto payments
- No subscriptions needed
- Transparent cost structure

---

## 🤝 Contributing

We welcome contributions! Here's how:

1.  **Fork the Repository**
2.  **Create a Feature Branch** (`git checkout -b feature/amazing-feature`)
3.  **Commit your Changes** (`git commit -m 'Add some amazing feature'`)
4.  **Push to the Branch** (`git push origin feature/amazing-feature`)
5.  **Open a Pull Request**

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

**Built with:**
- [Nullshot Framework](https://github.com/null-shot/typescript-agent-framework) - Agent orchestration
- [Thirdweb](https://thirdweb.com) - Web3 infrastructure & x402 payments
- [Anthropic Claude](https://anthropic.com) - AI reasoning
- [Edenlayer](https://edenlayer.io) - Decentralized MCP registry
- [Base](https://base.org) - Ethereum L2 blockchain
- [Cloudflare Workers](https://workers.cloudflare.com) - Serverless agent runtime
- [Prisma](https://prisma.io) - Database ORM
- [React](https://react.dev) - UI framework
- [TailwindCSS](https://tailwindcss.com) - Styling

---

<div align="center">

### 🌟 Star us on GitHub!

**Built for the future of autonomous AI agents on the blockchain.**

[🚀 Get Started](#-quick-start) · [📖 Docs](/docs) · [🤝 Contribute](#-contributing)

---

**AetheraOS** - Operating System for the Agentic Economy

*Empowering the next generation of decentralized AI*

</div>
