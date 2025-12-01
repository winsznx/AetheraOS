/**
 * ChainIntel MCP Client
 * Handles communication with ChainIntel MCP including payment
 */

import { wrapFetchWithPayment } from 'thirdweb/x402';

export interface ChainIntelClient {
  baseUrl: string;
  fetch: typeof fetch;
}

export function createChainIntelClient(baseUrl: string, fetchWithPayment: typeof fetch): ChainIntelClient {
  return {
    baseUrl,
    fetch: fetchWithPayment
  };
}

/**
 * Analyze wallet with payment
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
