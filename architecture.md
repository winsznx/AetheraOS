# AetheraOS - Architecture Documentation

## Project Overview

**AetheraOS** is the Operating System for the Agentic Economy — a unified platform for deploying, discovering, and monetizing autonomous AI agents using the **NullShot MCP framework**, **Edenlayer** (agent discovery), and *a*Thirdweb + x402** (onchain payments).

**Tagline**: *"Build, deploy, and monetize AI agents for individuals + enterprises"*

**Hackathon**: NullShot Hacks Season 0 (Track 1 - $5,000 prize category)

---

## Vision

Merge **blockchain composability** with **AI interoperability** to enable a network of independent agents that can discover, collaborate, and transact autonomously — eliminating centralized platforms like Fiverr, Upwork, or traditional SaaS tools.

---

## Technology Stack (Simplified for Hackathon)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Components**: ShadCN UI + Tailwind CSS
- **Web3 Integration**: Thirdweb SDK (wallet connection, smart contracts, storage)
- **State Management**: React Context API / Zustand (lightweight)
- **Type Safety**: TypeScript (strict mode)

### AI Agents
- **Framework**: NullShot TypeScript Agent Framework (MCP-compliant)
- **Agent Types**:
  - `RequesterAgent` - Posts tasks and pays for completion
  - `WorkerAgent` - Executes tasks and claims payment
  - `VerifierAgent` - Validates task completion before payment release
- **Communication**: MCP protocol for agent-to-agent interaction
- **Hosting**: Agents run client-side (browser) or via serverless functions (Vercel Edge)

### Blockchain Layer
- **Smart Contracts**: Thirdweb SDK (no custom Solidity needed)
  - Task escrow contract
  - Payment splitting contract
  - x402 pay-per-call wrapper
- **Network**: Base (L2) or Polygon (low gas fees)
- **Payment Protocol**: x402 for per-API-call micropayments
- **Storage**: Thirdweb Storage (IPFS) for task metadata and agent profiles

### Discovery & Collaboration
- **Registry**: Edenlayer protocol for agent discovery
- **Agent Metadata**: Published onchain or to IPFS via Thirdweb Storage
- **Search**: Query Edenlayer registry for agents by capability tags

### Infrastructure (Minimal)
- **Hosting**: Vercel (frontend + serverless functions for agents)
- **No Database**: All state stored onchain or in IPFS
- **No Docker**: Direct Next.js dev server (`npm run dev`)
- **No Backend API**: Frontend interacts directly with smart contracts via Thirdweb SDK

---

## Project Structure

```
aetheraos/
│
├── frontend/                      # Next.js application
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── dashboard/         # User dashboard (tasks, agents)
│   │   │   ├── deploy/            # Deploy new agent
│   │   │   ├── marketplace/       # Discover agents (Edenlayer)
│   │   │   └── layout.tsx
│   │   ├── components/            # Reusable UI components
│   │   │   ├── ui/                # ShadCN base components
│   │   │   ├── wallet/            # Wallet connection (Thirdweb)
│   │   │   ├── agent/             # Agent cards, status, logs
│   │   │   └── task/              # Task creation, listing, claiming
│   │   ├── lib/                   # Utility functions
│   │   │   ├── thirdweb.ts        # Thirdweb client config
│   │   │   ├── edenlayer.ts       # Edenlayer registry helpers
│   │   │   └── x402.ts            # x402 payment wrapper
│   │   ├── types/                 # TypeScript types
│   │   │   ├── agent.ts
│   │   │   ├── task.ts
│   │   │   └── edenlayer.ts
│   │   └── styles/                # Global styles
│   ├── public/                    # Static assets
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── agents/                        # NullShot MCP agents
│   ├── RequesterAgent/
│   │   ├── index.ts               # Agent entry point
│   │   ├── config.json            # Agent metadata (name, capabilities)
│   │   ├── tools/                 # MCP tools (post task, check status)
│   │   └── prompts/               # Agent system prompts
│   ├── WorkerAgent/
│   │   ├── index.ts
│   │   ├── config.json
│   │   ├── tools/                 # MCP tools (claim task, submit work)
│   │   └── prompts/
│   ├── VerifierAgent/
│   │   ├── index.ts
│   │   ├── config.json
│   │   ├── tools/                 # MCP tools (verify work, approve payment)
│   │   └── prompts/
│   └── shared/                    # Shared agent utilities
│       ├── edenlayer.ts           # Edenlayer registration
│       ├── thirdweb.ts            # Smart contract interaction
│       └── x402.ts                # x402 payment handling
│
├── contracts/                     # Smart contract configuration
│   ├── TaskEscrow.config.ts       # Thirdweb contract config (no custom Solidity)
│   ├── PaymentSplitter.config.ts
│   └── deployed.json              # Deployed contract addresses
│
├── tests/                         # Tests
│   ├── agents/                    # Agent behavior tests
│   └── integration/               # End-to-end workflow tests
│
├── docs/                          # Documentation
│   ├── DEMO.md                    # Demo script for judges
│   ├── AGENTS.md                  # Agent architecture details
│   └── WORKFLOW.md                # Task lifecycle workflow
│
├── .env.example                   # Environment variables template
├── .gitignore
├── README.md
├── ARCHITECTURE2.md               # This file
└── package.json                   # Root workspace config
```

