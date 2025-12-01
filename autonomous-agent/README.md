# AetheraOS Autonomous Agent 🤖

Intelligent AI agent that orchestrates multiple MCPs with reasoning and synthesis.

## The Key Innovation

This isn't just "API integration" - it's **intelligent orchestration**. The agent:

1. **REASONS** about user intent using Claude 3.5
2. **PLANS** optimal execution (which MCPs, what order, dependencies)
3. **EXECUTES** with real x402 payments
4. **SYNTHESIZES** results across MCPs into actionable recommendations
5. **SHOWS ITS THINKING** to the user in natural conversation

## How It Works

### Example: User asks "Is wallet 0xABC worth copying?"

```
┌─────────────────────────────────────────────────┐
│ 1. PLANNING PHASE (Claude reasoning)           │
│                                                 │
│ Agent analyzes intent:                          │
│ → User wants to evaluate a wallet for copying  │
│                                                 │
│ Agent creates plan:                             │
│ Step 1: analyze-wallet (0xABC) → Portfolio     │
│ Step 2: risk-score (0xABC) → Risk level        │
│ Step 3: smart-money-tracker (0xABC) → Alpha    │
│ Step 4: trading-patterns (0xABC) → Strategy    │
│                                                 │
│ Total cost: 0.035 ETH                          │
│ Estimated time: 12s                             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 2. USER APPROVAL                                │
│                                                 │
│ Shows user the plan with cost breakdown        │
│ User approves → Agent proceeds                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 3. EXECUTION PHASE (With payments)              │
│                                                 │
│ ✅ analyze-wallet (paid 0.01 ETH)              │
│    → Portfolio: $1.2M, 15 tokens, whale        │
│                                                 │
│ ✅ risk-score (paid 0.005 ETH)                 │
│    → Risk: 3/10 (Low)                          │
│                                                 │
│ ✅ smart-money-tracker (paid 0.02 ETH)         │
│    → Smart money: 85% confidence               │
│    → Win rate: 78% over 90 days                │
│                                                 │
│ ✅ trading-patterns (paid 0.005 ETH)           │
│    → Strategy: Swing trading                   │
│    → Frequency: Medium (2-3 trades/day)        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 4. SYNTHESIS PHASE (Claude reasoning)           │
│                                                 │
│ Agent combines all results:                     │
│ - High portfolio value ✅                       │
│ - Low risk score ✅                             │
│ - Proven smart money ✅                         │
│ - Consistent strategy ✅                        │
│                                                 │
│ Recommendation: FOLLOW                          │
│ Confidence: 90%                                 │
│                                                 │
│ Reasoning: "This wallet shows strong alpha      │
│ signals with low risk. High win rate and        │
│ consistent profitability make it ideal for      │
│ copy trading."                                  │
│                                                 │
│ Action items:                                   │
│ - Set up copy trading with 2-5% position size  │
│ - Monitor for changes in strategy              │
│ - Set stop-loss at -10%                        │
└─────────────────────────────────────────────────┘
```

## Architecture

```
User Query
    ↓
┌───────────────────────────────┐
│  Autonomous Agent             │
│                               │
│  ┌─────────────────────────┐ │
│  │ 1. Planner (Claude)     │ │
│  │    - Analyze intent     │ │
│  │    - Create plan        │ │
│  │    - Optimize cost      │ │
│  └─────────────────────────┘ │
│           ↓                   │
│  ┌─────────────────────────┐ │
│  │ 2. Executor             │ │
│  │    - Manage payments    │ │
│  │    - Call MCPs          │ │
│  │    - Handle errors      │ │
│  └─────────────────────────┘ │
│           ↓                   │
│  ┌─────────────────────────┐ │
│  │ 3. Synthesizer (Claude) │ │
│  │    - Combine results    │ │
│  │    - Generate insights  │ │
│  │    - Recommend actions  │ │
│  └─────────────────────────┘ │
└───────────────────────────────┘
    ↓
Actionable Recommendation
```

## Installation

```bash
cd autonomous-agent
npm install
```

## Configuration

Create `.env`:

