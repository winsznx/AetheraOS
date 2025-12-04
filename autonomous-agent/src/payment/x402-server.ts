/**
 * x402 Payment Verification for Autonomous Agent
 * Official Thirdweb x402 server-side implementation
 *
 * Based on: https://portal.thirdweb.com/x402/server
 */

import { settlePayment } from 'thirdweb/x402';
import { facilitator } from 'thirdweb/x402';
import { createThirdwebClient } from 'thirdweb';
import { arbitrumSepolia } from 'thirdweb/chains';

/**
 * Create Thirdweb facilitator with server wallet
 */
export function createX402Facilitator(secretKey: string, serverWalletAddress: string) {
  const client = createThirdwebClient({
    secretKey
  });

  return facilitator({
    client,
    serverWalletAddress
  });
}

/**
 * Return 402 Payment Required response
 */
export function createPaymentRequiredResponse(
  resourceUrl: string,
  price: string,
  serverWallet: string
): Response {
  return new Response(
    JSON.stringify({
      error: 'Payment Required',
      message: 'This endpoint requires payment via Thirdweb x402',
      payment_details: {
        price,
        payTo: serverWallet,
        network: 'eip155:84532', // Base Sepolia
        protocol: 'x402'
      }
    }),
    {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Required': 'true',
        'X-Payment-Amount': price,
        'X-Payment-Network': 'eip155:84532',
        'X-Payment-Recipient': serverWallet,
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}

/**
 * Verify and settle x402 payment
 */
export async function verifyX402Payment(
  request: Request,
  resourceUrl: string,
  price: string,
  thirdwebFacilitator: ReturnType<typeof facilitator>
): Promise<{
  success: boolean;
  status: number;
  error?: string;
  payment?: any;
}> {
  try {
    // Get payment data from request headers or body
    const paymentData = request.headers.get('x-payment') || await extractPaymentData(request);

    if (!paymentData) {
      return {
        success: false,
        status: 402,
        error: 'No payment data provided'
      };
    }

    console.log('[x402-server] Settling payment...', {
      resourceUrl,
      price,
      network: 'eip155:84532'
    });

    // Settle payment using Thirdweb x402
    const result = await settlePayment({
      resourceUrl,
      method: 'POST',
      paymentData,
      network: 'eip155:84532', // Base Sepolia
      price,
      facilitator: thirdwebFacilitator
    });

    console.log('[x402-server] Settlement result:', result.status);

    if (result.status === 200) {
      return {
        success: true,
        status: 200,
        payment: result
      };
    } else {
      return {
        success: false,
        status: result.status || 402,
        error: result.error || 'Payment settlement failed'
      };
    }
  } catch (error: any) {
    console.error('[x402-server] Payment verification error:', error);
    return {
      success: false,
      status: 500,
      error: `Payment verification failed: ${error.message}`
    };
  }
}

/**
 * Extract payment data from request
 */
async function extractPaymentData(request: Request): Promise<string | null> {
  try {
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const body = await request.clone().json() as any;
      return body.paymentData || body.payment || null;
    }

    return null;
  } catch {
    return null;
  }
}