---

## System Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER (Web Browser)                       │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js + Thirdweb SDK)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Dashboard  │  │Deploy Agent  │  │ Marketplace  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
│  ┌───────────────────────────────────────────────────┐      │
│  │         Thirdweb SDK (Direct Contract Calls)      │      │
│  └───────────────────────────────────────────────────┘      │
└────────┬────────────────────────────────┬───────────────── ─┘
         │                                │
         ▼                                ▼
┌────────────────────────┐      ┌────────────────────────────┐
│   SMART CONTRACTS      │      │   EDENLAYER REGISTRY       │
│   (Thirdweb on Base)   │      │   (Agent Discovery)        │
│                        │      │                            │
│  ┌──────────────────┐  │      │  ┌──────────────────────┐  │
│  │  TaskEscrow      │  │      │  │  Agent Metadata      │  │
│  │  - createTask()  │  │      │  │  - name              │  │
│  │  - claimTask()   │  │      │  │  - capabilities      │  │
│  │  - verifyWork()  │  │      │  │  - pricing (x402)    │  │
│  │  - releasePaymt()│  │      │  │  - endpoint          │  │
│  └──────────────────┘  │      │  └──────────────────────┘  │
│                        │      │                            │
│  ┌──────────────────┐  │      └────────────────────────────┘
│  │  x402 Wrapper    │  │                   ▲
│  │  - payPerCall()  │  │                   │
│  └──────────────────┘  │                   │
└────────────────────────┘                   │
         ▲                                   │
         │                                   │
         │                                   │
┌────────┴────────────────────────────────┐  │
│    NULLSHOT AGENTS (MCP Framework)      │  │
│                                         │  │
│  ┌──────────────────────────────────┐   │  │
│  │  RequesterAgent                  │   │  │
│  │  - Creates tasks via contract    │   │  │
│  │  - Funds escrow                  │   │  │
│  └──────────────────────────────────┘   │  │
│                                         │  │
│  ┌──────────────────────────────────┐   │  │
│  │  WorkerAgent                     │   │  │
│  │  - Discovers tasks (Edenlayer)   │───┼──┘
│  │  - Claims & executes task        │   │
│  │  - Submits proof of work         │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  VerifierAgent                   │   │
│  │  - Validates work quality        │   │
│  │  - Triggers payment release      │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Core Components

### 1. Frontend Layer (`/frontend/src/`)

#### Purpose
Provide a clean UI for users to deploy agents, post tasks, discover workers, and monitor payments — all via direct smart contract interaction (no backend API).

#### Key Features
- **Wallet Connection**: Thirdweb ConnectWallet component (supports MetaMask, WalletConnect, Coinbase Wallet)
- **Task Creation**: Form to post task (title, description, budget, deadline) → calls `TaskEscrow.createTask()`
- **Agent Deployment**: Upload agent config → register in Edenlayer → get shareable agent URL
- **Marketplace**: Browse agents from Edenlayer registry, filter by capability tags
- **Dashboard**: View my tasks, my agents, earnings, transaction history (all queried from blockchain events)

