/**
 * x402 Payment Guard - Thirdweb Payment Verification
 * Ensures all MCP tool calls are properly paid for via x402 protocol
 *
 * Thirdweb x402 Documentation: https://portal.thirdweb.com/payments/x402
 *
 * How it works:
 * 1. Client makes request with x-payment header
 * 2. Server verifies payment using Thirdweb's settlePayment
 * 3. Payment is settled on-chain (Base or Base Sepolia)
 * 4. Tool executes if payment is valid
 */

import { settlePayment } from 'thirdweb/x402';
import { createThirdwebClient } from 'thirdweb';
import { base, baseSepolia } from 'thirdweb/chains';

// Tool pricing in ETH
export const TOOL_PRICING = {
  // Wallet Intelligence
  'analyze-wallet': '0.01',
  'detect-whales': '0.005',
  'smart-money-tracker': '0.02',
  'risk-score': '0.005',
  'trading-patterns': '0.01',
  // Task Escrow
  'create_task': '0.005',
  'claim_task': '0.002',
  'submit_work': '0.002',
  'verify_work': '0.003',
  'get_task': '0.001',
  // IPFS Storage
  'upload_work_proof': '0.003',
  'upload_json': '0.002',
  'download_proof': '0.001',
  'pin_to_ipfs': '0.002',
  'get_ipfs_url': '0.0005',
  // Prediction Markets
  'get_market_data': '0.002',
  'analyze_market': '0.005',
  'get_trending_markets': '0.003',
  'search_markets': '0.002'
} as const;

type ToolName = keyof typeof TOOL_PRICING;

/**
 * Initialize Thirdweb client for x402
 */
export function createPaymentClient(secretKey: string) {
  return createThirdwebClient({
    secretKey
  });
}

/**
 * Verify payment before executing tool
 */
export async function verifyPayment(
  request: Request,
  toolName: ToolName,
  resourceUrl: string,
  platformWallet: string,
  thirdwebSecretKey: string,
  network: 'mainnet' | 'testnet' = 'testnet'
): Promise<{
  valid: boolean;
  error?: string;
  paymentData?: any;
}> {
  try {
    // Get payment data from x-payment header
    const paymentHeader = request.headers.get('x-payment');

    if (!paymentHeader) {
      return {
        valid: false,
        error: 'No payment provided. Include x-payment header with payment proof.'
      };
    }

    // Create Thirdweb client
    const client = createPaymentClient(thirdwebSecretKey);

    // Settle payment on-chain using Thirdweb's x402 protocol
    // This validates the payment proof and settles the transaction
    const result = await settlePayment({
      client,
      paymentData: paymentHeader,
      resourceUrl,
      payTo: platformWallet,
      network: network === 'mainnet' ? 'eip155:8453' : 'eip155:84532', // Base (8453) or Base Sepolia (84532)
      price: TOOL_PRICING[toolName]
      // Thirdweb automatically handles facilitator and payment routing
    });

    if (result.success) {
      return {
        valid: true,
        paymentData: result
      };
    } else {
      return {
        valid: false,
        error: `Payment settlement failed: ${result.error || 'Unknown error'}`
      };
    }
  } catch (error: any) {
    return {
      valid: false,
      error: `Payment verification error: ${error.message}`
    };
  }
}

/**
 * Create payment intent for client
 */
export function createPaymentIntent(
  toolName: ToolName,
  params: any,
  platformWallet: string
): {
  tool: string;
  price: string;
  recipient: string;
  network: string;
  metadata: any;
} {
  return {
    tool: toolName,
    price: TOOL_PRICING[toolName],
    recipient: platformWallet,
    network: 'eip155:84532', // Base Sepolia (use 8453 for mainnet)
    metadata: {
      params,
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
}

/**
 * Payment middleware for Cloudflare Workers
 */
export async function paymentMiddleware(
  request: Request,
  toolName: ToolName,
  env: any
): Promise<Response | null> {
  const platformWallet = env.PLATFORM_WALLET;
  const thirdwebSecretKey = env.THIRDWEB_SECRET_KEY;
  const resourceUrl = new URL(request.url).toString();

  // Verify payment
  const verification = await verifyPayment(
    request,
    toolName,
    resourceUrl,
    platformWallet,
    thirdwebSecretKey,
    env.NETWORK || 'testnet'
  );

  if (!verification.valid) {
    // Return 402 Payment Required with payment details
    const paymentIntent = createPaymentIntent(toolName, {}, platformWallet);

    return new Response(
      JSON.stringify({
        error: verification.error,
        payment_required: true,
        payment_details: paymentIntent
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Required': 'true',
          'X-Payment-Amount': TOOL_PRICING[toolName],
          'X-Payment-Network': 'eip155:84532',
          'X-Payment-Recipient': platformWallet
        }
      }
    );
  }

  // Payment verified - allow execution
  return null;
}

/**
 * Wrapper for paid tool execution
 */
export async function executePaidTool<T>(
  request: Request,
  toolName: ToolName,
  env: any,
  executor: () => Promise<T>
): Promise<Response> {
  // Check payment
  const paymentError = await paymentMiddleware(request, toolName, env);
  if (paymentError) {
    return paymentError;
  }

  try {
    // Execute tool
    const result = await executor();

    return new Response(
      JSON.stringify({
        success: true,
        tool: toolName,
        result,
        paid: true,
        timestamp: Date.now()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Status': 'verified'
        }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        tool: toolName
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

/**
 * Get pricing info for all tools
 */
export function getPricingInfo() {
  const tools = Object.entries(TOOL_PRICING).map(([tool, price]) => ({
    tool,
    price,
    currency: 'ETH',
    network: 'Base Sepolia (testnet)',
    networkId: 'eip155:84532',
    protocol: 'x402',
    provider: 'Thirdweb'
  }));

  return tools;
}

/**
 * Validate Thirdweb configuration
 */
export function validateConfig(env: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!env.THIRDWEB_SECRET_KEY) {
    errors.push('THIRDWEB_SECRET_KEY is required');
  }

  if (!env.PLATFORM_WALLET) {
    errors.push('PLATFORM_WALLET is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
