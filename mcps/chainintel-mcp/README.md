# ChainIntel MCP 🔍

**All-in-One AI-Powered Platform:** Wallet Intelligence, Task Escrow, IPFS Storage, and Prediction Markets.

## Overview

ChainIntel MCP is a comprehensive Model Context Protocol server providing 19 tools across 4 categories. It combines real blockchain data (Moralis, Helius, Alchemy) with AI insights (Claude 3.5) and includes full task management, decentralized storage, and prediction market analysis.

Perfect for the **Nullshot Hacks: Season 0** hackathon - showcasing real APIs, x402 payments, and production-ready infrastructure.

## Features

✅ **19 Production Tools** - Complete toolkit for AI agents
✅ **Cross-Chain** - Base, Ethereum, and Solana support
✅ **Real APIs** - Moralis, Helius, Alchemy, Polymarket, Pinata
✅ **x402 Payments** - Real micropayments via Thirdweb
✅ **AI-Powered** - Claude 3.5 Sonnet for insights
✅ **MCP Standard** - Follows official protocol
✅ **Production-Ready** - Deployed on Cloudflare Workers

---

## 🧰 Tools (19 Total)

### Category 1: Wallet Intelligence (5 tools)

#### `analyze-wallet` - 0.01 ETH
Deep cross-chain wallet analysis with AI insights.

**Parameters:**
- `address`: Wallet address
- `chain`: "base" | "ethereum" | "solana"
- `depth`: "quick" | "standard" | "deep" (optional)

**Returns:** Portfolio value, token holdings, NFTs, AI insights

---

#### `detect-whales` - 0.005 ETH
Identify whale wallets and track their movements.

**Parameters:**
- `chain`: "base" | "ethereum" | "solana"
- `minPortfolioValue`: Minimum $ value (default: 1000000)

**Returns:** List of whale addresses with portfolio values

---

#### `smart-money-tracker` - 0.02 ETH
Track wallets with proven alpha.

**Parameters:**
- `address`: Wallet address
- `chain`: "base" | "ethereum" | "solana"
- `lookbackDays`: Number of days to analyze (default: 90)

**Returns:** Win rate, profitable trades, strategy insights

---

#### `risk-score` - 0.005 ETH
Calculate comprehensive risk score.

**Parameters:**
- `address`: Wallet address
- `chain`: "base" | "ethereum" | "solana"

**Returns:** Risk score (0-100), risk factors, recommendations

---

#### `trading-patterns` - 0.01 ETH
Analyze trading patterns and strategies.

**Parameters:**
- `address`: Wallet address
- `chain`: "base" | "ethereum" | "solana"
- `minTrades`: Minimum trades to analyze (default: 10)

**Returns:** Trading strategy, patterns, insights

---

### Category 2: Task Escrow (5 tools)

#### `create_task` - 0.005 ETH
Create blockchain task with escrowed ETH payment.

**Parameters:**
- `title`: Task title
- `description`: Task description
- `budget`: Budget in ETH (e.g., "0.05")
- `deadline`: Unix timestamp
- `contractAddress`: Escrow contract (optional)

**Returns:** Transaction hash, task ID

---

#### `claim_task` - 0.002 ETH
Claim an available task to start working.

**Parameters:**
- `taskId`: Task ID to claim
- `contractAddress`: Escrow contract (optional)

**Returns:** Transaction confirmation

---

#### `submit_work` - 0.002 ETH
Submit work proof (IPFS hash) for task.

**Parameters:**
- `taskId`: Task ID
- `proofHash`: IPFS CID of work proof
- `contractAddress`: Escrow contract (optional)

**Returns:** Transaction confirmation

---

#### `verify_work` - 0.003 ETH
Verify work and release escrowed payment.

**Parameters:**
- `taskId`: Task ID
- `approved`: true | false
- `contractAddress`: Escrow contract (optional)

**Returns:** Payment release confirmation

---

#### `get_task` - 0.001 ETH
Get task details from blockchain.

