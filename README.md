`# 🤖 AetheraOS - Autonomous AI Agent Platform

> An intelligent AI agent that orchestrates blockchain intelligence tools to help you make smarter crypto decisions.

**Built for:** [Nullshot Hacks Season 0](https://github.com/null-shot/hacks-season-0)

---

## 🎯 What Is This?

AetheraOS is like having a smart crypto analyst that can:
- Analyze any wallet to see if it's worth copying
- Detect whales and smart money traders
- Check market sentiment from prediction markets
- Give you actionable trading advice

**But here's the cool part:** It's not just calling APIs - it's an **autonomous agent** that:
1. **Thinks** about what you want using AI (Claude 3.5)
2. **Plans** the best way to get you an answer
3. **Executes** multiple analysis tools with real payments
4. **Synthesizes** everything into simple recommendations

---

## 💬 Example: Ask the Agent

**You:** *"Is wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4 worth copying?"*

**Agent thinks:**
```
Let me analyze this comprehensively:
1. Get wallet data (portfolio, tokens, NFTs)
2. Check if it's a whale (>$1M)
3. Analyze trading history for patterns
4. Check prediction market sentiment for their tokens
5. Calculate risk score
```

**Agent executes** (with real micro-payments):
- ✅ Wallet has $1.2M in crypto
- ✅ Win rate: 78% over 90 days
- ✅ Risk score: 3/10 (low)
- ✅ Prediction markets are bullish on their tokens

**Agent recommends:**
```
FOLLOW this wallet (90% confidence)

Why:
• High portfolio value with diverse holdings
• Proven track record (78% win rate)
• Low risk strategy
• Market sentiment aligns with holdings

What to do:
• Set up copy trading with 2-5% position size
• Monitor weekly for strategy changes
• Set stop-loss at -10%
```

---

## 🏗️ How It Works

```
┌─────────────────────────────────────────────┐
│ You ask a question in natural language      │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│ Autonomous Agent (AI Brain)                 │
│                                             │
│ 1. Understands your intent                 │
│ 2. Creates optimal plan                    │
│ 3. Calls blockchain intelligence tools     │
│ 4. Synthesizes results                     │
│ 5. Gives actionable advice                 │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│ ChainIntel MCP (Blockchain Intelligence)    │
│                                             │
│ Tools:                                      │
│ • analyze-wallet → Full wallet analysis    │
│ • detect-whales → Find big players         │
│ • smart-money-tracker → Follow winners     │
│ • risk-score → Safety check                │
│ • trading-patterns → Strategy insights     │
│                                             │
│ Data Sources:                               │
│ • Moralis (Base/Ethereum blockchain)       │
│ • Helius (Solana blockchain)               │
│ • Polymarket (Prediction markets)          │
│ • Claude AI (Smart analysis)               │
└─────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
# Clone the repo
cd AetheraOS

# Install frontend
cd frontend
npm install

# Install ChainIntel MCP
cd ../mcps/chainintel-mcp
npm install

# Install Autonomous Agent
cd ../../autonomous-agent
npm install
```

### Step 2: Get API Keys (All Free Tiers Work!)

1. **Moralis** (blockchain data) → [admin.moralis.io](https://admin.moralis.io/)
2. **Helius** (Solana data) → [helius.dev](https://www.helius.dev/)
3. **Anthropic** (Claude AI) → [console.anthropic.com](https://console.anthropic.com/)
4. **Thirdweb** (payments) → [thirdweb.com/dashboard](https://thirdweb.com/dashboard)

### Step 3: Configure & Run

**Set up ChainIntel MCP:**
```bash
cd mcps/chainintel-mcp
cp .env.example .env
# Edit .env and add your API keys

# Run locally
npm run dev
```

**Set up Autonomous Agent:**
```bash
cd autonomous-agent
cp .env.example .env
# Edit .env and add your API keys

