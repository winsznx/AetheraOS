/**
 * Analyze Wallet Tool - Comprehensive cross-chain wallet analysis
 * Combines Moralis (EVM), Helius (Solana), and Claude AI for deep insights
 */

import { z } from 'zod';
import { analyzeWallet as analyzeMoralis } from '../apis/moralis';
import { analyzeSolanaWallet } from '../apis/helius';
import { generateWalletInsights, analyzeCrossChain } from '../apis/claude';
import { analyzeWalletMarketAlignment, getCryptoMarkets } from '../apis/polymarket';

// Input schema
export const AnalyzeWalletSchema = z.object({
  address: z.string().min(1, 'Wallet address is required'),
  chain: z.enum(['base', 'ethereum', 'solana'], {
    errorMap: () => ({ message: 'Chain must be base, ethereum, or solana' })
  }),
  depth: z.enum(['quick', 'standard', 'deep']).optional().default('standard'),
  includeCrossChain: z.boolean().optional().default(false)
});

export type AnalyzeWalletInput = z.infer<typeof AnalyzeWalletSchema>;

/**
 * Analyze wallet across chains with AI insights
 */
export async function analyzeWalletTool(input: AnalyzeWalletInput) {
  const { address, chain, depth, includeCrossChain } = input;

  // Determine what analysis to run based on chain
  let primaryData: any;
  let secondaryData: any = null;

  if (chain === 'solana') {
    // Solana analysis
    primaryData = await analyzeSolanaWallet(address);

    // If cross-chain requested, also check EVM
    if (includeCrossChain) {
      try {
        secondaryData = await analyzeMoralis(address, 'base');
      } catch (error) {
        // Wallet might not exist on EVM chains
        secondaryData = null;
      }
    }
  } else {
    // EVM analysis (Base or Ethereum)
    primaryData = await analyzeMoralis(address, chain);

    // If cross-chain requested, also check Solana
    if (includeCrossChain) {
      try {
        secondaryData = await analyzeSolanaWallet(address);
      } catch (error) {
        // Wallet might not exist on Solana
        secondaryData = null;
      }
    }
  }

  // Get prediction market sentiment for wallet tokens
  let marketAlignment = null;
  try {
    if (primaryData.balance?.tokens && primaryData.balance.tokens.length > 0) {
      marketAlignment = await analyzeWalletMarketAlignment(primaryData.balance.tokens);
    }
  } catch (error) {
    console.error('Failed to analyze market alignment:', error);
  }

  // Generate AI insights
  let insights: string;
  if (includeCrossChain && secondaryData) {
    insights = await analyzeCrossChain(primaryData, secondaryData);
  } else {
    insights = await generateWalletInsights(primaryData);
  }

  // Compile comprehensive analysis
  const analysis = {
    wallet: {
      address,
      primaryChain: chain,
      crossChainAnalysis: includeCrossChain
    },
    portfolio: {
      primary: {
        chain: primaryData.chain,
        value: primaryData.metrics?.portfolioValue || 0,
        tokens: primaryData.balance?.tokens?.length || 0,
        nfts: primaryData.nfts?.count || 0
      },
      ...(secondaryData && {
        secondary: {
          chain: secondaryData.chain,
          value: secondaryData.metrics?.portfolioValue || 0,
          tokens: secondaryData.balance?.tokens?.length || 0
        }
      })
    },
    activity: {
      primary: {
        totalTransactions: primaryData.transactions?.total || 0,
        activityScore: primaryData.metrics?.activityScore || 0,
        frequency: primaryData.metrics?.tradingActivity?.frequency || 'unknown'
      },
      ...(secondaryData && {
        secondary: {
          totalTransactions: secondaryData.transactions?.total || 0,
          activityScore: secondaryData.metrics?.activityScore || 0
        }
      })
    },
    classification: {
      isWhale: primaryData.metrics?.isWhale || false,
      isSmartMoney: primaryData.metrics?.isSmartMoney || false
    },
    ...(marketAlignment && {
      marketSentiment: {
        alignmentScore: marketAlignment.alignmentScore,
        insights: marketAlignment.insights,
        opportunities: marketAlignment.opportunities
      }
    }),
    aiInsights: insights,
    metadata: {
      analyzedAt: new Date().toISOString(),
      depth,
      tool: 'analyze-wallet',
      version: '1.0.0'
    }
  };

  // Add detailed data for deep analysis
  if (depth === 'deep') {
    (analysis as any).rawData = {
      primary: primaryData,
      ...(secondaryData && { secondary: secondaryData })
    };
  }

  return analysis;
}

/**
 * Tool definition for MCP server
 */
export const analyzeWalletToolDef = {
  name: 'analyze-wallet',
  description: 'Deep cross-chain wallet analysis with AI insights (Base + Solana)',
  parameters: AnalyzeWalletSchema,
  execute: analyzeWalletTool,
  pricing: {
    amount: '0.01',
    currency: 'ETH'
  }
};