**Parameters:**
- `taskId`: Task ID
- `contractAddress`: Escrow contract (optional)

**Returns:** Task status, requester, worker, budget, deadline

---

### Category 3: IPFS Storage (5 tools)

#### `upload_work_proof` - 0.003 ETH
Upload work proof file to IPFS with metadata.

**Parameters:**
- `content`: Base64-encoded file content
- `filename`: File name
- `taskId`: Associated task ID (optional)
- `worker`: Worker address (optional)
- `metadata`: Additional metadata (optional)

**Returns:** IPFS hash, URL, size

---

#### `upload_json` - 0.002 ETH
Upload JSON data to IPFS.

**Parameters:**
- `data`: JSON object to upload
- `name`: File name (optional)

**Returns:** IPFS hash, URL

---

#### `download_proof` - 0.001 ETH
Download and verify work proof from IPFS.

**Parameters:**
- `ipfsHash`: IPFS CID
- `usePinata`: Use Pinata gateway (default: true)

**Returns:** File content, content type, URL

---

#### `pin_to_ipfs` - 0.002 ETH
Pin existing IPFS hash for persistence.

**Parameters:**
- `ipfsHash`: IPFS hash to pin
- `name`: Pin name (optional)

**Returns:** Pin confirmation

---

#### `get_ipfs_url` - 0.0005 ETH
Get gateway URL for IPFS hash.

**Parameters:**
- `ipfsHash`: IPFS CID
- `usePinata`: Use Pinata gateway (default: true)

**Returns:** Gateway URL

---

### Category 4: Prediction Markets (4 tools)

#### `get_market_data` - 0.002 ETH
Fetch prediction market data from Polymarket.

**Parameters:**
- `marketId`: Market ID or slug

**Returns:** Market data, odds, volume, liquidity

---

#### `analyze_market` - 0.005 ETH
Analyze prediction market odds to find value bets.

**Parameters:**
- `marketId`: Market ID or slug
- `threshold`: Value threshold (optional)

**Returns:** Analysis, edge percentage, recommendation

---

#### `get_trending_markets` - 0.003 ETH
Get trending prediction markets by category.

**Parameters:**
- `limit`: Number of markets (default: 10)
- `category`: "all" | "crypto" | "politics" | "sports" | "entertainment"

**Returns:** List of trending markets

---

#### `search_markets` - 0.002 ETH
Search prediction markets by query.

**Parameters:**
- `query`: Search query
- `limit`: Number of results (default: 10)

**Returns:** Matching markets

---

## 🚀 Installation

```bash
cd mcps/chainintel-mcp
npm install
```

## ⚙️ Configuration

Create `.env` file:

```bash
# Required
MORALIS_API_KEY=your_moralis_key
HELIUS_API_KEY=your_helius_key
ANTHROPIC_API_KEY=your_claude_key
THIRDWEB_SECRET_KEY=your_thirdweb_key
PLATFORM_WALLET=0x...your_wallet

# Optional
ALCHEMY_API_KEY=your_alchemy_key
PINATA_JWT=your_pinata_jwt  # For IPFS storage
TASK_ESCROW_ADDRESS=0x...   # Task escrow contract
NETWORK=testnet # or mainnet
```

## 🏃 Running Locally

### As MCP Server (stdio)

```bash
npm run dev
```

### As HTTP Server (for testing)

```bash
npx wrangler dev
```

## 🌐 Deployment

### Deploy to Cloudflare Workers

```bash
# Set secrets
wrangler secret put MORALIS_API_KEY
wrangler secret put HELIUS_API_KEY
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put THIRDWEB_SECRET_KEY
wrangler secret put PLATFORM_WALLET
wrangler secret put PINATA_JWT
wrangler secret put TASK_ESCROW_ADDRESS

# Deploy
npm run deploy
```

## 💳 Usage with x402 Payments

### Client-Side (Frontend)