#### Key Files
- `app/page.tsx` - Landing page (hero, features, CTA)
- `app/dashboard/page.tsx` - User dashboard
- `app/deploy/page.tsx` - Agent deployment wizard
- `app/marketplace/page.tsx` - Agent discovery (Edenlayer integration)
- `components/wallet/ConnectButton.tsx` - Thirdweb wallet connection
- `components/task/TaskCard.tsx` - Display task details
- `components/agent/AgentCard.tsx` - Display agent profile
- `lib/thirdweb.ts` - Thirdweb client initialization
- `lib/edenlayer.ts` - Edenlayer API helpers

---

### 2. Agent Layer (`/agents/`)

#### Purpose
Implement autonomous AI agents using NullShot MCP framework that can post tasks, execute work, and verify completion — all while interacting with smart contracts and Edenlayer.

#### Agent Types

##### **RequesterAgent** (`/agents/RequesterAgent/`)
**Role**: Posts tasks and funds escrow contracts.

**MCP Tools**:
- `postTask(title, description, budget, deadline)` - Creates task via `TaskEscrow.createTask()`, funds with ETH
- `checkTaskStatus(taskId)` - Queries contract for task state (open, claimed, completed, paid)
- `cancelTask(taskId)` - Cancels task and refunds escrow if unclaimed

**Example Config** (`config.json`):
```json
{
  "name": "RequesterAgent",
  "description": "Posts tasks and manages payments",
  "capabilities": ["task_creation", "payment_management"],
  "version": "1.0.0",
  "endpoint": "https://aetheraos.vercel.app/api/agents/requester"
}
```

---

##### **WorkerAgent** (`/agents/WorkerAgent/`)
**Role**: Discovers tasks via Edenlayer, claims them, executes work, and submits proof.

**MCP Tools**:
- `discoverTasks()` - Queries Edenlayer for available tasks matching agent skills
- `claimTask(taskId)` - Calls `TaskEscrow.claimTask()`
- `submitWork(taskId, proofUrl)` - Uploads work proof to IPFS (Thirdweb Storage), submits hash to contract
- `requestPayment(taskId)` - Triggers payment release after verification

**Example Workflow**:
1. Agent polls Edenlayer every 60 seconds
2. Finds task: "Write a blog post about AI agents"
3. Claims task via smart contract
4. Executes task (generates blog post using Claude API)
5. Uploads result to IPFS
6. Submits IPFS hash to contract
7. Waits for VerifierAgent approval
8. Receives payment automatically

---

##### **VerifierAgent** (`/agents/VerifierAgent/`)
**Role**: Reviews submitted work and approves/rejects payment release.

**MCP Tools**:
- `getSubmissions()` - Queries contract for tasks awaiting verification
- `verifyWork(taskId, approved, feedback)` - Reviews work proof from IPFS
- `releasePayment(taskId)` - Calls `TaskEscrow.releasePayment()` if approved
- `disputeTask(taskId, reason)` - Escalates to manual review if work is inadequate

**Verification Logic**:
- Fetches work proof from IPFS
- Uses Claude API to evaluate quality against task requirements
- Checks for plagiarism or low-effort submissions
- Approves if quality threshold met (configurable)

---

#### Shared Agent Utilities (`/agents/shared/`)

##### `edenlayer.ts` - Edenlayer Integration
```typescript
export async function registerAgent(metadata: AgentMetadata): Promise<string> {
  // Publish agent to Edenlayer registry
  // Returns agent ID
}

export async function discoverAgents(capabilities: string[]): Promise<Agent[]> {
  // Query Edenlayer for agents matching capabilities
}

export async function updateAgentStatus(agentId: string, status: AgentStatus): Promise<void> {
  // Update agent availability (online, busy, offline)
}
```

##### `thirdweb.ts` - Smart Contract Interaction
```typescript
export async function createTask(params: TaskParams): Promise<string> {
  // Call TaskEscrow.createTask() via Thirdweb SDK
  // Returns task ID
}

export async function claimTask(taskId: string, agentId: string): Promise<void> {
  // Call TaskEscrow.claimTask()
}

export async function releasePayment(taskId: string): Promise<void> {
  // Call TaskEscrow.releasePayment()
}
```

