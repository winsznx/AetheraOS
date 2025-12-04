# 🚀 AetheraOS Production Deployment Guide

**Complete step-by-step guide to deploy AetheraOS to production**

---

## 📋 **Prerequisites**

Before starting, sign up for these services and get API keys:

### **Required Services**
1. **Reown (WalletConnect)** - https://cloud.reown.com
   - Create new project → Get Project ID

2. **Thirdweb** - https://thirdweb.com/dashboard
   - Create API key → Get Client ID and Secret Key

3. **PostgreSQL Database** - Choose one:
   - Railway: https://railway.app (easiest)
   - Supabase: https://supabase.com
   - Neon: https://neon.tech

4. **Cloudflare Account** - https://dash.cloudflare.com
   - For deploying Workers (MCPs and Agent)

5. **Blockchain Wallet** - MetaMask or similar
   - Get testnet ETH from https://www.alchemy.com/faucets/base-sepolia

### **Optional Services**
6. **Moralis** - https://admin.moralis.io (for ChainIntel)
7. **Helius** - https://www.helius.dev (for Solana analysis)
8. **Anthropic** - https://console.anthropic.com (for AI agent)
9. **Pinata** - https://app.pinata.cloud (for IPFS)

---

## 🏗️ **STEP 1: Backend Setup**

### **1.1 Set Up Database**

**Using Railway (Recommended):**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add PostgreSQL
railway add postgresql

# Get DATABASE_URL
railway variables
# Copy the DATABASE_URL value
```

**Or use Supabase:**
1. Go to https://supabase.com/dashboard
2. Create new project
3. Wait for database to provision
4. Go to Settings → Database → Connection String
5. Copy the connection string

### **1.2 Configure Backend**

```bash
cd backend

# Install dependencies
npm install

# The .env file is already created, edit it:
nano .env

# Set these values:
# - DATABASE_URL=postgresql://... (from step 1.1)
# - FRONTEND_URL=http://localhost:5173 (for now)
# - JWT_SECRET=$(openssl rand -base64 32)
```

### **1.3 Initialize Database**

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Verify connection
npx prisma studio
# Should open http://localhost:5555 with your database
```

### **1.4 Start Backend**

```bash
# Development
npm run dev

# Should see:
# ✅ All routes imported
# ✅ Database connected
# 🚀 Server running on http://localhost:3000
```

Test health check:
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","database":"connected"}
```

---

## 🎨 **STEP 2: Frontend Setup**

### **2.1 Configure Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Edit .env file:
nano .env

# Set these values (get from services):
# VITE_REOWN_PROJECT_ID=... (from Reown dashboard)
# VITE_THIRDWEB_CLIENT_ID=... (from Thirdweb dashboard)
# VITE_API_URL=http://localhost:3000/api
# VITE_PLATFORM_WALLET=0xYourWalletAddress
```

### **2.2 Start Frontend**

```bash
npm run dev

# Should open http://localhost:5173
```

Test:
1. Open http://localhost:5173
2. Click "Connect Wallet"
3. Connect MetaMask
4. Should see Dashboard

---

## 📜 **STEP 3: Deploy Smart Contract**

### **3.1 Install Foundry**

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version
```

### **3.2 Deploy TaskEscrow Contract**

```bash
cd contracts

# Create .env for deployment
cat > .env << EOF
PRIVATE_KEY=your_private_key_here
PLATFORM_WALLET=0xYourWalletAddress
BASESCAN_API_KEY=your_basescan_api_key
EOF

# Deploy to Base Sepolia
forge create \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --constructor-args $PLATFORM_WALLET \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY \
  src/TaskEscrow.sol:TaskEscrow

# ⚠️ SAVE THE DEPLOYED CONTRACT ADDRESS!
# Example output:
# Deployed to: 0x1234567890123456789012345678901234567890
```

### **3.3 Update Contract Address**

```bash
# Add to frontend/.env
echo "VITE_TASK_ESCROW_ADDRESS=0xYourDeployedContractAddress" >> ../frontend/.env

# Restart frontend
cd ../frontend
npm run dev
```

Test contract deployment:
```bash
# In browser console:
# Go to http://localhost:5173/dashboard
# Open DevTools Console
# Run:
await window.ethereum.request({ method: 'eth_getCode', params: ['0xYourContractAddress', 'latest'] })
# Should return bytecode (long hex string), not "0x"
```

---

## ☁️ **STEP 4: Deploy ChainIntel MCP Worker**

### **4.1 Install Wrangler**

```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### **4.2 Deploy ChainIntel MCP**

```bash
cd mcps/chainintel-mcp

# Install dependencies
npm install

# Set secrets (you'll be prompted for each value)
wrangler secret put MORALIS_API_KEY
# Enter your Moralis API key

wrangler secret put HELIUS_API_KEY
# Enter your Helius API key

wrangler secret put ANTHROPIC_API_KEY
# Enter your Anthropic API key

wrangler secret put THIRDWEB_SECRET_KEY
# Enter your Thirdweb secret key

wrangler secret put PLATFORM_WALLET
# Enter your platform wallet address

wrangler secret put PINATA_JWT
# Enter your Pinata JWT

# Deploy
wrangler deploy

# ⚠️ SAVE THE WORKER URL!
# Example: https://chainintel-mcp.yourname.workers.dev
```

### **4.3 Test ChainIntel MCP**

```bash
# Test the deployed worker
curl https://chainintel-mcp.yourname.workers.dev/

# Should return MCP server info
```

### **4.4 Update Frontend Config**

```bash
# Add to frontend/.env
echo "VITE_CHAININTEL_MCP_URL=https://chainintel-mcp.yourname.workers.dev" >> ../../frontend/.env
```

---

## 🤖 **STEP 5: Deploy Autonomous Agent Worker**

