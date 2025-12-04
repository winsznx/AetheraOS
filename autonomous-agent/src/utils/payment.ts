/**
 * x402 Payment utilities for Autonomous Agent
 * Agent-side payment integration using Thirdweb wrapFetchWithPayment
 *
 * Based on: https://portal.thirdweb.com/x402/agents
 */

import { createThirdwebClient } from 'thirdweb';
import { privateKeyToAccount } from 'thirdweb/wallets';
import { wrapFetchWithPayment } from 'thirdweb/x402';

/**
 * Create a fetch wrapper that handles x402 payments automatically
 * Uses Thirdweb's official wrapFetchWithPayment for agents
 *
 * @param clientId - Thirdweb client ID
 * @param secretKey - Thirdweb secret key
 * @param agentPrivateKey - Private key for agent wallet (to pay for resources)
 * @returns Enhanced fetch function that handles payments
 */
export function createPaymentFetch(
  clientId: string,
  secretKey: string,
  agentPrivateKey?: string
): typeof fetch {
  // If no agent private key, return passthrough fetch
  if (!agentPrivateKey) {
    console.log('[x402] No agent wallet configured - using passthrough fetch');
    return fetch.bind(globalThis);
  }

  // Create Thirdweb client
  const client = createThirdwebClient({
    clientId,
    secretKey
  });

  // Create wallet from private key
  const agentWallet = privateKeyToAccount({
    client,
    privateKey: agentPrivateKey
  });

  console.log('[x402] Agent wallet configured:', agentWallet.address);

  // Wrap fetch with automatic x402 payment handling
  // This automatically:
  // 1. Detects 402 responses
  // 2. Extracts payment details
  // 3. Executes payment from agent wallet
  // 4. Retries request with payment proof
  return wrapFetchWithPayment(fetch, client, agentWallet);
}

/**
 * Simple wrapper that passes through fetch without payment
 * Use this for testing or when payments are not needed
 */
export function createPassthroughFetch(): typeof fetch {
  // Return the global fetch directly - do NOT bind
  return fetch;
}
