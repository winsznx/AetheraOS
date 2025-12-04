/**
 * x402 Payment Verification for Autonomous Agent
 * Custom on-chain transaction verification (simplified approach)
 *
 * Since Thirdweb's settlePayment requires their SDK-generated proofs,
 * we verify transactions on-chain directly using public RPC.
 */

import { createPublicClient, http, parseEther, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';

// Create public client for on-chain verification
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

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
 * Verify x402 payment by checking transaction on-chain
 */
export async function verifyX402Payment(
  request: Request,
  resourceUrl: string,
  price: string,
  serverWallet: string
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

    console.log('[x402-server] Verifying payment on-chain...', {
      resourceUrl,
      price,
      network: 'baseSepolia'
    });

    // Parse payment proof
    let paymentProof;
    try {
      paymentProof = JSON.parse(paymentData);
    } catch {
      return {
        success: false,
        status: 402,
        error: 'Invalid payment proof format'
      };
    }

    const txHash = paymentProof.transactionHash;
    if (!txHash || !txHash.startsWith('0x')) {
      return {
        success: false,
        status: 402,
        error: 'Invalid transaction hash'
      };
    }

    // Get transaction receipt from blockchain
    console.log('[x402-server] Fetching transaction:', txHash);

    const tx = await publicClient.getTransaction({ hash: txHash as `0x${string}` });
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });

    if (!tx || !receipt) {
      return {
        success: false,
        status: 402,
        error: 'Transaction not found on-chain'
      };
    }

    // Verify transaction was successful
    if (receipt.status !== 'success') {
      return {
        success: false,
        status: 402,
        error: 'Transaction failed on-chain'
      };
    }

    // Verify recipient
    if (tx.to?.toLowerCase() !== serverWallet.toLowerCase()) {
      return {
        success: false,
        status: 402,
        error: `Payment sent to wrong address: ${tx.to} (expected: ${serverWallet})`
      };
    }

    // Verify amount (with small tolerance for gas/rounding)
    const expectedAmount = parseEther(price);
    const actualAmount = tx.value;
    const tolerance = parseEther('0.00001'); // 0.00001 ETH tolerance

    if (actualAmount < (expectedAmount - tolerance)) {
      return {
        success: false,
        status: 402,
        error: `Insufficient payment: ${formatEther(actualAmount)} ETH (expected: ${price} ETH)`
      };
    }

    console.log('[x402-server] Payment verified successfully!', {
      txHash,
      from: tx.from,
      to: tx.to,
      value: formatEther(actualAmount)
    });

    return {
      success: true,
      status: 200,
      payment: {
        transactionHash: txHash,
        from: tx.from,
        to: tx.to,
        value: formatEther(actualAmount),
        blockNumber: receipt.blockNumber
      }
    };
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