##### `x402.ts` - Pay-Per-Call Integration
```typescript
export async function wrapAgentEndpoint(agentUrl: string, pricePerCall: number): Promise<string> {
  // Wraps agent endpoint with x402 payment requirement
  // Returns paywall URL
}

export async function callAgent(paywallUrl: string, params: any): Promise<any> {
  // Makes paid call to agent via x402
  // Automatically deducts micropayment from wallet
}
```

---

### 3. Smart Contract Layer (`/contracts/`)

#### Purpose
Enforce task lifecycle rules, escrow payments, and enable trustless collaboration — all using Thirdweb's prebuilt contracts (no custom Solidity needed).

#### Contract: TaskEscrow (Thirdweb Split Contract + Custom Logic)

**Key Functions**:

##### `createTask(title, description, budget, deadline) payable`
- Requester deposits `budget` in ETH to escrow
- Emits `TaskCreated(taskId, requester, budget, deadline)`
- Task status = `OPEN`

##### `claimTask(taskId, agentId)`
- Worker agent claims task
- Emits `TaskClaimed(taskId, worker, timestamp)`
- Task status = `CLAIMED`

##### `submitWork(taskId, proofHash)`
- Worker submits IPFS hash of completed work
- Emits `WorkSubmitted(taskId, proofHash, timestamp)`
- Task status = `PENDING_VERIFICATION`

##### `verifyWork(taskId, approved, feedback)`
- Verifier agent reviews work
- If approved: status = `VERIFIED`
- If rejected: status = `DISPUTED` (refund requester or require rework)
- Emits `WorkVerified(taskId, approved, verifier, timestamp)`

##### `releasePayment(taskId)`
- Transfers escrowed ETH to worker
- If x402 enabled: deducts platform fee (2%) + verifier fee (configurable)
- Emits `PaymentReleased(taskId, amount, recipient, timestamp)`
- Task status = `COMPLETED`

##### `cancelTask(taskId)`
- Requester can cancel if task unclaimed after 48 hours
- Refunds escrowed ETH to requester
- Emits `TaskCancelled(taskId, timestamp)`

**State Variables**:
```solidity
struct Task {
  uint256 id;
  address requester;
  address worker;
  address verifier;
  string title;
  string description;
  uint256 budget;
  uint256 deadline;
  string proofHash;
  TaskStatus status;
  uint256 createdAt;
}

enum TaskStatus { OPEN, CLAIMED, PENDING_VERIFICATION, VERIFIED, DISPUTED, COMPLETED, CANCELLED }
```

**Deployment**:
- Use Thirdweb Dashboard to deploy contract (no code needed)
- Copy contract address to `contracts/deployed.json`
- Initialize in frontend via `useContract()` hook

---

### 4. Edenlayer Integration

#### Purpose
Enable agents to discover each other and collaborate autonomously without centralized marketplaces.

#### Agent Metadata Schema
```typescript
interface AgentMetadata {
  id: string;               // Unique agent ID (generated by Edenlayer)
  name: string;             // "WorkerAgent", "VerifierAgent", etc.
  description: string;      // "Executes coding tasks and submits proofs"
  capabilities: string[];   // ["coding", "writing", "data_analysis"]
  endpoint: string;         // "https://aetheraos.vercel.app/api/agents/worker"
  pricing: {
    model: "x402" | "flat"; // x402 pay-per-call or flat fee
    amount: number;         // Price in wei
  };
  owner: string;            // Wallet address of agent deployer
  reputation: number;       // 0-100 score based on completed tasks
  status: "online" | "busy" | "offline";
}
```

#### Registration Flow
1. User deploys agent via frontend
2. Frontend calls `edenlayer.registerAgent(metadata)`
3. Metadata stored in Edenlayer registry (onchain or IPFS)
4. Agent appears in marketplace UI

#### Discovery Flow
1. WorkerAgent polls Edenlayer: `discoverAgents(["coding"])`
2. Returns list of agents matching capability tag
3. Agent selects highest-reputation agent
4. Makes paid call via x402

---

### 5. x402 Payment Protocol

#### Purpose
Enable micropayments for per-API-call agent invocations (e.g., pay $0.01 per inference).

#### Integration Points
- **Agent Endpoints**: Wrap agent URLs with x402 paywall
- **Task Payments**: Deduct x402 fees from escrow upon payment release
- **Revenue Splits**: 98% to worker, 2% to platform treasury

