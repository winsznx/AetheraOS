/**
 * x402 Payment utilities for Cloudflare Workers
 * Server-side payment integration with Thirdweb
 */

import { createThirdwebClient } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';

const BASE_SEPOLIA_CHAIN_ID = 84532;

/**
 * Create a fetch wrapper that adds x402 payment headers
 */
export function createPaymentFetch(secretKey: string): typeof fetch {
  const client = createThirdwebClient({ secretKey });

  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Make initial request to get payment details
    const initialResponse = await fetch(url, init);

    // If no payment required, return response
    if (initialResponse.ok) {
      return initialResponse;
    }

    // Check if payment is required
    const errorData = await initialResponse.json().catch(() => null);

    if (!errorData?.payment_required) {
      // Not a payment error, return original response
      return new Response(JSON.stringify(errorData), {
        status: initialResponse.status,
        headers: initialResponse.headers
      });
    }

    // Payment required - for now, return descriptive error
    // TODO: Implement actual payment signing with Thirdweb SDK
    const paymentError = {
      error: 'Payment required but not yet implemented',
      details: errorData.payment_details,
      message: 'x402 payment integration is in progress. Agent can plan queries but cannot execute paid MCP tools yet.'
    };

    return new Response(JSON.stringify(paymentError), {
      status: 402,
      headers: { 'Content-Type': 'application/json' }
    });
  };
}

/**
 * Simple wrapper that passes through fetch without payment
 * Use this for now until full payment integration is ready
 */
export function createPassthroughFetch(): typeof fetch {
  return fetch.bind(globalThis);
}
