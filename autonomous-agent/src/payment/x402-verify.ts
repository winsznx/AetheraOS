/**
 * x402 Payment Verification for Autonomous Agent
 * Verifies user payments before executing agent queries
 *
 * Uses Thirdweb's settlePayment to verify x402 payment proofs
 */

import { settlePayment } from 'thirdweb/x402';
import { createThirdwebClient } from 'thirdweb';

/**
 * Verify x402 payment from user
 */
export async function verifyUserPayment(
  request: Request,
  resourceUrl: string,
  platformWallet: string,
  thirdwebSecretKey: string,
  expectedPrice: string
): Promise<{
  valid: boolean;
  error?: string;
  paymentData?: any;
}> {
  try {
    // Get x-payment header with payment proof
    const paymentHeader = request.headers.get('x-payment');

    if (!paymentHeader) {
      return {
        valid: false,
        error: 'No payment provided. Include x-payment header with Thirdweb x402 payment proof.'
      };
    }

    // Create Thirdweb client
    const client = createThirdwebClient({
      secretKey: thirdwebSecretKey
    });

    console.log('[x402-verify] Verifying payment:', {
      payTo: platformWallet,
      price: expectedPrice,
      network: 'eip155:84532'
    });

    // Settle payment on-chain using Thirdweb's x402 protocol
    const result = await settlePayment({
      client,
      paymentData: paymentHeader,
      resourceUrl,
      payTo: platformWallet,
      network: 'eip155:84532', // Base Sepolia
      price: expectedPrice
    });

    if (result.success) {
      console.log('[x402-verify] Payment verified successfully');
      return {
        valid: true,
        paymentData: result
      };
    } else {
      console.error('[x402-verify] Payment verification failed:', result.error);
      return {
        valid: false,
        error: `Payment settlement failed: ${result.error || 'Unknown error'}`
      };
    }
  } catch (error: any) {
    console.error('[x402-verify] Payment verification error:', error);
    return {
      valid: false,
      error: `Payment verification error: ${error.message}`
    };
  }
}

/**
 * Payment middleware for autonomous agent
 */
export async function verifyPaymentMiddleware(
  request: Request,
  resourceUrl: string,
  platformWallet: string,
  thirdwebSecretKey: string,
  expectedPrice: string
): Promise<Response | null> {
  const verification = await verifyUserPayment(
    request,
    resourceUrl,
    platformWallet,
    thirdwebSecretKey,
    expectedPrice
  );

  if (!verification.valid) {
    // Return 402 Payment Required
    return new Response(
      JSON.stringify({
        error: verification.error,
        payment_required: true,
        payment_details: {
          price: expectedPrice,
          recipient: platformWallet,
          network: 'eip155:84532', // Base Sepolia
          protocol: 'x402'
        }
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Required': 'true',
          'X-Payment-Amount': expectedPrice,
          'X-Payment-Network': 'eip155:84532',
          'X-Payment-Recipient': platformWallet
        }
      }
    );
  }

  // Payment verified
  return null;
}