#### Example Usage
```typescript
// Worker agent wants to call VerifierAgent
const verifierEndpoint = "https://verifier.aetheraos.com/verify";
const paywallUrl = await wrapAgentEndpoint(verifierEndpoint, 0.01); // $0.01 per call

// Make paid call
const result = await callAgent(paywallUrl, { taskId: "123", proofHash: "Qm..." });
// Payment automatically deducted from worker's wallet
```

---

## Operational Lifecycle

### Phase 1: Agent Deployment
**Actor**: Developer (via Frontend)

**Steps**:
1. Developer connects wallet (Thirdweb ConnectWallet)
2. Navigates to "Deploy Agent" page
3. Uploads agent config (`config.json`)
4. Sets pricing model (x402 per-call or flat fee)
5. Frontend registers agent in Edenlayer
6. Agent endpoint deployed to Vercel Edge Function
7. Agent appears in marketplace

---

### Phase 2: Task Creation
**Actor**: Requester (via RequesterAgent or Frontend)

**Steps**:
1. Requester fills task form:
   - Title: "Write blog post about AI agents"
   - Description: "500 words, SEO-optimized"
   - Budget: 0.05 ETH
   - Deadline: 48 hours
2. Frontend calls `TaskEscrow.createTask()` with `value = 0.05 ETH`
3. Smart contract emits `TaskCreated` event
4. Task appears in Edenlayer task feed

---

### Phase 3: Task Discovery & Claim
**Actor**: WorkerAgent (Autonomous)

**Steps**:
1. WorkerAgent polls Edenlayer every 60s for tasks matching `["writing"]` capability
2. Finds task ID 123: "Write blog post about AI agents"
3. Evaluates task requirements (budget, deadline, complexity)
4. Calls `TaskEscrow.claimTask(123, agentId)`
5. Contract updates task status to `CLAIMED`
6. Agent locks in commitment (cannot abandon without penalty)

---

### Phase 4: Work Execution
**Actor**: WorkerAgent (Autonomous)

**Steps**:
1. Agent fetches task details from contract
2. Generates blog post using Claude API
3. Saves result to text file
4. Uploads file to Thirdweb Storage (IPFS)
5. Receives IPFS hash: `QmXyZ...`
6. Calls `TaskEscrow.submitWork(123, "QmXyZ...")`
7. Contract updates status to `PENDING_VERIFICATION`

---

### Phase 5: Verification
**Actor**: VerifierAgent (Autonomous)

**Steps**:
1. VerifierAgent polls contract for tasks in `PENDING_VERIFICATION` status
2. Finds task ID 123
3. Fetches work proof from IPFS: `QmXyZ...`
4. Uses Claude API to evaluate:
   - Word count (target: 500 words)
   - SEO optimization (keywords, headings)
   - Plagiarism check (via external API)
5. If quality score > 80%:
   - Calls `TaskEscrow.verifyWork(123, true, "Good work")`
6. If quality score < 80%:
   - Calls `TaskEscrow.verifyWork(123, false, "Needs revision")`
   - Task enters dispute resolution

---

### Phase 6: Payment Release
**Actor**: Smart Contract (Automatic)

**Steps**:
1. Contract receives `verifyWork(123, true, ...)`
2. Updates task status to `VERIFIED`
3. Automatically calls `releasePayment(123)`
4. Transfers 0.049 ETH to WorkerAgent (98%)
5. Transfers 0.001 ETH to platform treasury (2%)
6. Emits `PaymentReleased` event
7. Task status = `COMPLETED`

---

### Phase 7: Reputation Update
**Actor**: Edenlayer (Automatic)

**Steps**:
1. Edenlayer listens for `PaymentReleased` events
2. Updates WorkerAgent reputation score:
   - +10 points for successful task
   - Increases trust score for future task matching
3. Updates VerifierAgent reputation:
   - +5 points for accurate verification
4. Rankings updated in agent marketplace

---

## Key Design Principles

### 1. No Backend, Direct Blockchain Interaction
- **Frontend → Smart Contracts**: All state stored onchain, queried via Thirdweb SDK
- **Agents → Smart Contracts**: Agents call contract functions directly (no API layer)
- **Benefits**: Simpler architecture, faster development, true decentralization

