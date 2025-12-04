/**
 * Cloudflare Worker for Autonomous Agent
 * Exposes agent as HTTP API
 */

import { AutonomousAgent } from './agent';

export interface Env {
  ANTHROPIC_API_KEY: string;
  CHAININTEL_URL: string;
  THIRDWEB_CLIENT_ID: string;
  THIRDWEB_SECRET_KEY: string;
  AGENT_PRIVATE_KEY?: string; // Optional: Private key for agent wallet to pay for MCPs
}

interface QueryRequest {
  query: string;
}

interface ExecuteRequest {
  plan: any;
  paymentProof?: {
    transactionHash: string;
    amount: string;
    chain: string;
    from: string;
  };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Import payment utilities
      const { createPaymentFetch, createPassthroughFetch } = await import('./utils/payment');

      // Create payment-enabled fetch or passthrough
      // If AGENT_PRIVATE_KEY is set, enable x402 payments
      // Otherwise, use passthrough (for testing or free endpoints)
      const fetchWithPayment = env.AGENT_PRIVATE_KEY
        ? createPaymentFetch(
            env.THIRDWEB_CLIENT_ID,
            env.THIRDWEB_SECRET_KEY,
            env.AGENT_PRIVATE_KEY
          )
        : createPassthroughFetch();

      console.log('[Worker] Payment mode:', env.AGENT_PRIVATE_KEY ? 'x402 enabled' : 'passthrough (no payments)');

      // Initialize agent WITHOUT API key bypass
      // Agent will use x402 payments to access ChainIntel MCP
      const agent = new AutonomousAgent({
        anthropicApiKey: env.ANTHROPIC_API_KEY,
        chainIntelUrl: env.CHAININTEL_URL || 'https://chainintel-mcp.workers.dev',
        fetchWithPayment
        // ❌ REMOVED: chainIntelApiKey bypass - now uses x402 payments!
      });

      // Root endpoint - info
      if (path === '/' || path === '/info') {
        return new Response(
          JSON.stringify({
            name: 'AetheraOS Autonomous Agent',
            version: '1.0.0',
            description: 'Intelligent agent that orchestrates multiple MCPs',
            endpoints: [
              '/query - Process natural language query',
              '/plan - Get execution plan without executing',
              '/execute - Execute pre-approved plan'
            ],
            mcps: [
              'ChainIntel - Wallet analysis',
              'Sentiment Analyzer - Social sentiment (coming soon)',
              'Prediction Market - Market data (coming soon)',
              'Task Orchestrator - On-chain tasks (coming soon)'
            ]
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

      // Process query endpoint
      if (path === '/query' && request.method === 'POST') {
        const body = await request.json() as QueryRequest;
        const { query } = body;

        if (!query) {
          return new Response(
            JSON.stringify({ error: 'Missing query parameter' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...CORS_HEADERS
              }
            }
          );
        }

        const result = await agent.processQuery(query);

        // Always return 200 - errors are in the response body with success: false
        return new Response(
          JSON.stringify(result, null, 2),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS
            }
          }
        );
      }

      // Plan query endpoint (no execution)
      if (path === '/plan' && request.method === 'POST') {
        const body = await request.json() as QueryRequest;
        const { query } = body;

        if (!query) {
          return new Response(
            JSON.stringify({ error: 'Missing query parameter' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...CORS_HEADERS
              }
            }
          );
        }

        const plan = await agent.planQuery(query);

        return new Response(
          JSON.stringify(plan, null, 2),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS
            }
          }
        );
      }

      // Execute plan endpoint
      if (path === '/execute' && request.method === 'POST') {
        const body = await request.json() as ExecuteRequest;
        const { plan, paymentProof } = body;

        if (!plan) {
          return new Response(
            JSON.stringify({ error: 'Missing plan parameter' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...CORS_HEADERS
              }
            }
          );
        }

        // Execute with user payment proof if provided, otherwise use agent wallet
        const result = paymentProof
          ? await agent.executePlanWithPayment(plan, paymentProof)
          : await agent.executePlan(plan);

        return new Response(
          JSON.stringify(result, null, 2),
          {
            status: result.success ? 200 : 500,
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS
            }
          }
        );
      }

      // 404
      return new Response(
        JSON.stringify({
          error: 'Not found',
          path,
          availableEndpoints: ['/', '/query', '/plan', '/execute']
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
