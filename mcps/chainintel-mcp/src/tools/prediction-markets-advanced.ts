/**
 * Advanced Prediction Markets Tools
 * Deep analysis and research capabilities for Polymarket
 */

import { z } from 'zod';
import {
  getMarketDetails,
  analyzeMarketSentiment,
  assessMarketRisk,
  findArbitrageOpportunities,
  performAdvancedAnalysis,
  analyzeMarketCorrelation,
  searchMarkets,
  getRelatedMarkets
} from '../apis/polymarket-advanced';

// ============================================================================
// SCHEMAS
// ============================================================================

export const GetMarketDetailsSchema = z.object({
  marketId: z.string().describe('Market ID or slug')
});

export const AnalyzeMarketSentimentSchema = z.object({
  marketId: z.string().describe('Market ID or slug')
});

export const AssessMarketRiskSchema = z.object({
  marketId: z.string().describe('Market ID or slug')
});

export const FindArbitrageSchema = z.object({
  keyword: z.string().describe('Keyword to search for related markets'),
  minReturn: z.number().min(0).optional().describe('Minimum return percentage (default: 2)')
});

export const AdvancedAnalysisSchema = z.object({
  marketId: z.string().describe('Market ID or slug')
});

export const SearchMarketsAdvancedSchema = z.object({
  query: z.string().describe('Search query'),
  limit: z.number().min(1).max(50).optional().describe('Number of results (default: 20)'),
  activeOnly: z.boolean().optional().describe('Only active markets (default: true)')
});

export const AnalyzeCorrelationSchema = z.object({
  marketIds: z.array(z.string()).min(2).max(10).describe('Array of market IDs to analyze')
});

export const GetRelatedMarketsSchema = z.object({
  marketId: z.string().describe('Market ID to find related markets for'),
  limit: z.number().min(1).max(20).optional().describe('Number of related markets (default: 10)')
});

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

/**
 * Get detailed market information with tags and metadata
 */
