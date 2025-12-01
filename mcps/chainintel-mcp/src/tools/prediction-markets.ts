/**
 * Prediction Markets Tools - Polymarket data and analysis
 * Integrated from prediction-market MCP
 */

import { z } from 'zod';

const POLYMARKET_GAMMA_API = 'https://gamma-api.polymarket.com';

// Schemas
export const GetMarketDataSchema = z.object({
  marketId: z.string().describe('Market ID or slug')
});

export const AnalyzeMarketSchema = z.object({
  marketId: z.string().describe('Market ID or slug'),
  threshold: z.number().min(0).max(1).optional().describe('Value threshold')
});

export const GetTrendingMarketsSchema = z.object({
  limit: z.number().min(1).max(50).optional().describe('Number of markets to return'),
  category: z.enum(['all', 'crypto', 'politics', 'sports', 'entertainment']).optional()
});

export const SearchMarketsSchema = z.object({
  query: z.string().describe('Search query'),
  limit: z.number().min(1).max(50).optional().describe('Number of results')
});

// Tool definitions
export const getMarketDataToolDef = {
  name: 'get_market_data',
  description: 'Fetch prediction market data including odds, liquidity, and volume',
  parameters: GetMarketDataSchema,
  execute: getMarketData
};

export const analyzeMarketToolDef = {
  name: 'analyze_market',
  description: 'Analyze prediction market odds to find value bets',
  parameters: AnalyzeMarketSchema,
  execute: analyzeMarket
};

export const getTrendingMarketsToolDef = {
  name: 'get_trending_markets',
  description: 'Get list of trending prediction markets',
  parameters: GetTrendingMarketsSchema,
  execute: getTrendingMarkets
};

export const searchMarketsToolDef = {
  name: 'search_markets',
  description: 'Search prediction markets by query',
  parameters: SearchMarketsSchema,
  execute: searchMarkets
};

// Tool implementations
async function getMarketData(params: z.infer<typeof GetMarketDataSchema>) {
  try {
    const response = await fetch(`${POLYMARKET_GAMMA_API}/markets/${params.marketId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch market: ${response.statusText}`);
    }

    const market: any = await response.json();

    // Parse outcome prices
    const outcomes = market.outcomes.map((name: string, index: number) => ({
      name,
      probability: parseFloat(market.outcome_prices[index]),
      price: parseFloat(market.outcome_prices[index]),
      odds: 1 / parseFloat(market.outcome_prices[index])
    }));

    return {
      success: true,
      market: {
        id: market.condition_id,
        slug: market.market_slug,
        title: market.question,
        description: market.description,
        outcomes,
        totalVolume: parseFloat(market.volume),
        totalLiquidity: parseFloat(market.liquidity || '0'),
        endDate: market.end_date_iso,
        status: market.active ? 'active' : 'closed',
        source: 'polymarket'
      }
    };
  } catch (error: any) {
    throw new Error(`Polymarket API error: ${error.message}`);
  }
}

async function analyzeMarket(params: z.infer<typeof AnalyzeMarketSchema>) {
  try {
    const marketDataResult = await getMarketData({ marketId: params.marketId });
    const market = marketDataResult.market;

    const yesOutcome = market.outcomes.find((o: any) => o.name === 'Yes' || o.name === 'YES');
    const yesPrice = yesOutcome?.probability || 0.5;

    // Simple value analysis
    const impliedProbability = yesPrice;
    const estimatedFairValue = 0.5; // Placeholder - in production, use real fair value estimation
    const edge = estimatedFairValue - impliedProbability;
    const edgePercentage = (edge / impliedProbability) * 100;

    let recommendation = 'Hold';
    if (edgePercentage > 5) recommendation = 'Strong Buy';
    else if (edgePercentage > 2) recommendation = 'Buy';
    else if (edgePercentage < -5) recommendation = 'Strong Sell';
    else if (edgePercentage < -2) recommendation = 'Sell';

    return {
      success: true,
      market: {
        id: market.id,
        title: market.title
      },
      analysis: {
        impliedProbability,
        estimatedFairValue,
        edge,
        edgePercentage: edgePercentage.toFixed(2),
        recommendation,
        confidenceScore: Math.min(Math.abs(edgePercentage) / 10, 1)
      },
      valueBets: edgePercentage > 2 ? [
        {
          outcome: 'Yes',
          currentPrice: yesPrice,
          suggestedPrice: estimatedFairValue,
          potentialReturn: `${edgePercentage.toFixed(2)}%`
        }
      ] : [],
      riskFactors: [
        market.totalLiquidity < 10000 ? 'Low liquidity' : null,
        Math.abs(edgePercentage) > 10 ? 'High volatility' : null
      ].filter(Boolean)
    };
  } catch (error: any) {
    throw new Error(`Market analysis failed: ${error.message}`);
  }
}

async function getTrendingMarkets(params: z.infer<typeof GetTrendingMarketsSchema>) {
  try {
    const limit = params.limit || 10;
    const response = await fetch(`${POLYMARKET_GAMMA_API}/markets?limit=${limit}&active=true`);

    if (!response.ok) {
      throw new Error(`Failed to fetch markets: ${response.statusText}`);
    }

    const markets: any[] = await response.json();

    // Filter by category if specified
    let filteredMarkets = markets;
    if (params.category && params.category !== 'all') {
      filteredMarkets = markets.filter(m => {
        const question = m.question.toLowerCase();
        switch (params.category) {
          case 'crypto':
            return question.includes('btc') || question.includes('eth') ||
                   question.includes('crypto') || question.includes('bitcoin') ||
                   question.includes('ethereum');
          case 'politics':
            return question.includes('election') || question.includes('president') ||
                   question.includes('senate') || question.includes('congress');
          case 'sports':
            return question.includes('nfl') || question.includes('nba') ||
                   question.includes('game') || question.includes('championship');
          case 'entertainment':
            return question.includes('movie') || question.includes('tv') ||
                   question.includes('award') || question.includes('celebrity');
          default:
            return true;
        }
      });
    }

    const mappedMarkets = filteredMarkets.map((market: any) => ({
      id: market.condition_id,
      slug: market.market_slug,
      title: market.question,
      volume24h: parseFloat(market.volume),
      liquidity: parseFloat(market.liquidity || '0'),
      probability: parseFloat(market.outcome_prices?.[0] || '0.5'),
      active: market.active
    }));

    return {
      success: true,
      category: params.category || 'all',
      markets: mappedMarkets,
      count: mappedMarkets.length
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch trending markets: ${error.message}`);
  }
}

async function searchMarkets(params: z.infer<typeof SearchMarketsSchema>) {
  try {
    const limit = params.limit || 10;
    const response = await fetch(
      `${POLYMARKET_GAMMA_API}/markets?q=${encodeURIComponent(params.query)}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const markets: any[] = await response.json();

    const mappedMarkets = markets.map((market: any) => ({
      id: market.condition_id,
      slug: market.market_slug,
      title: market.question,
      description: market.description,
      volume: parseFloat(market.volume),
      endDate: market.end_date_iso
    }));

    return {
      success: true,
      query: params.query,
      markets: mappedMarkets,
      count: mappedMarkets.length
    };
  } catch (error: any) {
    throw new Error(`Market search failed: ${error.message}`);
  }
}
