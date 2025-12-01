/**
 * Risk Score Tool - Calculate comprehensive risk score
 */

import { z } from 'zod';
import { analyzeWallet as analyzeMoralis } from '../apis/moralis';
import { analyzeSolanaWallet } from '../apis/helius';
import { calculateRiskScore as calculateAIRiskScore } from '../apis/claude';

export const RiskScoreSchema = z.object({
  address: z.string().min(1),
  chain: z.enum(['base', 'ethereum', 'solana'])
});

export type RiskScoreInput = z.infer<typeof RiskScoreSchema>;

/**
 * Calculate comprehensive risk score
 */
export async function riskScoreTool(input: RiskScoreInput) {
  const { address, chain } = input;

  // Get wallet data
  let walletData: any;
  if (chain === 'solana') {
    walletData = await analyzeSolanaWallet(address);
  } else {
    walletData = await analyzeMoralis(address, chain);
  }

  // Get AI-powered risk analysis
  const aiRiskAnalysis = await calculateAIRiskScore(walletData);

  // Calculate additional risk factors
  const riskFactors = calculateRiskFactors(walletData);

  return {
    wallet: {
      address,
      chain
    },
    riskScore: {
      overall: aiRiskAnalysis.score, // 0-10 scale
      aiConfidence: 0.8, // How confident the AI is
      breakdown: {
        ...riskFactors
      }
    },
    factors: {
      identified: aiRiskAnalysis.factors,
      reasoning: aiRiskAnalysis.reasoning
    },
    recommendation: getRiskRecommendation(aiRiskAnalysis.score),
    metadata: {
      analyzedAt: new Date().toISOString(),
      tool: 'risk-score',
      version: '1.0.0'
    }
  };
}

/**
 * Calculate individual risk factors
 */
function calculateRiskFactors(walletData: any) {
  const factors: any = {};

  // Portfolio concentration risk
  const tokenCount = walletData.balance?.tokens?.length || 0;
  factors.concentrationRisk = tokenCount < 3 ? 'high' : tokenCount < 10 ? 'medium' : 'low';

  // Activity risk (too low or too high)
  const activityScore = walletData.metrics?.activityScore || 0;
  factors.activityRisk = activityScore < 20 ? 'high' : activityScore > 80 ? 'medium' : 'low';

  // Transaction success rate
  const transactions = walletData.transactions?.recent || [];
  const successRate = transactions.length > 0
    ? transactions.filter((tx: any) => tx.success).length / transactions.length
    : 1;
  factors.executionRisk = successRate < 0.8 ? 'high' : successRate < 0.95 ? 'medium' : 'low';

  // Whale risk (being too big can be risky for copying)
  const isWhale = walletData.metrics?.isWhale || false;
  factors.whaleRisk = isWhale ? 'medium' : 'low';

  return factors;
}

/**
 * Get recommendation based on risk score
 */
function getRiskRecommendation(score: number): string {
  if (score <= 3) {
    return 'LOW RISK - Safe to follow for most strategies';
  } else if (score <= 5) {
    return 'MODERATE RISK - Follow with caution and position sizing';
  } else if (score <= 7) {
    return 'ELEVATED RISK - Only for experienced traders';
  } else {
    return 'HIGH RISK - Avoid or use very small positions';
  }
}

export const riskScoreToolDef = {
  name: 'risk-score',
  description: 'Calculate comprehensive risk score for wallet',
  parameters: RiskScoreSchema,
  execute: riskScoreTool,
  pricing: {
    amount: '0.005',
    currency: 'ETH'
  }
};
