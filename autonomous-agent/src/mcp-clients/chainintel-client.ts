/**
 * ChainIntel MCP Client
 * Handles communication with ChainIntel MCP including payment
 * Supports ALL 27 tools dynamically via MCP protocol
 */

import { wrapFetchWithPayment } from 'thirdweb/x402';

export interface ChainIntelClient {
  baseUrl: string;
  fetch: typeof fetch;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export function createChainIntelClient(baseUrl: string, fetchWithPayment: typeof fetch): ChainIntelClient {
  return {
    baseUrl,
    fetch: fetchWithPayment
  };
}

/**
 * List all available tools from ChainIntel MCP
 */
export async function listTools(client: ChainIntelClient): Promise<MCPTool[]> {
  const response = await client.fetch(`${client.baseUrl}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to list tools: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result?.tools || [];
}

/**
 * Call any ChainIntel MCP tool dynamically with payment
 * @param client - ChainIntel client
 * @param toolName - Name of the tool to call (e.g., 'analyze_wallet', 'find_arbitrage')
 * @param params - Tool parameters as object
 */
export async function callTool(
  client: ChainIntelClient,
  toolName: string,
  params: any
): Promise<any> {
  const response = await client.fetch(`${client.baseUrl}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: params
      },
      id: Date.now()
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ChainIntel ${toolName} failed: ${error.error || response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}

// ============================================================================
// CONVENIENCE FUNCTIONS (Legacy - prefer using callTool() directly)
// These are kept for backward compatibility
// ============================================================================

/**
 * Analyze wallet with payment
 * @deprecated Use callTool(client, 'analyze_wallet', params) instead
 */
export async function analyzeWallet(
  client: ChainIntelClient,
  params: {
    address: string;
    chain: 'base' | 'ethereum' | 'solana';
    depth?: 'quick' | 'standard' | 'deep';
    includeCrossChain?: boolean;
  }
) {
  const response = await client.fetch(`${client.baseUrl}/analyze-wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ChainIntel analyze-wallet failed: ${error.error}`);
  }

  return await response.json();
}

/**
 * Detect whales with payment
 */
export async function detectWhales(
  client: ChainIntelClient,
  params: {
    chain: 'base' | 'ethereum' | 'solana';
    minPortfolioValue?: number;
    addresses?: string[];
  }
) {
  const response = await client.fetch(`${client.baseUrl}/detect-whales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ChainIntel detect-whales failed: ${error.error}`);
  }

  return await response.json();
}

/**
 * Track smart money with payment
 */
export async function trackSmartMoney(
  client: ChainIntelClient,
  params: {
    address: string;
    chain: 'base' | 'ethereum' | 'solana';
    lookbackDays?: number;
  }
) {
  const response = await client.fetch(`${client.baseUrl}/smart-money-tracker`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ChainIntel smart-money-tracker failed: ${error.error}`);
  }

  return await response.json();
}

/**
 * Calculate risk score with payment
 */
export async function getRiskScore(
  client: ChainIntelClient,
  params: {
    address: string;
    chain: 'base' | 'ethereum' | 'solana';
  }
) {
  const response = await client.fetch(`${client.baseUrl}/risk-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ChainIntel risk-score failed: ${error.error}`);
  }

  return await response.json();
}

/**
 * Analyze trading patterns with payment
 */
export async function getTradingPatterns(
  client: ChainIntelClient,
  params: {
    address: string;
    chain: 'base' | 'ethereum' | 'solana';
    minTrades?: number;
  }
) {
  const response = await client.fetch(`${client.baseUrl}/trading-patterns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ChainIntel trading-patterns failed: ${error.error}`);
  }

  return await response.json();
}

/**
 * Get pricing information
 */
export async function getPricing(client: ChainIntelClient) {
  const response = await fetch(`${client.baseUrl}/pricing`);
  return await response.json();
}
