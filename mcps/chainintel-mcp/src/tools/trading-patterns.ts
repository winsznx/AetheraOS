/**
 * Trading Patterns Tool - Analyze trading patterns and strategies
 */

import { z } from 'zod';
import { getWalletHistory } from '../apis/moralis';
import { getSolanaTransactions } from '../apis/helius';
import { analyzeTradingPatterns as analyzeWithAI } from '../apis/claude';

export const TradingPatternsSchema = z.object({
  address: z.string().min(1),
  chain: z.enum(['base', 'ethereum', 'solana']),
  minTrades: z.number().min(1).optional().default(10)
});

export type TradingPatternsInput = z.infer<typeof TradingPatternsSchema>;

/**
 * Analyze trading patterns
 */
export async function tradingPatternsTool(input: TradingPatternsInput) {
  const { address, chain, minTrades } = input;

  // Get transaction history
  let transactions: any[];
  if (chain === 'solana') {
    transactions = await getSolanaTransactions(address, 100);
  } else {
    // Map 'base' to 'base-sepolia' for testnet (TODO: make this configurable)
    const actualChain = chain === 'base' ? 'base-sepolia' : chain;
    transactions = await getWalletHistory(address, actualChain as any, 100);
  }

  // Check if enough trades
  if (transactions.length < minTrades) {
    return {
      wallet: {
        address,
        chain
      },
      error: `Insufficient trading history. Found ${transactions.length} trades, need at least ${minTrades}`,
      suggestion: 'Try a wallet with more trading activity'
    };
  }

  // AI-powered pattern analysis
  const aiAnalysis = await analyzeWithAI(transactions, chain);

  // Calculate additional patterns
  const patterns = calculateTradingPatterns(transactions, chain);

  return {
    wallet: {
      address,
      chain
    },
    strategy: {
      primary: aiAnalysis.strategy,
      riskLevel: aiAnalysis.riskLevel,
      confidence: aiAnalysis.confidence
    },
    patterns: {
      timePreference: patterns.timePreference,
      avgHoldingPeriod: patterns.avgHoldingPeriod,
      tradingFrequency: patterns.frequency,
      preferredSize: patterns.preferredSize
    },
    insights: aiAnalysis.insights,
    metrics: {
      totalTrades: transactions.length,
      uniqueDays: patterns.uniqueDays,
      avgTradesPerDay: patterns.avgTradesPerDay
    },
    metadata: {
      analyzedAt: new Date().toISOString(),
      tool: 'trading-patterns',
      version: '1.0.0'
    }
  };
}

/**
 * Calculate trading pattern metrics
 */
function calculateTradingPatterns(transactions: any[], chain: string) {
  if (transactions.length === 0) {
    return {
      timePreference: 'unknown',
      avgHoldingPeriod: '0 days',
      frequency: 'low',
      preferredSize: 'unknown',
      uniqueDays: 0,
      avgTradesPerDay: 0
    };
  }

  // Time preference (when they trade most)
  const hours = transactions
    .filter(tx => tx.timestamp)
    .map(tx => new Date(tx.timestamp).getHours());

  const hourCounts: any = {};
  hours.forEach(hour => {
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const mostActiveHour = Object.entries(hourCounts)
    .sort(([, a]: any, [, b]: any) => b - a)[0]?.[0] || 0;

  const timePreference =
    Number(mostActiveHour) >= 6 && Number(mostActiveHour) < 12 ? 'Morning trader' :
      Number(mostActiveHour) >= 12 && Number(mostActiveHour) < 18 ? 'Afternoon trader' :
        Number(mostActiveHour) >= 18 && Number(mostActiveHour) < 24 ? 'Evening trader' :
          'Night trader';

  // Calculate unique trading days
  const dates = transactions
    .filter(tx => tx.timestamp)
    .map(tx => new Date(tx.timestamp).toDateString());
  const uniqueDays = new Set(dates).size;

  // Trading frequency
  const avgTradesPerDay = uniqueDays > 0 ? transactions.length / uniqueDays : 0;
  const frequency = avgTradesPerDay > 5 ? 'high' : avgTradesPerDay > 1 ? 'medium' : 'low';

  // Preferred trade size (based on value)
  const values = transactions
    .filter(tx => tx.value)
    .map(tx => Number(tx.value));

  const avgValue = values.length > 0
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;

  const preferredSize =
    avgValue > 1e18 ? 'Large positions' : // >1 ETH
      avgValue > 1e17 ? 'Medium positions' : // >0.1 ETH
        'Small positions';

  return {
    timePreference,
    avgHoldingPeriod: 'N/A', // Would need to track buy/sell pairs
    frequency,
    preferredSize,
    uniqueDays,
    avgTradesPerDay: Math.round(avgTradesPerDay * 100) / 100
  };
}

export const tradingPatternsToolDef = {
  name: 'trading-patterns',
  description: 'Analyze trading patterns and identify strategies',
  parameters: TradingPatternsSchema,
  execute: tradingPatternsTool,
  pricing: {
    amount: '0.01',
    currency: 'ETH'
  }
};