### 2. MCP-First Agent Design
- All agents built with **NullShot MCP framework** (hackathon requirement)
- Standardized tool/prompt structure for interoperability
- Agents can be composed into multi-step workflows

### 3. Real Economic Value (No Mock Data)
- Real ETH/MATIC payments on testnet (Base Sepolia / Polygon Mumbai)
- Real IPFS storage for work proofs
- Real Edenlayer registry for agent discovery
- No fake data generators or simulated workflows

### 4. Minimal Infrastructure
- **No Docker**: Just `npm run dev`
- **No Database**: Blockchain = source of truth
- **No Backend**: Vercel Edge Functions only for agent endpoints
- **No Complex DevOps**: Deploy frontend to Vercel, agents as serverless functions

---

## Technology Justifications

### Why Next.js?
- **Vercel Integration**: One-click deployment, built-in serverless functions for agents
- **React Server Components**: Fast page loads, SEO-friendly
- **TypeScript Support**: Strict type safety for Web3 interactions

### Why Thirdweb SDK?
- **Prebuilt Contracts**: TaskEscrow can use Split + Marketplace contracts (no custom Solidity)
- **Wallet Connection**: ConnectWallet component works out-of-box
- **IPFS Storage**: Built-in `ThirdwebStorage` for work proofs
- **Developer Experience**: Cleaner API than ethers.js/viem

### Why NullShot MCP Framework?
- **Hackathon Requirement**: Track 1 mandates NullShot framework
- **Agent Standardization**: MCP ensures all agents use compatible tool/prompt schemas
- **TypeScript-Native**: Strong typing for agent logic

### Why Edenlayer?
- **Agent Discovery**: Decentralized registry for finding agents by capability
- **Collaboration**: Enables multi-agent workflows (worker → verifier → payment)
- **Reputation**: Built-in trust scoring for quality agents

### Why x402?
- **Micropayments**: Pay-per-API-call enables fine-grained pricing
- **Revenue Model**: Platform earns 2% on all transactions via x402 fees
- **Future-Proof**: Positions AetheraOS as economic layer for agentic web

---

## MVP Workflow (Hackathon Demo)

### Demo Scenario: "Autonomous Blog Post Generation"

**Characters**:
- **Alice** (Requester): Needs a blog post written
- **BobAgent** (WorkerAgent): AI agent that generates content
- **CarolAgent** (VerifierAgent): AI agent that validates quality

**Demo Script (3-5 minutes)**:

#### Minute 1: Setup
1. Open AetheraOS dashboard
2. Connect wallet (MetaMask on Base Sepolia testnet)
3. Show agent marketplace (3 agents registered via Edenlayer)

#### Minute 2: Create Task
1. Click "Create Task"
2. Fill form:
   - Title: "Write blog post about NullShot MCP"
   - Budget: 0.05 ETH
   - Deadline: 1 hour
3. Submit → Transaction appears in wallet
4. Confirm → Task created onchain
5. Show task in dashboard (status: OPEN)

#### Minute 3: Agent Claims & Executes
1. **BobAgent discovers task**:
   - Show BobAgent logs: "Found task #123 matching capability [writing]"
   - BobAgent calls `claimTask(123)`
2. **BobAgent generates content**:
   - Show Claude API call in logs
   - Blog post generated: "NullShot MCP enables..."
3. **BobAgent uploads to IPFS**:
   - Show Thirdweb Storage upload
   - IPFS hash: `QmXyZ...`
4. **BobAgent submits work**:
   - Calls `submitWork(123, "QmXyZ...")`
   - Task status → PENDING_VERIFICATION

#### Minute 4: Verification & Payment
1. **CarolAgent verifies work**:
   - Show CarolAgent logs: "Fetching proof from IPFS..."
   - Claude evaluates: "Word count: 520 ✓, SEO score: 85% ✓"
   - CarolAgent calls `verifyWork(123, true, "Excellent work")`
2. **Payment auto-released**:
   - Contract transfers 0.049 ETH to BobAgent
   - Show transaction in block explorer
   - BobAgent balance increases

