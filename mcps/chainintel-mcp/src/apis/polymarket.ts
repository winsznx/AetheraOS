/**
 * Polymarket API Integration
 * Analyze prediction market activity and sentiment for wallet intelligence
 */

const POLYMARKET_GAMMA_API = 'https://gamma-api.polymarket.com';

export interface MarketData {
  id: string;
  title: string;
  probability: number;
  volume: number;
  liquidity: number;
  category: string;
}

/**
 * Get trending crypto-related prediction markets
 */
export async function getCryptoMarkets(limit: number = 10): Promise<MarketData[]> {
  try {
    const response = await fetch(
      `${POLYMARKET_GAMMA_API}/markets?limit=${limit}&active=true`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch markets: ${response.statusText}`);
    }

    const markets: any[] = await response.json();

    // Filter for crypto-related markets
    const cryptoMarkets = markets
      .filter(m =>
        m.question.toLowerCase().includes('btc') ||
        m.question.toLowerCase().includes('eth') ||
        m.question.toLowerCase().includes('crypto') ||
        m.question.toLowerCase().includes('bitcoin') ||
        m.question.toLowerCase().includes('ethereum')
      )
      .map(market => ({
        id: market.condition_id,
        title: market.question,
        probability: parseFloat(market.outcome_prices[0]),
        volume: parseFloat(market.volume || '0'),
        liquidity: parseFloat(market.liquidity || '0'),
        category: 'crypto'
      }));

    return cryptoMarkets.slice(0, limit);
  } catch (error: any) {
    console.error('Error fetching crypto markets:', error);
    return [];
  }
}

/**
 * Get market sentiment for specific token
 */
export async function getTokenSentiment(token: string): Promise<{
  bullish: number;
  bearish: number;
  neutral: number;
  relatedMarkets: number;
}> {
  try {
    const response = await fetch(
      `${POLYMARKET_GAMMA_API}/markets?q=${encodeURIComponent(token)}&limit=20`
    );

    if (!response.ok) {
      return { bullish: 0, bearish: 0, neutral: 0, relatedMarkets: 0 };
    }

    const markets: any[] = await response.json();

    // Analyze sentiment from market probabilities
    let bullish = 0;
    let bearish = 0;
    let neutral = 0;

    markets.forEach(market => {
      const prob = parseFloat(market.outcome_prices[0]);

      if (prob > 0.6) bullish++;
      else if (prob < 0.4) bearish++;
      else neutral++;
    });

    return {
      bullish,
      bearish,
      neutral,
      relatedMarkets: markets.length
    };
  } catch (error: any) {
    console.error('Error getting token sentiment:', error);
    return { bullish: 0, bearish: 0, neutral: 0, relatedMarkets: 0 };
  }
}

/**
 * Analyze if wallet tokens align with prediction market sentiment
 */
export async function analyzeWalletMarketAlignment(
  tokens: { symbol: string; balance: string }[]
): Promise<{
  alignmentScore: number;
  insights: string[];
  opportunities: string[];
}> {
  const insights: string[] = [];
  const opportunities: string[] = [];
  let alignmentScore = 0;

  // Analyze top 5 tokens
  const topTokens = tokens.slice(0, 5);

  for (const token of topTokens) {
    const sentiment = await getTokenSentiment(token.symbol);

    if (sentiment.relatedMarkets > 0) {
      const bullishRatio = sentiment.bullish / sentiment.relatedMarkets;

      if (bullishRatio > 0.6) {
        insights.push(`${token.symbol}: Strong bullish sentiment (${sentiment.relatedMarkets} markets)`);
        alignmentScore += 10;
      } else if (bullishRatio < 0.3) {
        insights.push(`${token.symbol}: Bearish sentiment (${sentiment.relatedMarkets} markets)`);
        opportunities.push(`Consider reducing ${token.symbol} exposure`);
      }
    }
  }

  // Get general crypto market trends
  const cryptoMarkets = await getCryptoMarkets(10);
  const avgProbability = cryptoMarkets.reduce((sum, m) => sum + m.probability, 0) / cryptoMarkets.length;

  if (avgProbability > 0.6) {
    insights.push('Overall crypto market sentiment: Bullish');
    alignmentScore += 5;
  } else if (avgProbability < 0.4) {
    insights.push('Overall crypto market sentiment: Bearish');
    opportunities.push('Consider defensive positioning');
  }

  return {
    alignmentScore: Math.min(100, alignmentScore),
    insights,
    opportunities
  };
}