```bash
ANTHROPIC_API_KEY=your_claude_key
CHAININTEL_URL=https://chainintel-mcp.workers.dev
THIRDWEB_CLIENT_ID=your_client_id
THIRDWEB_SECRET_KEY=your_secret_key
```

## Usage

### As HTTP API

```bash
npm run dev
```

### Process Query

```bash
curl -X POST http://localhost:8787/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Is wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4 worth copying?"
  }'
```

### Response

```json
{
  "success": true,
  "query": "Is wallet 0x742d35... worth copying?",
  "plan": {
    "intent": "Evaluate wallet for copy trading suitability",
    "steps": [...],
    "totalCost": "0.035 ETH"
  },
  "executionResult": {
    "success": true,
    "results": [...]
  },
  "synthesis": {
    "summary": "This wallet demonstrates strong alpha...",
    "recommendation": "FOLLOW",
    "confidence": 0.9,
    "keyFindings": [
      "78% win rate over 90 days",
      "Low risk score (3/10)",
      "Consistent swing trading strategy"
    ],
    "actionItems": [
      "Set up copy trading with 2-5% position size",
      "Monitor for strategy changes",
      "Set stop-loss at -10%"
    ]
  },
  "conversation": [
    "**You:** Is wallet 0x742d35... worth copying?",
    "**Agent:** Let me analyze this...",
    "**Agent:** Based on my analysis: FOLLOW this wallet",
    ...
  ],
  "metadata": {
    "totalCost": 0.035,
    "executionTime": 12340,
    "timestamp": "2024-11-30T..."
  }
}
```

## API Endpoints

### POST /query
Process natural language query with full plan-execute-synthesize flow.

**Request:**
```json
{
  "query": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "plan": {...},
  "executionResult": {...},
  "synthesis": {...},
  "conversation": [...],
  "metadata": {...}
}
```

### POST /plan
Get execution plan without executing (for user approval).

**Request:**
```json
{
  "query": "string"
}
```

**Response:**
```json
{
  "plan": {...},
  "estimatedCost": "0.035 ETH",
  "estimatedTime": 12
}
```

### POST /execute
Execute a pre-approved plan.

**Request:**
```json
{
  "plan": {...}
}
```

**Response:**
```json
{
  "success": boolean,
  "executionResult": {...},
  "synthesis": {...}
}
```

## Integration with Frontend

```typescript
// In your React/Next.js app
import { useState } from 'react';

function AgentChat() {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  async function askAgent() {
    setLoading(true);

    const response = await fetch('https://agent.aetheraos.workers.dev/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    setConversation(result.conversation);
    setLoading(false);
  }

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={askAgent} disabled={loading}>
        {loading ? 'Agent thinking...' : 'Ask Agent'}
      </button>

      <div className="conversation">
        {conversation.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
    </div>
  );
}
```

## Available MCPs

Currently integrated:
- ✅ **ChainIntel** - Cross-chain wallet analysis

Coming soon:
- 🔄 **Sentiment Analyzer** - Social sentiment analysis
- 🔄 **Prediction Market** - Market data and predictions
- 🔄 **Task Orchestrator** - On-chain task execution

## Deployment

```bash
# Set secrets
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put THIRDWEB_CLIENT_ID
wrangler secret put THIRDWEB_SECRET_KEY

# Deploy
npm run deploy
```

## Why This Wins

### vs. Simple API Integration
**Them:** Call APIs sequentially
**Us:** Agent REASONS about optimal strategy

### vs. Hardcoded Workflows
**Them:** Fixed workflows (if A then B)
**Us:** Dynamic planning based on intent

### vs. Single-MCP Tools
**Them:** One tool, one answer
**Us:** Cross-MCP synthesis with actionable insights

### vs. Silent Execution
**Them:** Black box
**Us:** Shows reasoning and decision-making

## Example Queries

- "Is wallet 0xABC worth copying?"
- "Find whale wallets on Base that trade DeFi tokens"
- "Analyze the risk of following wallet 0xDEF"
- "What's the trading strategy of wallet 0x123?"
- "Compare wallets 0xAAA and 0xBBB for copy trading"

## License

MIT

## Built For

Nullshot Hacks: Season 0 - https://github.com/null-shot/hacks-season-0