```typescript
import { wrapFetchWithPayment } from 'thirdweb/x402';
import { createThirdwebClient } from 'thirdweb';

const client = createThirdwebClient({
  clientId: process.env.THIRDWEB_CLIENT_ID
});

const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);

// Example: Analyze wallet with payment
const response = await fetchWithPay(
  'https://chainintel-mcp.workers.dev/analyze-wallet',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4',
      chain: 'base'
    })
  }
);

const data = await response.json();
console.log(data);
```

### MCP Server (stdio)

```bash
# Add to mcp.json or Claude Desktop config
{
  "mcpServers": {
    "chainintel": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "MORALIS_API_KEY": "${MORALIS_API_KEY}",
        "HELIUS_API_KEY": "${HELIUS_API_KEY}",
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

## 📊 Pricing Summary

| Category | Tools | Price Range |
|----------|-------|-------------|
| Wallet Intelligence | 5 | 0.005 - 0.02 ETH |
| Task Escrow | 5 | 0.001 - 0.005 ETH |
| IPFS Storage | 5 | 0.0005 - 0.003 ETH |
| Prediction Markets | 4 | 0.002 - 0.005 ETH |

**Total:** 19 tools, ~$0.0005 - $0.02 per call

---

## 🏗️ Architecture

```
ChainIntel MCP (All-in-One)
├── APIs
│   ├── Moralis (Base/Ethereum blockchain data)
│   ├── Helius (Solana blockchain data)
│   ├── Alchemy (Advanced analytics)
│   ├── Claude AI (Intelligence & insights)
│   ├── Polymarket (Prediction markets)
│   └── Pinata (IPFS storage)
│
├── Tools (19 total)
│   ├── Wallet Intelligence (5)
│   ├── Task Escrow (5)
│   ├── IPFS Storage (5)
│   └── Prediction Markets (4)
│
├── Payment Layer (x402)
│   ├── Thirdweb integration
│   ├── On-chain verification
│   └── Per-tool pricing
│
└── Deployment
    ├── MCP Server (stdio)
    └── Cloudflare Worker (HTTP)
```

---

## 🎯 Use Cases

### 1. Comprehensive Wallet Analysis
```bash
# Analyze wallet, check risk, and track performance
analyze-wallet → risk-score → smart-money-tracker
```

### 2. Task Marketplace
```bash
# Create task, worker claims, submits proof, get paid
create_task → claim_task → upload_work_proof → submit_work → verify_work
```

### 3. Prediction Market Trading
```bash
# Find opportunities and make informed bets
get_trending_markets → analyze_market → get_market_data
```

### 4. Decentralized Work Verification
```bash
# Upload proof to IPFS, submit to blockchain, verify
upload_work_proof → submit_work → verify_work
```

---

## 🛡️ Security

- ✅ Zod validation on all inputs
- ✅ Type-safe blockchain interactions (viem)
- ✅ No private keys stored
- ✅ x402 on-chain payment verification
- ✅ Read-only public clients for queries
- ✅ User confirmation required for transactions

---

## 📚 Documentation

For full API reference and examples, see:
- [mcp.json](./mcp.json) - Tool definitions
- [src/tools/](./src/tools/) - Tool implementations
- [src/payment/](./src/payment/) - x402 integration
- [AetheraOS Main README](../../README.md) - Platform overview

---

## 🏆 Built For

**Nullshot Hacks: Season 0** - https://dorahacks.io/hackathon/nullshothacks

Demonstrates:
- ✅ Real MCP implementation (not mocks)
- ✅ x402 payment integration
- ✅ Multiple real API integrations
- ✅ Cross-chain capabilities
- ✅ Production-grade code
- ✅ Comprehensive feature set

---

## 📜 License

MIT

---

## 🙏 Credits

Built with:
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Thirdweb x402](https://thirdweb.com)
- [Moralis](https://moralis.io) & [Helius](https://helius.dev)
- [Claude 3.5 Sonnet](https://anthropic.com)
- [Cloudflare Workers](https://workers.cloudflare.com)
- [Pinata](https://pinata.cloud)
- [Polymarket](https://polymarket.com)

---

**Ready to build?** Get API keys and start with `npm install` 🚀