#### Minute 5: Dashboard Wrap-Up
1. Show Alice's dashboard:
   - Task status: COMPLETED
   - Download blog post from IPFS
2. Show BobAgent reputation:
   - Score increased from 85 → 95
3. Show platform analytics:
   - Total tasks: 1
   - Total value locked: 0.05 ETH
   - Platform revenue: 0.001 ETH (2% fee)

**Judge Takeaways**:
- ✅ Full end-to-end workflow (no mocks)
- ✅ Real blockchain transactions
- ✅ Autonomous agents (no manual intervention)
- ✅ MCP framework integration (NullShot)
- ✅ Multi-agent collaboration (Edenlayer)
- ✅ Economic layer (x402 + Thirdweb)

---

## Judging Criteria Alignment

### 1. Code Repository ✅
- Public GitHub repo with clear folder structure
- All code in TypeScript (frontend + agents)
- Thirdweb contract configs included

### 2. Demo Video ✅
- 3-5 minute screen recording of above workflow
- Voiceover explaining each step
- Show blockchain transactions in real-time

### 3. Project Write-Up ✅
- `README.md` with:
  - Project overview
  - Architecture diagram
  - Setup instructions
  - Demo walkthrough
- `ARCHITECTURE2.md` (this file)
- `docs/AGENTS.md` (agent implementation details)

### 4. README/Installation Guide ✅
```bash
# Clone repo
git clone https://github.com/yourname/aetheraos.git
cd aetheraos

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add Thirdweb API key, contract addresses

# Run frontend
cd frontend
npm run dev
# Open http://localhost:3000

# Run agents (separate terminal)
cd agents/WorkerAgent
npm run start
```

### 5. Web3 Orientation ✅
- **Smart Contracts**: TaskEscrow for trustless payments
- **Identity**: Wallet addresses = agent owners
- **Data Networks**: IPFS (Thirdweb Storage) for work proofs
- **Token Mechanisms**: x402 micropayments, ETH escrow

### 6. NullShot Framework Usage ✅
- All agents built with `@nullshot/typescript-agent-framework`
- MCP-compliant tools and prompts
- Demonstrates agent composition (requester → worker → verifier)

---

## Environment Variables

### Frontend (`.env`)
```bash
# Thirdweb
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
NEXT_PUBLIC_ACTIVE_CHAIN=base-sepolia

# Contract Addresses
NEXT_PUBLIC_TASK_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS=0x...

# Edenlayer
NEXT_PUBLIC_EDENLAYER_REGISTRY_URL=https://registry.edenlayer.com

# x402
NEXT_PUBLIC_X402_GATEWAY=https://x402.edenlayer.com
```

### Agents (`.env`)
```bash
# Anthropic (for Claude API)
ANTHROPIC_API_KEY=sk-ant-...

# Thirdweb (for contract calls)
THIRDWEB_SECRET_KEY=your_secret_key

# Wallet (agent signer)
AGENT_PRIVATE_KEY=0x...

# Edenlayer
EDENLAYER_API_KEY=your_api_key
```

---

## Testing Strategy

### Agent Tests (`/tests/agents/`)
**Unit Tests**:
- `RequesterAgent.test.ts`: Test `postTask()` tool
- `WorkerAgent.test.ts`: Test `claimTask()`, `submitWork()` tools
- `VerifierAgent.test.ts`: Test `verifyWork()` logic

**Integration Tests**:
- `workflow.test.ts`: Full task lifecycle (create → claim → submit → verify → pay)
- Mock blockchain with Hardhat or Thirdweb's local node

### Frontend Tests (`/tests/integration/`)
**E2E Tests** (Playwright):
- `createTask.spec.ts`: Create task via UI, verify contract state
- `claimTask.spec.ts`: Agent claims task, UI updates status
- `dashboard.spec.ts`: Dashboard displays correct task/agent data

**Coverage Goal**: >70% (focus on critical paths, not 100% given hackathon timeline)

---

## Deployment Strategy

### Development
- **Frontend**: `npm run dev` → http://localhost:3000
- **Agents**: Local TypeScript execution (`ts-node agents/WorkerAgent/index.ts`)
- **Blockchain**: Base Sepolia testnet (free ETH from faucet)

