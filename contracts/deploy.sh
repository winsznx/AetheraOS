#!/bin/bash

# AetheraOS Smart Contract Deployment Script
# Deploys TaskEscrow to Base Sepolia testnet

set -e  # Exit on error

echo "========================================="
echo "AetheraOS Contract Deployment"
echo "========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from template..."
    cat > .env << EOF
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Platform wallet address (receives 2% fee)
PLATFORM_WALLET=your_wallet_address_here

# Base Sepolia RPC
RPC_URL=https://sepolia.base.org

# Basescan API key for verification (get from https://basescan.org/myapikey)
BASESCAN_API_KEY=your_basescan_api_key_here
EOF
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env and add your values, then run this script again"
    exit 1
fi

# Load environment
source .env

# Validate environment variables
if [ "$PRIVATE_KEY" = "your_private_key_here" ]; then
    echo "❌ Error: Please set PRIVATE_KEY in .env"
    exit 1
fi

if [ "$PLATFORM_WALLET" = "your_wallet_address_here" ]; then
    echo "❌ Error: Please set PLATFORM_WALLET in .env"
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "   Network: Base Sepolia (Chain ID: 84532)"
echo "   RPC URL: $RPC_URL"
echo "   Platform Wallet: $PLATFORM_WALLET"
echo ""

# Check balance
echo "💰 Checking deployer balance..."
DEPLOYER_ADDRESS=$(cast wallet address $PRIVATE_KEY)
BALANCE=$(cast balance $DEPLOYER_ADDRESS --rpc-url $RPC_URL)
BALANCE_ETH=$(cast to-unit $BALANCE ether)

echo "   Deployer: $DEPLOYER_ADDRESS"
echo "   Balance: $BALANCE_ETH ETH"

if [ "$(echo "$BALANCE_ETH < 0.001" | bc)" -eq 1 ]; then
    echo ""
    echo "❌ Error: Insufficient balance!"
    echo "   You need at least 0.001 ETH for deployment"
    echo ""
    echo "Get testnet ETH from:"
    echo "   https://www.alchemy.com/faucets/base-sepolia"
    echo "   https://basescan.org/faucet"
    exit 1
fi

echo ""
echo "🚀 Deploying TaskEscrow contract..."
echo ""

# Deploy using forge script
forge script script/Deploy.s.sol:DeployTaskEscrow \
    --rpc-url $RPC_URL \
    --broadcast \
    --verify \
    --etherscan-api-key $BASESCAN_API_KEY \
    -vvvv

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Contract address saved in broadcast/ folder"
echo "Check deployment: broadcast/Deploy.s.sol/84532/run-latest.json"
