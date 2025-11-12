# 🎲 Prediction Market Agent

**AI Agent for Prediction Markets** - Built with NullShot MCP Framework for the NullShot Hacks Season 0

An autonomous AI agent that interacts with on-chain prediction markets, analyzes odds, places bets, and manages positions using the Model Context Protocol (MCP) and Web3 infrastructure.

## 🏆 Hackathon Submission

**Track:** Track 1 - MCPs/Agents using the NullShot Framework
**Prize Pool:** $5,000 per winner (4 winners)

## 🎯 Features

### MCP Tools (6 Total)

1. **`get-market-data`** - Fetch prediction market data (odds, liquidity, volume)
2. **`analyze-market`** - AI-powered market analysis and value bet detection
3. **`place-bet`** - Execute bets on-chain via smart contracts
4. **`get-positions`** - Track user positions across markets
5. **`calculate-pnl`** - Calculate profit/loss with detailed breakdown
6. **`get-trending-markets`** - Discover trending prediction markets

### Web3 Integration

- ✅ On-chain bet execution via Thirdweb SDK
- ✅ Multi-chain support (Base, Polygon)
- ✅ Smart contract interactions for betting/payouts
- ✅ Real-time position tracking
- ✅ Gas-optimized transactions

### AI Capabilities

- 📊 Market data analysis and insights
- 🎯 Value bet identification
- ⚠️ Risk assessment and warnings
- 📈 PnL calculations with recommendations
- 🔔 Opportunity alerts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or pnpm
- Cloudflare Workers account
- Thirdweb Client ID
- Prediction market API access (Polymarket, Azuro)

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install

# Copy environment variables
cp .env.example .env.local

# Add your API keys to .env.local
```

### Development

```bash
# Run MCP server locally
npm run dev

# The server will be available at:
# - HTTP: http://localhost:8787
# - MCP endpoint: http://localhost:8787/mcp
```

### Testing with MCP Inspector

```bash
# In a separate terminal, open MCP Inspector
npx @modelcontextprotocol/inspector http://localhost:8787/mcp
```

### Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy

# Your agent will be live at:
# https://prediction-market-agent.your-subdomain.workers.dev
```

## 📡 MCP Protocol Usage

### Example: Get Market Data

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get-market-data",
    "arguments": {
      "marketId": "btc-100k-2024",
      "source": "polymarket"
    }
  }
}
```

### Example: Place Bet

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "place-bet",
    "arguments": {
      "marketId": "btc-100k-2024",
      "outcome": "Yes",
      "amount": 100,
      "walletAddress": "0x..."
    }
  }
}
```

## 🔗 Integration with AetheraOS

This agent is designed to work seamlessly with the AetheraOS platform:

1. **Agent Registration** - Automatically registered in Edenlayer Protocol
2. **Discovery** - Appears in AetheraOS Marketplace
3. **Execution** - Tasks executed via AetheraOS Task Manager
4. **Chat** - Real-time interaction via AetheraOS Chat

### Register with Edenlayer

```bash
curl -X POST https://api.edenlayer.com/agents \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: YOUR_API_KEY" \
  -d '{
    "name": "Prediction Market Agent",
    "description": "AI agent for prediction markets with on-chain betting",
    "mcpUrl": "https://prediction-market-agent.your-subdomain.workers.dev/mcp",
    "capabilities": {
      "tools": [...]
    }
  }'
```

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     Prediction Market Agent         │
│     (NullShot MCP Server)          │
└────────────┬────────────────────────┘
             │
             ├──► Prediction Markets
             │    (Polymarket, Azuro)
             │
             ├──► Blockchain/Smart Contracts
             │    (Thirdweb SDK)
             │
             └──► Edenlayer Protocol
                  (Agent Registry)
```

## 🎓 Hackathon Criteria Met

### ✅ NullShot Framework Usage
- Built entirely on NullShot MCP framework
- Uses `@modelcontextprotocol/sdk`
- Implements MCP JSON-RPC protocol
- Deployed on Cloudflare Workers (Durable Objects)

### ✅ Web3 Integration
- On-chain transaction execution
- Smart contract interactions
- Multi-chain support
- Thirdweb SDK integration

### ✅ Innovation
- First MCP agent for prediction markets
- AI-powered market analysis
- Autonomous betting strategies
- Real-time position management

### ✅ Practical Utility
- Analyzes market opportunities
- Executes bets autonomously
- Tracks PnL in real-time
- Provides actionable insights

## 📚 Documentation

- [MCP Protocol Spec](https://modelcontextprotocol.io)
- [NullShot Framework](https://github.com/null-shot/typescript-mcp-template)
- [Edenlayer Docs](https://docs.edenlayer.com)
- [Thirdweb SDK](https://portal.thirdweb.com)

## 🤝 Contributing

Contributions welcome! This is a hackathon project but open for improvements.

## 📄 License

MIT

## 👤 Author

Built for NullShot Hacks Season 0 - November 2024

---

**🎯 Ready to trade predictions autonomously with AI!** 🚀
