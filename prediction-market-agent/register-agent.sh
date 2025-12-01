#!/bin/bash

# Register Prediction Market Agent with Edenlayer Protocol
#
# Before running this script:
# 1. Get your Edenlayer API key from https://edenlayer.com
# 2. Set it as an environment variable: export EDENLAYER_API_KEY="your_key_here"
#
# Or run with: EDENLAYER_API_KEY="your_key" ./register-agent.sh

if [ -z "$EDENLAYER_API_KEY" ]; then
  echo "Error: EDENLAYER_API_KEY environment variable not set"
  echo "Usage: EDENLAYER_API_KEY='your_key' ./register-agent.sh"
  exit 1
fi

echo "Registering Prediction Market Agent with Edenlayer Protocol..."
echo "API URL: https://api.edenlayer.com"
echo "MCP URL: https://prediction-market-agent.timjosh507.workers.dev/mcp"
echo ""

curl -X POST https://api.edenlayer.com/agents \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: $EDENLAYER_API_KEY" \
  -d @register-agent.json \
  --fail-with-body \
  -v

echo ""
echo ""
echo "If registration succeeded, your agent should now be discoverable in AetheraOS Marketplace!"