export const getMarketDetailsToolDef = {
  name: 'get_market_details',
  description: 'Get comprehensive market data including outcomes, volume, liquidity, tags, and metadata',
  parameters: GetMarketDetailsSchema,
  execute: async (params: z.infer<typeof GetMarketDetailsSchema>) => {
    try {
      const market = await getMarketDetails(params.marketId);

      return {
        success: true,
        market: {
          id: market.id,
          title: market.title,
          description: market.description,
          outcomes: market.outcomes,
          volume: market.volume,
          liquidity: market.liquidity,
          active: market.active,
          endDate: market.endDate,
          tags: market.tags,
          commentCount: market.commentCount
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'polymarket-gamma-api'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

/**
 * Analyze market sentiment from multiple signals
 */
export const analyzeMarketSentimentToolDef = {
  name: 'analyze_market_sentiment',
  description: 'Deep sentiment analysis using price action, volume, and comment analysis',
  parameters: AnalyzeMarketSentimentSchema,
  execute: async (params: z.infer<typeof AnalyzeMarketSentimentSchema>) => {
    try {
      const sentiment = await analyzeMarketSentiment(params.marketId);

      return {
        success: true,
        sentiment: {
          bullishScore: sentiment.bullishScore,
          bearishScore: sentiment.bearishScore,
          neutralScore: sentiment.neutralScore,
          priceAction: sentiment.priceAction,
          confidence: sentiment.confidence,
          signals: {
            commentSentiment: sentiment.commentSentiment,
            volumeSignal: sentiment.volumeSignal
          }
        },
        interpretation: getSentimentInterpretation(sentiment),
        metadata: {
          timestamp: new Date().toISOString(),
          confidenceLevel: sentiment.confidence > 0.7 ? 'high' : sentiment.confidence > 0.4 ? 'medium' : 'low'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

/**
 * Comprehensive risk assessment
 */
export const assessMarketRiskToolDef = {
  name: 'assess_market_risk',
  description: 'Multi-factor risk analysis including liquidity, volatility, time decay, and sentiment risks',
  parameters: AssessMarketRiskSchema,
  execute: async (params: z.infer<typeof AssessMarketRiskSchema>) => {
    try {
      const risk = await assessMarketRisk(params.marketId);

      return {
        success: true,
        riskAssessment: {
          overallRisk: risk.overallRisk,
          riskScore: risk.riskScore,
          factors: risk.factors,
          warnings: risk.warnings,
          recommendations: risk.recommendations
        },
        summary: getRiskSummary(risk),
        metadata: {
          timestamp: new Date().toISOString(),
          assessmentType: 'comprehensive'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

/**
 * Find arbitrage opportunities
 */
export const findArbitrageToolDef = {
  name: 'find_arbitrage',
  description: 'Detect arbitrage opportunities across related Polymarket markets',
  parameters: FindArbitrageSchema,
  execute: async (params: z.infer<typeof FindArbitrageSchema>) => {
    try {
      const opportunities = await findArbitrageOpportunities(
        params.keyword,
        params.minReturn || 2
      );

      return {
        success: true,
        opportunities: opportunities.map(opp => ({
          markets: opp.markets,
          expectedReturn: `${opp.expectedReturn.toFixed(2)}%`,
          confidence: `${(opp.confidence * 100).toFixed(0)}%`,
          risk: opp.risk,
          explanation: opp.explanation,
          estimatedProfit: calculateProfit(opp.expectedReturn, 100) // $100 base
        })),
        summary: {
          totalOpportunities: opportunities.length,
          bestReturn: opportunities.length > 0 ? `${opportunities[0].expectedReturn.toFixed(2)}%` : 'None',
          avgReturn: opportunities.length > 0
            ? `${(opportunities.reduce((sum, o) => sum + o.expectedReturn, 0) / opportunities.length).toFixed(2)}%`
            : '0%'
        },
        metadata: {
          timestamp: new Date().toISOString(),
          searchKeyword: params.keyword,
          minReturnThreshold: `${params.minReturn || 2}%`
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

/**
 * Perform comprehensive advanced analysis
 */
export const advancedMarketAnalysisToolDef = {
  name: 'advanced_market_analysis',
  description: 'Complete market analysis with sentiment, risk, value bets, and price targets',
  parameters: AdvancedAnalysisSchema,
  execute: async (params: z.infer<typeof AdvancedAnalysisSchema>) => {
    try {
      const analysis = await performAdvancedAnalysis(params.marketId);

      return {
        success: true,
        analysis: {
          market: {
            id: analysis.market.id,
            title: analysis.market.title,
            currentPrice: analysis.market.outcomes.find(o => o.name.toLowerCase().includes('yes'))?.price || 0.5,
            volume: analysis.market.volume,
            liquidity: analysis.market.liquidity,
            endDate: analysis.market.endDate
          },
          sentiment: {
            overall: analysis.sentiment.priceAction,
            bullishScore: analysis.sentiment.bullishScore,
            bearishScore: analysis.sentiment.bearishScore,
            confidence: analysis.sentiment.confidence
          },
          risk: {
            level: analysis.riskAssessment.overallRisk,
            score: analysis.riskAssessment.riskScore,
            mainWarnings: analysis.riskAssessment.warnings.slice(0, 3)
          },
          valueBets: analysis.valueBets.map(bet => ({
            outcome: bet.outcome,
            currentPrice: bet.currentPrice,
            fairValue: bet.fairValue,
            edge: `${bet.edge.toFixed(2)}%`,
            recommendedBetSize: `${bet.kellyBet.toFixed(1)}% (Kelly Criterion)`
          })),
          priceTargets: {
            shortTerm: analysis.priceTargets.shortTerm.toFixed(3),
            mediumTerm: analysis.priceTargets.mediumTerm.toFixed(3),
            confidence: `${(analysis.priceTargets.confidence * 100).toFixed(0)}%`
          },
          recommendation: getTradeRecommendation(analysis)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'comprehensive'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

/**
 * Search markets with advanced filtering
 */
export const searchMarketsAdvancedToolDef = {
  name: 'search_markets_advanced',
  description: 'Advanced market search with filters for activity, tags, and metadata',
  parameters: SearchMarketsAdvancedSchema,
  execute: async (params: z.infer<typeof SearchMarketsAdvancedSchema>) => {
    try {
      const markets = await searchMarkets(params.query, {
        limit: params.limit || 20,
        active: params.activeOnly !== false
      });

      return {
        success: true,
        markets: markets.map(m => ({
          id: m.id,
          title: m.title,
          outcomes: m.outcomes,
          volume: m.volume,
          liquidity: m.liquidity,
          active: m.active,
          quickStats: {
            yesPrice: m.outcomes.find(o => o.name.toLowerCase().includes('yes'))?.price || 0.5,
            noPrice: m.outcomes.find(o => o.name.toLowerCase().includes('no'))?.price || 0.5
          }
        })),
        summary: {
          totalResults: markets.length,
          activeMarkets: markets.filter(m => m.active).length,
          avgVolume: markets.reduce((sum, m) => sum + m.volume, 0) / markets.length,
          avgLiquidity: markets.reduce((sum, m) => sum + m.liquidity, 0) / markets.length
        },
        metadata: {
          timestamp: new Date().toISOString(),
          query: params.query
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

/**
 * Analyze correlation between markets
 */
export const analyzeCorrelationToolDef = {
  name: 'analyze_market_correlation',
  description: 'Analyze correlation and relationships between multiple markets',
  parameters: AnalyzeCorrelationSchema,
  execute: async (params: z.infer<typeof AnalyzeCorrelationSchema>) => {
    try {
      const correlation = await analyzeMarketCorrelation(params.marketIds);

      return {
        success: true,
        correlation: {
          matrix: correlation.correlationMatrix,
          insights: correlation.insights,
          marketCount: params.marketIds.length
        },
        tradingImplications: getCorrelationImplications(correlation),
        metadata: {
          timestamp: new Date().toISOString(),
          marketsAnalyzed: params.marketIds.length
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

/**
 * Get related markets
 */
export const getRelatedMarketsToolDef = {
  name: 'get_related_markets',
  description: 'Find markets related to a given market by topic, event, or tags',
  parameters: GetRelatedMarketsSchema,
  execute: async (params: z.infer<typeof GetRelatedMarketsSchema>) => {
    try {
      const related = await getRelatedMarkets(params.marketId);
      const limited = related.slice(0, params.limit || 10);

      return {
        success: true,
        relatedMarkets: limited.map(m => ({
          id: m.id,
          title: m.title,
          volume: m.volume,
          liquidity: m.liquidity,
          currentPrice: m.outcomes.find(o => o.name.toLowerCase().includes('yes'))?.price || 0.5
        })),
        summary: {
          totalFound: related.length,
          showing: limited.length
        },
        metadata: {
          timestamp: new Date().toISOString(),
          sourceMarketId: params.marketId
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getSentimentInterpretation(sentiment: any): string {
  if (sentiment.confidence < 0.3) {
    return 'Low confidence - insufficient data or mixed signals';
  }

  if (sentiment.bullishScore > 70) {
    return 'Strong bullish sentiment - market expects positive outcome';
  } else if (sentiment.bullishScore > 55) {
    return 'Moderately bullish - slight lean toward positive outcome';
  } else if (sentiment.bearishScore > 70) {
    return 'Strong bearish sentiment - market expects negative outcome';
  } else if (sentiment.bearishScore > 55) {
    return 'Moderately bearish - slight lean toward negative outcome';
  } else {
    return 'Neutral sentiment - market is undecided';
  }
}

function getRiskSummary(risk: any): string {
  const level = risk.overallRisk;

  if (level === 'extreme') {
    return 'EXTREME RISK - Not recommended for most traders. Multiple high-risk factors present.';
  } else if (level === 'high') {
    return 'HIGH RISK - Caution advised. Suitable only for risk-tolerant traders with small positions.';
  } else if (level === 'medium') {
    return 'MEDIUM RISK - Acceptable with proper risk management and position sizing.';
  } else {
    return 'LOW RISK - Favorable conditions for trading with standard risk management.';
  }
}

function calculateProfit(returnPercentage: number, investment: number): string {
  const profit = (investment * returnPercentage) / 100;
  return `$${profit.toFixed(2)} on $${investment} investment`;
}

function getTradeRecommendation(analysis: any): string {
  const risk = analysis.riskAssessment.overallRisk;
  const valueBets = analysis.valueBets;
  const sentiment = analysis.sentiment.priceAction;

  if (risk === 'extreme') {
    return 'AVOID - Risk too high regardless of potential value';
  }

  if (valueBets.length === 0) {
    return 'PASS - No value detected at current prices';
  }

  const edge = valueBets[0].edge;

  if (edge > 10 && risk === 'low') {
    return 'STRONG BUY - High edge with low risk';
  } else if (edge > 5 && (risk === 'low' || risk === 'medium')) {
    return 'BUY - Good value with acceptable risk';
  } else if (edge > 2) {
    return 'SPECULATIVE BUY - Small edge, consider smaller position';
  } else if (edge < -5) {
    return 'AVOID - Overpriced relative to fair value';
  } else {
    return 'HOLD - Monitor for better entry points';
  }
}

function getCorrelationImplications(correlation: any): string[] {
  const implications: string[] = [];

  if (correlation.insights.length > 0) {
    implications.push('High correlation detected - consider diversification');
    implications.push('Correlated markets may move together - hedge accordingly');
  } else {
    implications.push('Low correlation - good diversification potential');
  }

  return implications;
}

// Export all tool definitions
export const advancedPredictionMarketTools = [
  getMarketDetailsToolDef,
  analyzeMarketSentimentToolDef,
  assessMarketRiskToolDef,
  findArbitrageToolDef,
  advancedMarketAnalysisToolDef,
  searchMarketsAdvancedToolDef,
  analyzeCorrelationToolDef,
  getRelatedMarketsToolDef
];
