/**
 * ChainIntel MCP Server - Main server implementation
 * Provides cross-chain wallet intelligence with AI-powered analysis
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';

// Import API initializers
import { initMoralis } from './apis/moralis';
import { initHelius } from './apis/helius';
import { initClaude } from './apis/claude';
import { initPolymarket } from './apis/polymarket-advanced';

// Import tool definitions - Wallet Intelligence
import { analyzeWalletToolDef } from './tools/analyze-wallet';
import { detectWhalesToolDef } from './tools/detect-whales';
import { smartMoneyTrackerToolDef } from './tools/smart-money-tracker';
import { riskScoreToolDef } from './tools/risk-score';
import { tradingPatternsToolDef } from './tools/trading-patterns';

// Import tool definitions - Task Management
import {
  createTaskToolDef,
  claimTaskToolDef,
  submitWorkToolDef,
  verifyWorkToolDef,
  getTaskToolDef
} from './tools/task-escrow';

// Import tool definitions - IPFS Storage
import {
  uploadWorkProofToolDef,
  uploadJSONToolDef,
  downloadProofToolDef,
  pinToIPFSToolDef,
  getIPFSUrlToolDef
} from './tools/ipfs-storage';

// Import tool definitions - Prediction Markets (Advanced)
import {
  advancedPredictionMarketTools
} from './tools/prediction-markets-advanced';

// Tool registry - ALL-IN-ONE ChainIntel MCP
const TOOLS = [
  // Wallet Intelligence (5 tools)
  analyzeWalletToolDef,
  detectWhalesToolDef,
  smartMoneyTrackerToolDef,
  riskScoreToolDef,
  tradingPatternsToolDef,
  // Task Escrow (5 tools)
  createTaskToolDef,
  claimTaskToolDef,
  submitWorkToolDef,
  verifyWorkToolDef,
  getTaskToolDef,
  // IPFS Storage (5 tools)
  uploadWorkProofToolDef,
  uploadJSONToolDef,
  downloadProofToolDef,
  pinToIPFSToolDef,
  getIPFSUrlToolDef,
  // Advanced Prediction Markets (8 tools)
  ...advancedPredictionMarketTools
];

/**
 * Initialize ChainIntel MCP Server
 */
export async function createChainIntelServer(env: any) {
  // Initialize API clients
  await initMoralis(env.MORALIS_API_KEY);
  initHelius(env.HELIUS_API_KEY);
  initClaude(env.ANTHROPIC_API_KEY);
  initPolymarket(env.POLYMARKET_API_KEY); // Optional - API is publicly accessible

  // Create MCP server
  const server = new Server(
    {
      name: 'chainintel-mcp',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOLS.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: {
          type: 'object',
          properties: tool.parameters.shape,
          required: Object.keys(tool.parameters.shape)
        }
      })) as Tool[]
    };
  });

  // Register tool execution handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Find tool
    const tool = TOOLS.find(t => t.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      // Validate input
      const validatedArgs = tool.parameters.parse(args);

      // Execute tool
      const result = await tool.execute(validatedArgs as any);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error.message,
              tool: name
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  return server;
}

/**
 * Start the server (for stdio transport)
 */
export async function startServer() {
  // Get environment variables
  const env = {
    MORALIS_API_KEY: process.env.MORALIS_API_KEY!,
    HELIUS_API_KEY: process.env.HELIUS_API_KEY!,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
    THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY!,
    PLATFORM_WALLET: process.env.PLATFORM_WALLET!
  };

  // Validate required env vars
  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Create and start server
  const server = await createChainIntelServer(env);
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error('ChainIntel MCP server started');
}

// Start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(console.error);
}
