/**
 * x402 Payment utilities for Cloudflare Workers
 * Server-side payment integration with Thirdweb
 *
 * Based on Thirdweb x402 protocol documentation:
 * https://portal.thirdweb.com/x402
 */

import { createThirdwebClient } from 'thirdweb';
import { baseSepolia } from 'thirdweb/chains';
import { privateKeyToAccount } from 'thirdweb/wallets';
import { sendTransaction, prepareTransaction } from 'thirdweb';
import { parseEther } from 'viem';

const BASE_SEPOLIA_CHAIN_ID = 84532;

interface PaymentDetails {
  amount: string;
  recipient: string;
  chain_id: number;
  resource_id?: string;
}

/**
 * Create a fetch wrapper that handles x402 payments automatically
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
  const client = createThirdwebClient({
    clientId,
    secretKey
  });

  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Make initial request to get payment details
    const initialResponse = await fetch(url, init);

    // If successful, no payment needed
    if (initialResponse.ok) {
      return initialResponse;
    }

    // Check if payment is required (402 status)
    if (initialResponse.status !== 402) {
      // Not a payment error, return as-is
      return initialResponse;
    }

    // Parse payment requirements
    const errorData: any = await initialResponse.json().catch(() => null);

    if (!errorData?.payment_required || !errorData?.payment_details) {
      // Not a valid payment request
      return new Response(JSON.stringify({
        error: 'Invalid payment request',
        details: errorData
      }), {
        status: 402,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const paymentDetails: PaymentDetails = errorData.payment_details;

    // If no agent private key, return payment required error
    if (!agentPrivateKey) {
      return new Response(JSON.stringify({
        error: 'Payment required but no agent wallet configured',
        payment_details: paymentDetails,
        message: 'Set AGENT_PRIVATE_KEY in Cloudflare secrets to enable payments'
      }), {
        status: 402,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      // Create wallet from private key
      const agentWallet = privateKeyToAccount({
        client,
        privateKey: agentPrivateKey
      });

      console.log('[x402] Payment required:', {
        amount: paymentDetails.amount,
        recipient: paymentDetails.recipient,
        chain: paymentDetails.chain_id
      });

      // Prepare payment transaction
      const transaction = prepareTransaction({
        client,
        chain: baseSepolia,
        to: paymentDetails.recipient as `0x${string}`,
        value: BigInt(paymentDetails.amount),
      });

      // Send payment
      console.log('[x402] Sending payment...');
      const { transactionHash } = await sendTransaction({
        transaction,
        account: agentWallet
      });

      console.log('[x402] Payment sent:', transactionHash);

      // Retry original request with payment proof
      const retryHeaders = {
        ...init?.headers,
        'X-Payment-TxHash': transactionHash,
        'X-Payment-Amount': paymentDetails.amount,
        'X-Payment-Chain': paymentDetails.chain_id.toString(),
        'X-Payment-Recipient': paymentDetails.recipient
      };

      const retryResponse = await fetch(url, {
        ...init,
        headers: retryHeaders
      });

      return retryResponse;

    } catch (error: any) {
      console.error('[x402] Payment failed:', error);

      return new Response(JSON.stringify({
        error: 'Payment transaction failed',
        details: error.message,
        payment_details: paymentDetails
      }), {
        status: 402,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

/**
 * Simple wrapper that passes through fetch without payment
 * Use this for testing or when payments are not needed
 */
export function createPassthroughFetch(): typeof fetch {
  return fetch.bind(globalThis);
}
