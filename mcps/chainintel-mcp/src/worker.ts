/**
 * Cloudflare Worker for ChainIntel MCP
 * HTTP API with x402 payment verification
 */

import { executePaidTool, getPricingInfo } from './payment/x402-guard';

// Import API initializers
import { initMoralis } from './apis/moralis';
import { initHelius } from './apis/helius';
import { initClaude } from './apis/claude';

// Import wallet intelligence tools
import { analyzeWalletTool, AnalyzeWalletSchema } from './tools/analyze-wallet';
import { detectWhalesTool, DetectWhalesSchema } from './tools/detect-whales';
import { smartMoneyTrackerTool, SmartMoneyTrackerSchema } from './tools/smart-money-tracker';
import { riskScoreTool, RiskScoreSchema } from './tools/risk-score';
import { tradingPatternsTool, TradingPatternsSchema } from './tools/trading-patterns';

// Import task escrow tools
import {
  createTaskToolDef,
  claimTaskToolDef,
  submitWorkToolDef,
  verifyWorkToolDef,
  getTaskToolDef,
  CreateTaskSchema,
  ClaimTaskSchema,
  SubmitWorkSchema,
  VerifyWorkSchema,
  GetTaskSchema
} from './tools/task-escrow';

// Import IPFS storage tools
import {
  uploadWorkProofToolDef,
  uploadJSONToolDef,
  downloadProofToolDef,
  pinToIPFSToolDef,
  getIPFSUrlToolDef,
  UploadWorkProofSchema,
  UploadJSONSchema,
  DownloadProofSchema,
  PinHashSchema,
  GetIPFSUrlSchema
} from './tools/ipfs-storage';

// Import prediction market tools
import {
  getMarketDataToolDef,
  analyzeMarketToolDef,
  getTrendingMarketsToolDef,
  searchMarketsToolDef,
  GetMarketDataSchema,
  AnalyzeMarketSchema,
  GetTrendingMarketsSchema,
  SearchMarketsSchema
} from './tools/prediction-markets';

export interface Env {
  MORALIS_API_KEY: string;
  HELIUS_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  ALCHEMY_API_KEY?: string;
  THIRDWEB_SECRET_KEY: string;
  PLATFORM_WALLET: string;
  PINATA_API_KEY: string;
  PINATA_SECRET_KEY: string;
  PINATA_JWT: string;
  NETWORK?: 'mainnet' | 'testnet';
}

let initialized = false;

/**
 * Initialize APIs
 */
async function initialize(env: Env) {
  if (initialized) return;

  await initMoralis(env.MORALIS_API_KEY);
  initHelius(env.HELIUS_API_KEY);
  initClaude(env.ANTHROPIC_API_KEY);

  initialized = true;
}

/**
 * CORS headers
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-payment',
};

/**
 * Handle OPTIONS requests
 */
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