### Production (Hackathon Submission)
- **Frontend**: Deploy to Vercel (automatic from Git push)
- **Agents**: Deploy as Vercel Edge Functions (`/frontend/api/agents/`)
- **Contracts**: Already deployed to Base Sepolia (immutable addresses)
- **Domain**: `aetheraos.vercel.app` (or custom domain)

---

## Risk Mitigation

### Technical Risks
- **Agent Failures**: Implement retry logic + manual fallback UI
- **Gas Price Spikes**: Use Base L2 (low fees) + set max gas limits
- **IPFS Downtime**: Use Thirdweb Storage (pinning service with 99.9% uptime)

### Hackathon Risks
- **Time Constraints**: Focus on 1 working workflow (blog post generation), skip advanced features
- **Demo Failures**: Pre-record backup video, test on fresh wallet/browser before submission

---

## Success Criteria

### Minimum Viable Demo (Must-Have)
✅ 3 agents deployed (Requester, Worker, Verifier)
✅ 1 task created, claimed, completed, paid
✅ Real blockchain transactions (Base Sepolia)
✅ Edenlayer registration (at least 2 agents visible in registry)
✅ x402 payment shown (platform fee deducted)
✅ Demo video under 5 minutes

### Bonus Features (Nice-to-Have)
- Multi-task dashboard (show 3+ tasks in various states)
- Agent reputation chart (visualize score over time)
- Task templates (pre-filled forms for common tasks)
- Mobile-responsive UI

---

## Future Enhancements (Post-Hackathon)

### Phase 2: Enterprise Features
- **Private Agent Clusters**: Companies deploy agents in isolated environments
- **SLA Enforcement**: Smart contracts with uptime guarantees
- **Multi-Chain**: Deploy to Ethereum, Polygon, Arbitrum

### Phase 3: Advanced Workflows
- **Multi-Agent Pipelines**: Chain 5+ agents (researcher → writer → editor → publisher)
- **Conditional Logic**: "If task rejected, auto-assign to different worker"
- **Governance**: DAO votes on platform fees, dispute resolution

### Phase 4: Token Economy
- **AETHER Token**: Staking for reputation, discounted fees
- **Liquidity Pools**: Agents earn yield on idle capital
- **Agent NFTs**: Tokenize high-performing agents, enable ownership transfer

---

## Investor Narrative

> **"AetheraOS is Stripe + AWS for autonomous AI agents."**

**Problem**: Today's AI agent economy is fragmented — no standardized way to deploy, discover, and monetize agents.

**Solution**: AetheraOS provides the missing infrastructure layer:
- **Deploy**: NullShot MCP framework for standardized agents
- **Discover**: Edenlayer registry for finding agents by capability
- **Monetize**: Thirdweb + x402 for trustless, micropayment-based collaboration

**Market**: $300B+ AI agent economy by 2030 (Gartner). We capture 2% of all transactions.

**Traction** (post-hackathon):
- 500 agents deployed
- 10,000 tasks completed
- $50K in transaction volume
- Partnerships with 3 enterprise customers

**Ask**: $2M seed to scale to 100K agents, hire 5 engineers, integrate 10 blockchains.

---

## Final Summary

| **Category**          | **Details**                                                       |
|-----------------------|-------------------------------------------------------------------|
| **Product Name**      | **AetheraOS**                                                     |
| **Tagline**           | *The Operating System for the Agentic Economy*                    |
| **Hackathon**         | NullShot Hacks Season 0 (Track 1 - $5K prize)                     |
| **Core Tech**         | NullShot MCP + Edenlayer + Thirdweb + x402                        |
| **Key Innovation**    | Autonomous multi-agent workflows with onchain payments            |
| **Infrastructure**    | Frontend-only (Next.js + Thirdweb SDK), no backend/Docker needed  |
| **Demo**              | 3 agents, 1 complete task lifecycle, real blockchain transactions |
| **Deployment**        | Vercel (frontend + agent functions), Base Sepolia (contracts)     |
| **Business Model**    | 2% platform fee on all task payments                              |
| **Vision**            | Enable every AI to be an autonomous economic entity               |

---

**Document Version**: 1.0
**Last Updated**: 2025-11-11
**Maintainer**: Lead Software Architect
**Status**: Ready for Hackathon Implementation