# Run locally
npm run dev
```

**Set up Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 and start asking questions!

---

## 📁 Project Structure (Simple!)

```
AetheraOS/
│
├── frontend/                    # Website (React)
│   └── src/
│       ├── pages/
│       │   └── Marketplace.jsx  # Where you find agents
│       └── components/
│
├── autonomous-agent/            # The AI Brain
│   └── src/
│       ├── reasoning/           # Plans what to do
│       ├── orchestrator/        # Executes the plan
│       └── agent.ts            # Main agent
│
├── mcps/
│   └── chainintel-mcp/         # Blockchain Intelligence
│       └── src/
│           ├── apis/           # Moralis, Helius, Claude
│           ├── tools/          # 5 analysis tools
│           └── payment/        # Real micro-payments
│
└── prediction-market-agent/     # Prediction market data
    └── src/
        └── polymarket.ts       # Real Polymarket API
```

---

## 🔧 What Each Part Does

### 1. Frontend (What You See)
- **Marketplace**: Browse available AI agents
- **Chat**: Ask questions and get answers
- **Dashboard**: See your analysis history

### 2. Autonomous Agent (The Brain)
- **Planner**: Figures out what tools to use
- **Executor**: Runs the tools and manages payments
- **Synthesizer**: Combines results into advice

### 3. ChainIntel MCP (The Intelligence)
5 powerful tools:

| Tool | What It Does | Cost |
|------|-------------|------|
| `analyze-wallet` | Complete wallet breakdown | 0.01 ETH |
| `detect-whales` | Find big money wallets | 0.005 ETH |
| `smart-money-tracker` | Follow profitable traders | 0.02 ETH |
| `risk-score` | Safety assessment | 0.005 ETH |
| `trading-patterns` | Strategy analysis | 0.01 ETH |

**Works on:** Base, Ethereum, and Solana

---

## 🎓 For Beginners: How to Use

### Simple Question Examples:

**Wallet Analysis:**
```
"Analyze wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4"
"Is wallet 0xABC a whale?"
"Should I copy wallet 0xDEF's trades?"
```

**Finding Opportunities:**
```
"Find whale wallets on Base"
"Show me profitable traders"
"What's the trading pattern of 0x123?"
```

**Risk Checking:**
```
"How risky is wallet 0x456?"
"What's the risk score for 0xABC?"
```

### The Agent Will:
1. Understand what you're asking
2. Tell you what it's going to do
3. Show you the cost
4. Execute and show progress
5. Give you a clear recommendation

### Example Response:
```
Agent: "I'll analyze this wallet for you using:
        • Portfolio analysis (0.01 ETH)
        • Risk scoring (0.005 ETH)
        Total: 0.015 ETH"

[Shows progress]
✅ Portfolio: $1.2M
✅ Risk: 3/10

Agent: "RECOMMENDATION: FOLLOW
        This wallet is a smart money trader with low risk.
        Action: Copy trade with 2% of your portfolio."
```

---

## 💰 How Payments Work (x402 Protocol)

**Good news:** It uses **real** micro-payments, but they're tiny!
- Each tool costs $0.01-$0.02 worth of ETH
- You pay as you go
- Payments are automatic via Thirdweb
- Works on Base (cheap gas fees!)

**How it works:**
1. Agent tells you the total cost upfront
2. You approve once
3. Agent executes everything
4. You get detailed results

---

## 🎯 What Makes This Special

### vs Regular Crypto Tools
**Them:** Give you raw data
**Us:** Give you actionable advice

### vs Simple Bots
**Them:** Follow pre-programmed rules
**Us:** AI thinks about each question uniquely

### vs Centralized Services
**Them:** Black box, trust required
**Us:** You see the reasoning, decentralized payments

### Key Features:
- ✅ **Cross-chain**: Base + Ethereum + Solana
- ✅ **Real APIs**: Not demo data
- ✅ **AI Reasoning**: See how it thinks
- ✅ **Micro-payments**: Pay only for what you use
- ✅ **Beginner-friendly**: Natural language questions

---

## 🛠️ Advanced: Deploy Your Own

### Deploy ChainIntel MCP to Cloudflare:
```bash
cd mcps/chainintel-mcp