/**
 * Main worker handler
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Initialize APIs
    await initialize(env);

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Root endpoint - info
      if (path === '/' || path === '/info') {
        return new Response(
          JSON.stringify({
            name: 'ChainIntel MCP',
            version: '2.0.0',
            description: 'All-in-one AI-powered platform: Wallet intelligence, task escrow, IPFS storage, and prediction markets',
            categories: {
              'Wallet Intelligence': [
                'analyze-wallet',
                'detect-whales',
                'smart-money-tracker',
                'risk-score',
                'trading-patterns'
              ],
              'Task Escrow': [
                'create_task',
                'claim_task',
                'submit_work',
                'verify_work',
                'get_task'
              ],
              'IPFS Storage': [
                'upload_work_proof',
                'upload_json',
                'download_proof',
                'pin_to_ipfs',
                'get_ipfs_url'
              ],
              'Prediction Markets': [
                'get_market_data',
                'analyze_market',
                'get_trending_markets',
                'search_markets'
              ]
            },
            totalTools: 19,
            chains: ['base', 'ethereum', 'solana'],
            pricing: getPricingInfo(),
            payment: {
              protocol: 'x402',
              provider: 'thirdweb',
              network: env.NETWORK || 'testnet'
            },
            docs: 'https://docs.aetheraos.xyz/chainintel-mcp'
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS
            }
          }
        );
      }

      // Pricing endpoint
      if (path === '/pricing') {
        return new Response(
          JSON.stringify({
            tools: getPricingInfo()
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS
            }
          }
        );
      }

      // Tool endpoints with payment verification
      if (path === '/analyze-wallet' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'analyze-wallet',
          env,
          async () => {
            const body = await request.json();
            const input = AnalyzeWalletSchema.parse(body);
            return await analyzeWalletTool(input);
          }
        );
      }

      if (path === '/detect-whales' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'detect-whales',
          env,
          async () => {
            const body = await request.json();
            const input = DetectWhalesSchema.parse(body);
            return await detectWhalesTool(input);
          }
        );
      }

      if (path === '/smart-money-tracker' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'smart-money-tracker',
          env,
          async () => {
            const body = await request.json();
            const input = SmartMoneyTrackerSchema.parse(body);
            return await smartMoneyTrackerTool(input);
          }
        );
      }

      if (path === '/risk-score' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'risk-score',
          env,
          async () => {
            const body = await request.json();
            const input = RiskScoreSchema.parse(body);
            return await riskScoreTool(input);
          }
        );
      }

      if (path === '/trading-patterns' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'trading-patterns',
          env,
          async () => {
            const body = await request.json();
            const input = TradingPatternsSchema.parse(body);
            return await tradingPatternsTool(input);
          }
        );
      }

      // Task Escrow Tools
      if (path === '/create_task' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'create_task',
          env,
          async () => {
            const body = await request.json();
            const input = CreateTaskSchema.parse(body);
            return await createTaskToolDef.execute(input);
          }
        );
      }

      if (path === '/claim_task' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'claim_task',
          env,
          async () => {
            const body = await request.json();
            const input = ClaimTaskSchema.parse(body);
            return await claimTaskToolDef.execute(input);
          }
        );
      }

      if (path === '/submit_work' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'submit_work',
          env,
          async () => {
            const body = await request.json();
            const input = SubmitWorkSchema.parse(body);
            return await submitWorkToolDef.execute(input);
          }
        );
      }

      if (path === '/verify_work' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'verify_work',
          env,
          async () => {
            const body = await request.json();
            const input = VerifyWorkSchema.parse(body);
            return await verifyWorkToolDef.execute(input);
          }
        );
      }

      if (path === '/get_task' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'get_task',
          env,
          async () => {
            const body = await request.json();
            const input = GetTaskSchema.parse(body);
            return await getTaskToolDef.execute(input);
          }
        );
      }

      // IPFS Storage Tools
      if (path === '/upload_work_proof' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'upload_work_proof',
          env,
          async () => {
            const body = await request.json();
            const input = UploadWorkProofSchema.parse(body);
            return await uploadWorkProofToolDef.execute(input);
          }
        );
      }

      if (path === '/upload_json' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'upload_json',
          env,
          async () => {
            const body = await request.json();
            const input = UploadJSONSchema.parse(body);
            return await uploadJSONToolDef.execute(input);
          }
        );
      }

      if (path === '/download_proof' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'download_proof',
          env,
          async () => {
            const body = await request.json();
            const input = DownloadProofSchema.parse(body);
            return await downloadProofToolDef.execute(input);
          }
        );
      }

      if (path === '/pin_to_ipfs' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'pin_to_ipfs',
          env,
          async () => {
            const body = await request.json();
            const input = PinHashSchema.parse(body);
            return await pinToIPFSToolDef.execute(input);
          }
        );
      }

      if (path === '/get_ipfs_url' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'get_ipfs_url',
          env,
          async () => {
            const body = await request.json();
            const input = GetIPFSUrlSchema.parse(body);
            return await getIPFSUrlToolDef.execute(input);
          }
        );
      }

      // Prediction Market Tools
      if (path === '/get_market_data' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'get_market_data',
          env,
          async () => {
            const body = await request.json();
            const input = GetMarketDataSchema.parse(body);
            return await getMarketDataToolDef.execute(input);
          }
        );
      }

      if (path === '/analyze_market' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'analyze_market',
          env,
          async () => {
            const body = await request.json();
            const input = AnalyzeMarketSchema.parse(body);
            return await analyzeMarketToolDef.execute(input);
          }
        );
      }

      if (path === '/get_trending_markets' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'get_trending_markets',
          env,
          async () => {
            const body = await request.json();
            const input = GetTrendingMarketsSchema.parse(body);
            return await getTrendingMarketsToolDef.execute(input);
          }
        );
      }

      if (path === '/search_markets' && request.method === 'POST') {
        return await executePaidTool(
          request,
          'search_markets',
          env,
          async () => {
            const body = await request.json();
            const input = SearchMarketsSchema.parse(body);
            return await searchMarketsToolDef.execute(input);
          }
        );
      }

      // 404
      return new Response(
        JSON.stringify({
          error: 'Not found',
          path,
          availableEndpoints: [
            '/',
            '/pricing',
            // Wallet Intelligence
            '/analyze-wallet',
            '/detect-whales',
            '/smart-money-tracker',
            '/risk-score',
            '/trading-patterns',
            // Task Escrow
            '/create_task',
            '/claim_task',
            '/submit_work',
            '/verify_work',
            '/get_task',
            // IPFS Storage
            '/upload_work_proof',
            '/upload_json',
            '/download_proof',
            '/pin_to_ipfs',
            '/get_ipfs_url',
            // Prediction Markets
            '/get_market_data',
            '/analyze_market',
            '/get_trending_markets',
            '/search_markets'
          ]
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
          }
        }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          error: error.message,
          stack: error.stack
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
          }
        }
      );
    }
  }
};
