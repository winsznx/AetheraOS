/**
 * Smart Money Tracker Tool - Track wallets with proven alpha
 */

import { z } from 'zod';
import { getWalletHistory, getTokenTransfers } from '../apis/moralis';
import { trackSolanaSmartMoney } from '../apis/helius';
import { identifySmartMoney, analyzeTradingPatterns } from '../apis/claude';

export const SmartMoneyTrackerSchema = z.object({
  address: z.string().min(1),
  chain: z.enum(['base', 'ethereum', 'solana']),
  lookbackDays: z.number().min(1).max(365).optional().default(90)
});

export type SmartMoneyTrackerInput = z.infer<typeof SmartMoneyTrackerSchema>;

/**
 * Track smart money wallets
 */
export async function smartMoneyTrackerTool(input: SmartMoneyTrackerInput) {
  const { address, chain, lookbackDays } = input;

  let walletData: any;
  let tradingData: any;

  if (chain === 'solana') {
    // Solana smart money tracking
    walletData = await trackSolanaSmartMoney(address, lookbackDays);
    tradingData = walletData.metrics;
  } else {
    // EVM smart money tracking
    const history = await getWalletHistory(address, chain, 100);
    const transfers = await getTokenTransfers(address, chain, 100);

    // Filter to lookback period
    const cutoffDate = Date.now() - (lookbackDays * 24 * 60 * 60 * 1000);
    const recentHistory = history.filter((tx: any) =>
      new Date(tx.timestamp).getTime() > cutoffDate
    );

    walletData = {
      address,
      chain,
      transactions: recentHistory,
      transfers
    };

    // Analyze trading patterns with AI
    tradingData = await analyzeTradingPatterns(recentHistory, chain);
  }

  // Get AI analysis
  const smartMoneyAnalysis = await identifySmartMoney(walletData);

  return {
    wallet: {
      address,
      chain
    },
    lookbackPeriod: {
      days: lookbackDays,
      from: new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString()
    },
    analysis: {
      isSmartMoney: smartMoneyAnalysis.isSmartMoney,
      confidence: smartMoneyAnalysis.confidence,
      indicators: smartMoneyAnalysis.indicators,
      recommendation: smartMoneyAnalysis.recommendation
    },
    tradingMetrics: {
      ...tradingData,
      totalTrades: walletData.transactions?.length || walletData.metrics?.totalTrades || 0
    },
    metadata: {
      analyzedAt: new Date().toISOString(),
      tool: 'smart-money-tracker',
      version: '1.0.0'
    }
  };
}

export const smartMoneyTrackerToolDef = {
  name: 'smart-money-tracker',
  description: 'Track smart money wallets with proven alpha',
  parameters: SmartMoneyTrackerSchema,
  execute: smartMoneyTrackerTool,
  pricing: {
    amount: '0.02',
    currency: 'ETH'
  }
};