# Set secrets
wrangler secret put MORALIS_API_KEY
wrangler secret put HELIUS_API_KEY
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put THIRDWEB_SECRET_KEY
wrangler secret put PLATFORM_WALLET

# Deploy
npm run deploy
```

### Deploy Autonomous Agent:
```bash
cd autonomous-agent

# Set secrets
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put THIRDWEB_SECRET_KEY

# Deploy
npm run deploy
```

Your agent is now live and accessible via URL!

---

## 📚 Learn More

### Documentation:
- `/mcps/chainintel-mcp/README.md` - ChainIntel MCP details
- `/autonomous-agent/README.md` - Agent architecture
- `/prediction-market-agent/README.md` - Polymarket integration

### Key Concepts:

**MCP (Model Context Protocol):**
A standard way for AI agents to discover and use tools. Think of it like USB - a universal connector for AI tools.

**x402 Payments:**
Micro-payments over HTTP. You pay for each API call automatically using crypto.

**Autonomous Agent:**
An AI that can plan, execute, and learn - not just follow rules.

**Cross-chain Analysis:**
Looking at wallet activity across multiple blockchains (Base, Ethereum, Solana) for complete picture.

---

## 🤝 Contributing

Want to improve AetheraOS? Here's how:

### Add New Tools:
```typescript
// In mcps/chainintel-mcp/src/tools/

export async function yourNewTool(input: YourSchema) {
  // Your analysis logic
  return result;
}
```

### Add New Data Sources:
```typescript
// In mcps/chainintel-mcp/src/apis/

export async function fetchFromNewAPI() {
  // Integration code
}
```

### Improve the Agent:
```typescript
// In autonomous-agent/src/reasoning/

// Make planning smarter
// Add new synthesis strategies
```

---

## ❓ FAQ

**Q: Do I need crypto to use this?**
A: Yes, small amounts of ETH on Base for payments. But it's ~$0.01-0.02 per analysis.

**Q: Is my data private?**
A: Yes! Analysis happens on-demand. No data is stored.

**Q: Can I use this for other blockchains?**
A: Currently supports Base, Ethereum, and Solana. More can be added!

**Q: Is this production-ready?**
A: The core is production-ready. Some features are MVP. Use at your own risk.

**Q: How accurate is the AI?**
A: It uses Claude 3.5 Sonnet (state-of-the-art) plus real blockchain data. But always verify important decisions!

---

## 🏆 Built For Nullshot Hacks

This project demonstrates:
- ✅ Proper MCP framework compliance
- ✅ Real x402 payment integration
- ✅ Autonomous AI reasoning
- ✅ Cross-chain capabilities
- ✅ Production-grade code
- ✅ Beginner-friendly UX

**Judges:** Check `/mcps/chainintel-mcp/mcp.json` for framework compliance!

---

## 📞 Support

**Issues?** Open a GitHub issue
**Questions?** Check the docs in each folder
**Ideas?** We'd love to hear them!

---

## 📜 License

MIT - Use it, fork it, improve it!

---

## 🙏 Credits

**Built with:**
- [Nullshot Framework](https://github.com/null-shot/typescript-agent-framework)
- [Claude 3.5 Sonnet](https://anthropic.com) (Anthropic)
- [Thirdweb x402](https://thirdweb.com)
- [Moralis](https://moralis.io) & [Helius](https://helius.dev)
- [Cloudflare Workers](https://workers.cloudflare.com)

**Special thanks to:**
- Nullshot team for the amazing framework
- Thirdweb for x402 protocol
- Anthropic for Claude AI

---

**Ready to become a smarter crypto trader?** Start with Step 1 above! 🚀
