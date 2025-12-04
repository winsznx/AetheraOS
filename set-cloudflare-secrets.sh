#!/bin/bash

# Cloudflare API script to set SERVER_WALLET secret
# This bypasses the wrangler CLI limitation

echo "To set SERVER_WALLET via Cloudflare Dashboard:"
echo ""
echo "1. Autonomous Agent:"
echo "   https://dash.cloudflare.com > Workers & Pages > aetheraos-autonomous-agent > Settings > Variables"
echo "   Add environment variable:"
echo "   - Name: SERVER_WALLET"
echo "   - Value: 0x062c7873F07b6FBd127281B6a222284093E8B7e7"
echo "   - Type: Secret (encrypted)"
echo ""
echo "2. ChainIntel MCP:"
echo "   https://dash.cloudflare.com > Workers & Pages > chainintel-mcp > Settings > Variables"
echo "   Add environment variable:"
echo "   - Name: SERVER_WALLET"
echo "   - Value: 0x062c7873F07b6FBd127281B6a222284093E8B7e7"
echo "   - Type: Secret (encrypted)"
echo ""
echo "Note: .dev.vars files created for local development"
