/**
 * Detect Whales Tool - Identify and track whale wallets
 */

import { z } from 'zod';
import { isWhaleWallet } from '../apis/moralis';
import { detectSolanaWhale } from '../apis/helius';
import { analyzeWhaleNature } from '../apis/claude';

export const DetectWhalesSchema = z.object({
  chain: z.enum(['base', 'ethereum', 'solana']),
  minPortfolioValue: z.number().optional().default(1_000_000),
  addresses: z.array(z.string()).optional()
});

export type DetectWhalesInput = z.infer<typeof DetectWhalesSchema>;

/**
 * Detect whale wallets
 */
export async function detectWhalesTool(input: DetectWhalesInput) {
  const { chain, minPortfolioValue, addresses } = input;

  // If specific addresses provided, check them
  if (addresses && addresses.length > 0) {
    const results = await Promise.all(
      addresses.map(async (address) => {
        let isWhale = false;

        if (chain === 'solana') {
          isWhale = await detectSolanaWhale(address);
        } else {
          isWhale = await isWhaleWallet(address, chain);
        }

        return {
          address,
          isWhale,
          chain
        };
      })
    );

    return {
      chain,
      minPortfolioValue,
      whalesFound: results.filter(r => r.isWhale).length,
      totalChecked: addresses.length,
      whales: results.filter(r => r.isWhale),
      analyzedAt: new Date().toISOString()
    };
  }

  // If no addresses provided, return info about whale detection
  return {
    chain,
    minPortfolioValue,
    message: 'Provide addresses array to check for whale wallets',
    criteria: {
      solana: '>$100k in SOL',
      evm: '>$1M in ETH + tokens'
    }
  };
}

export const detectWhalesToolDef = {
  name: 'detect-whales',
  description: 'Identify whale wallets and track their movements',
  parameters: DetectWhalesSchema,
  execute: detectWhalesTool,
  pricing: {
    amount: '0.005',
    currency: 'ETH'
  }
};