### **5.1 Deploy Agent**

```bash
cd autonomous-agent

# Install dependencies
npm install

# Set secrets
wrangler secret put ANTHROPIC_API_KEY
# Enter your Anthropic API key

wrangler secret put THIRDWEB_CLIENT_ID
# Enter your Thirdweb client ID

wrangler secret put THIRDWEB_SECRET_KEY
# Enter your Thirdweb secret key

wrangler secret put AGENT_PRIVATE_KEY
# Enter a private key for the agent wallet (generate new one for security)

# Update wrangler.jsonc with ChainIntel URL
nano wrangler.jsonc
# Set CHAININTEL_URL to your deployed ChainIntel URL

# Build and deploy
npm run build
wrangler deploy

# ⚠️ SAVE THE WORKER URL!
# Example: https://aetheraos-agent.yourname.workers.dev
```

### **5.2 Test Agent**

```bash
# Test the deployed agent
curl https://aetheraos-agent.yourname.workers.dev/

# Should return agent info
```

### **5.3 Update Frontend Config**

```bash
# Add to frontend/.env
echo "VITE_AGENT_URL=https://aetheraos-agent.yourname.workers.dev" >> ../../frontend/.env

# Restart frontend to load new config
cd ../../frontend
npm run dev
```

---

## 🌐 **STEP 6: Deploy to Production**

### **6.1 Deploy Frontend (Vercel)**

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? aetheraos
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod

# ⚠️ SAVE THE PRODUCTION URL!
# Example: https://aetheraos.vercel.app
```

### **6.2 Deploy Backend (Railway)**

```bash
cd backend

# Login to Railway
railway login

# Create new service
railway up

# Set environment variables in Railway dashboard:
railway open
# Go to Variables tab and add all from backend/.env

# Deploy
git add .
git commit -m "Production deployment"
railway up

# ⚠️ SAVE THE BACKEND URL!
# Example: https://aetheraos-backend-production.up.railway.app
```

### **6.3 Update Production URLs**

Update frontend environment variables in Vercel:
```bash
# Go to: https://vercel.com/your-project/settings/environment-variables
# Update:
VITE_API_URL=https://your-backend.railway.app/api
VITE_CHAININTEL_MCP_URL=https://chainintel-mcp.yourname.workers.dev
VITE_AGENT_URL=https://aetheraos-agent.yourname.workers.dev
VITE_TASK_ESCROW_ADDRESS=0xYourContractAddress

# Redeploy frontend
vercel --prod
```

Update backend CORS:
```bash
# In Railway dashboard, update:
FRONTEND_URL=https://aetheraos.vercel.app
ALLOWED_ORIGINS=https://aetheraos.vercel.app

# Or via CLI:
railway variables set FRONTEND_URL=https://aetheraos.vercel.app
```

---

## ✅ **STEP 7: Verify Production Deployment**

### **Test Checklist:**

- [ ] **Frontend loads**: Visit https://aetheraos.vercel.app
- [ ] **Wallet connects**: Click "Connect Wallet"
- [ ] **Backend health**: Visit https://your-backend.railway.app/health
- [ ] **Database works**: Create a task in UI
- [ ] **Contract deployed**: View on BaseScan
- [ ] **ChainIntel responds**: Test agent chat
- [ ] **Agent responds**: Ask agent a question
- [ ] **Payments work**: Try paid agent query (with x402)

### **Troubleshooting:**

**Frontend won't load:**
- Check Vercel deployment logs
- Verify all env vars are set in Vercel dashboard

**Backend errors:**
- Check Railway logs: `railway logs`
- Verify DATABASE_URL is correct
- Run migrations: `railway run npx prisma db push`

**Contract not found:**
- Verify contract address in .env
- Check BaseScan: https://sepolia.basescan.org/address/0xYourAddress

**Workers failing:**
- Check Cloudflare logs: `wrangler tail`
- Verify all secrets are set: `wrangler secret list`

**Agent returning errors:**
- Check ChainIntel MCP is deployed
- Verify CHAININTEL_URL in agent wrangler.jsonc
- Check x402 payment implementation

---

## 🔐 **STEP 8: Security Hardening**

### **8.1 Rotate Secrets**

Generate new production secrets:
```bash
# Generate new JWT secret
openssl rand -base64 32

# Update in Railway
railway variables set JWT_SECRET=new_secret_here
```

### **8.2 Enable Rate Limiting**

Optional but recommended - set up Redis:
```bash
# Get Redis URL from Upstash
# Add to backend:
railway variables set REDIS_URL=redis://...

# Backend will automatically use Redis for distributed rate limiting
```

### **8.3 Monitor Errors**

Optional - set up Sentry:
```bash
# Create project at https://sentry.io
# Add to backend and frontend:
railway variables set SENTRY_DSN=https://...@sentry.io/...
vercel env add VITE_SENTRY_DSN
```

---

## 🎉 **DONE!**

Your AetheraOS is now live in production!

**Production URLs:**
- Frontend: https://aetheraos.vercel.app
- Backend: https://your-backend.railway.app
- Contract: https://sepolia.basescan.org/address/0xYourContract
- ChainIntel: https://chainintel-mcp.yourname.workers.dev
- Agent: https://aetheraos-agent.yourname.workers.dev

**Next Steps:**
1. Test all features end-to-end
2. Share with beta users
3. Monitor logs for errors
4. Submit to hackathon!

**Need Help?**
- Check logs: `railway logs` or `vercel logs`
- Debug Workers: `wrangler tail your-worker-name`
- Database issues: `railway run npx prisma studio`

---

**Remember:** This is Track 2 (non-Nullshot framework). Your custom autonomous agent with Claude + MCP + x402 payments is ready! 🚀
