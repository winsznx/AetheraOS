#!/bin/bash
# Load .env file
source .env

# Set all secrets
echo "Setting Cloudflare Worker secrets..."

echo "$MORALIS_API_KEY" | npx wrangler secret put MORALIS_API_KEY
echo "$HELIUS_API_KEY" | npx wrangler secret put HELIUS_API_KEY
echo "$ANTHROPIC_API_KEY" | npx wrangler secret put ANTHROPIC_API_KEY
echo "$THIRDWEB_SECRET_KEY" | npx wrangler secret put THIRDWEB_SECRET_KEY
echo "$PLATFORM_WALLET" | npx wrangler secret put PLATFORM_WALLET
echo "$PINATA_API_KEY" | npx wrangler secret put PINATA_API_KEY
echo "$PINATA_SECRET_KEY" | npx wrangler secret put PINATA_SECRET_KEY
echo "$PINATA_JWT" | npx wrangler secret put PINATA_JWT

echo "✅ All secrets set!"
