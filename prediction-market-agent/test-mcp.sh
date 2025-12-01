#!/bin/bash

# Test initialize
echo "=== Testing initialize ==="
curl -X POST https://prediction-market-agent.timjosh507.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "1.0.0",
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }'

echo -e "\n\n=== Testing tools/list ==="
curl -X POST https://prediction-market-agent.timjosh507.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'

echo -e "\n\n=== Testing tools/call (get-market-data) ==="
curl -X POST https://prediction-market-agent.timjosh507.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get-market-data",
      "arguments": {
        "marketId": "btc-100k-2024",
        "source": "polymarket"
      }
    }
  }'

echo ""
