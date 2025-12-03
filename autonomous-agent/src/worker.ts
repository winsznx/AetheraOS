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
}

interface QueryRequest {
  query: string;
}

interface ExecuteRequest {
  plan: any;
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
      // Use native fetch - ChainIntel MCP handles payments internally
      // Bind fetch to globalThis to avoid "Illegal invocation" error in Workers
      const boundFetch = fetch.bind(globalThis);

      // Initialize agent
      const agent = new AutonomousAgent({
        anthropicApiKey: env.ANTHROPIC_API_KEY,
        chainIntelUrl: env.CHAININTEL_URL || 'https://chainintel-mcp.workers.dev',
        fetchWithPayment: boundFetch,
        chainIntelApiKey: 'aetheraos-agent-internal' // API key for bypassing x402 payments
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
        const { plan } = body;

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

        const result = await agent.executePlan(plan);

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
