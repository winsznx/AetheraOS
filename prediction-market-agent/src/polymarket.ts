/**
 * Polymarket API Integration
 * Fetch real prediction market data from Polymarket
 */

const POLYMARKET_CLOB_API = 'https://clob.polymarket.com';
const POLYMARKET_GAMMA_API = 'https://gamma-api.polymarket.com';

export interface PolymarketOutcome {
  price: number;
  name: string;
}

export interface PolymarketMarket {
  condition_id: string;
  question: string;
  description: string;
  end_date_iso: string;
  game_start_time: string;
  question_id: string;
  market_slug: string;
  outcomes: string[];
  outcome_prices: string[];
  volume: string;
  liquidity: string;
  active: boolean;
}

/**
 * Get market data from Polymarket
 * @param marketSlug - Market slug or condition ID
 */
export async function getMarketData(marketSlug: string): Promise<any> {
  try {
    // Try fetching from Gamma API (markets endpoint)
    const response = await fetch(`${POLYMARKET_GAMMA_API}/markets/${marketSlug}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch market: ${response.statusText}`);
    }

    const market: PolymarketMarket = await response.json();

    // Parse outcome prices
    const outcomes = market.outcomes.map((name, index) => ({
      name,
      probability: parseFloat(market.outcome_prices[index]),
      price: parseFloat(market.outcome_prices[index]),
      odds: 1 / parseFloat(market.outcome_prices[index])
    }));

    return {
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
    };
  } catch (error: any) {
    console.error('Error fetching Polymarket data:', error);
    throw new Error(`Polymarket API error: ${error.message}`);
  }
}

/**
 * Get trending markets from Polymarket
 */
export async function getTrendingMarkets(limit: number = 10): Promise<any[]> {
  try {
    const response = await fetch(`${POLYMARKET_GAMMA_API}/markets?limit=${limit}&active=true`);

    if (!response.ok) {
      throw new Error(`Failed to fetch markets: ${response.statusText}`);
    }

    const markets: PolymarketMarket[] = await response.json();

    return markets.map(market => ({
      id: market.condition_id,
      slug: market.market_slug,
      title: market.question,
      volume24h: parseFloat(market.volume),
      liquidity: parseFloat(market.liquidity || '0'),
      probability: parseFloat(market.outcome_prices[0]),
      active: market.active
    }));
  } catch (error: any) {
    console.error('Error fetching trending markets:', error);
    throw new Error(`Polymarket API error: ${error.message}`);
  }
}

/**
 * Search markets by query
 */
export async function searchMarkets(query: string, limit: number = 10): Promise<any[]> {
  try {
    const response = await fetch(
      `${POLYMARKET_GAMMA_API}/markets?q=${encodeURIComponent(query)}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const markets: PolymarketMarket[] = await response.json();

    return markets.map(market => ({
      id: market.condition_id,
      slug: market.market_slug,
      title: market.question,
      description: market.description,
      volume: parseFloat(market.volume),
      endDate: market.end_date_iso
    }));
  } catch (error: any) {
    console.error('Error searching markets:', error);
    throw new Error(`Polymarket search error: ${error.message}`);
  }
}

/**
 * Analyze market for value bets
 * Compare market probability to fair probability (simplified analysis)
 */
export function analyzeMarket(market: any): any {
  const yesPrice = market.outcomes.find((o: any) => o.name === 'Yes')?.probability || 0.5;

  // Simple value analysis (in production, would use more sophisticated models)
  const impliedProbability = yesPrice;
  const estimatedFairValue = 0.5; // Placeholder - would use ML model
  const edge = estimatedFairValue - impliedProbability;
  const edgePercentage = (edge / impliedProbability) * 100;

  let recommendation = 'Hold';
  if (edgePercentage > 5) recommendation = 'Strong Buy';
  else if (edgePercentage > 2) recommendation = 'Buy';
  else if (edgePercentage < -5) recommendation = 'Strong Sell';
  else if (edgePercentage < -2) recommendation = 'Sell';

  return {
    marketId: market.id,
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
      market.liquidity < 10000 ? 'Low liquidity' : null,
      Math.abs(edgePercentage) > 10 ? 'High volatility' : null
    ].filter(Boolean)
  };
}
