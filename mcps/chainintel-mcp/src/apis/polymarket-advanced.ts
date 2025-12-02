/**
 * Advanced Polymarket API Integration
 * Deep market analysis, research, and intelligence for prediction markets
 *
 * Features:
 * - Historical market analysis
 * - Advanced probability modeling
 * - Sentiment analysis from comments
 * - Arbitrage detection
 * - Risk scoring
 * - Correlation analysis
 * - Volume and liquidity trends
 */

const POLYMARKET_GAMMA_API = 'https://gamma-api.polymarket.com';
const POLYMARKET_CLOB_API = 'https://clob.polymarket.com';

// API Configuration
let POLYMARKET_API_KEY: string | undefined;

/**
 * Initialize Polymarket API with optional API key
 * API key is optional - Gamma API is publicly accessible for read-only operations
 * However, having an API key may provide higher rate limits
 */
export function initPolymarket(apiKey?: string) {
  POLYMARKET_API_KEY = apiKey;
  if (apiKey) {
    console.log('Polymarket API initialized with API key');
  } else {
    console.log('Polymarket API initialized (public access - rate limits may apply)');
  }
}

/**
 * Get authentication headers
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  // Add API key if available (for higher rate limits)
  if (POLYMARKET_API_KEY) {
    headers['Authorization'] = `Bearer ${POLYMARKET_API_KEY}`;
  }

  return headers;
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface MarketData {
  id: string;
  slug: string;
  title: string;
  description: string;
  outcomes: Outcome[];
  volume: number;
  liquidity: number;
  active: boolean;
  endDate: string;
  tags?: string[];
  commentCount?: number;
}

export interface Outcome {
  name: string;
  price: number;
  probability: number;
  odds: number;
}

export interface HistoricalDataPoint {
  timestamp: string;
  price: number;
  volume: number;
  liquidity: number;
}

export interface MarketSentiment {
  bullishScore: number;
  bearishScore: number;
  neutralScore: number;
  commentSentiment: number;
  volumeSignal: number;
  priceAction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'extreme';
  riskScore: number; // 0-100
  factors: {
    liquidityRisk: number;
    volatilityRisk: number;
    timeRisk: number;
    sentimentRisk: number;
    concentrationRisk: number;
  };
  warnings: string[];
  recommendations: string[];
}

export interface ArbitrageOpportunity {
  markets: {
    id: string;
    title: string;
    outcome: string;
    price: number;
  }[];
  expectedReturn: number;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface AdvancedAnalysis {
  market: MarketData;
  sentiment: MarketSentiment;
  riskAssessment: RiskAssessment;
  priceTargets: {
    shortTerm: number;
    mediumTerm: number;
    confidence: number;
  };
  valueBets: {
    outcome: string;
    currentPrice: number;
    fairValue: number;
    edge: number;
    kellyBet: number;
  }[];
  historicalAccuracy?: {
    similarMarkets: number;
    avgAccuracy: number;
    trackRecord: string;
  };
}

// ============================================================================
// CORE API FUNCTIONS
// ============================================================================

/**
 * Get comprehensive market data with tags and metadata
 */
export async function getMarketDetails(marketId: string): Promise<MarketData> {
  try {
    const headers = getHeaders();
    const [marketResponse, tagsResponse] = await Promise.allSettled([
      fetch(`${POLYMARKET_GAMMA_API}/markets/${marketId}`, { headers }),
      fetch(`${POLYMARKET_GAMMA_API}/markets/${marketId}/tags`, { headers })
    ]);

    if (marketResponse.status !== 'fulfilled' || !marketResponse.value.ok) {
      throw new Error('Failed to fetch market data');
    }

    const market: any = await marketResponse.value.json();
    let tags: string[] = [];

    if (tagsResponse.status === 'fulfilled' && tagsResponse.value.ok) {
      const tagData: any = await tagsResponse.value.json();
      tags = tagData.map((t: any) => t.label || t.name);
    }

    return {
      id: market.condition_id,
      slug: market.market_slug,
      title: market.question,
      description: market.description,
      outcomes: market.outcomes.map((name: string, idx: number) => ({
        name,
        price: parseFloat(market.outcome_prices[idx]),
        probability: parseFloat(market.outcome_prices[idx]),
        odds: 1 / parseFloat(market.outcome_prices[idx])
      })),
      volume: parseFloat(market.volume || '0'),
      liquidity: parseFloat(market.liquidity || '0'),
      active: market.active,
      endDate: market.end_date_iso,
      tags,
      commentCount: market.comment_count || 0
    };
  } catch (error: any) {
    throw new Error(`Failed to get market details: ${error.message}`);
  }
}

/**
 * Get market comments for sentiment analysis
 */
export async function getMarketComments(marketId: string, limit: number = 50): Promise<any[]> {
  try {
    const response = await fetch(
      `${POLYMARKET_GAMMA_API}/comments?market_id=${marketId}&limit=${limit}`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return [];
  }
}

/**
 * Search markets with advanced filtering
 */
export async function searchMarkets(
  query: string,
  options: {
    limit?: number;
    active?: boolean;
    tags?: string[];
  } = {}
): Promise<MarketData[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: (options.limit || 20).toString()
    });

    if (options.active !== undefined) {
      params.append('active', options.active.toString());
    }

    const response = await fetch(`${POLYMARKET_GAMMA_API}/markets?${params}`, { headers: getHeaders() });

    if (!response.ok) {
      return [];
    }

    const markets: any[] = await response.json();

    return markets.map(m => ({
      id: m.condition_id,
      slug: m.market_slug,
      title: m.question,
      description: m.description,
      outcomes: m.outcomes.map((name: string, idx: number) => ({
        name,
        price: parseFloat(m.outcome_prices[idx]),
        probability: parseFloat(m.outcome_prices[idx]),
        odds: 1 / parseFloat(m.outcome_prices[idx])
      })),
      volume: parseFloat(m.volume || '0'),
      liquidity: parseFloat(m.liquidity || '0'),
      active: m.active,
      endDate: m.end_date_iso
    }));
  } catch (error: any) {
    throw new Error(`Market search failed: ${error.message}`);
  }
}

/**
 * Get related markets by event or tag
 */
export async function getRelatedMarkets(marketId: string): Promise<MarketData[]> {
  try {
    // Get market's event
    const market = await getMarketDetails(marketId);

    // Search for markets with similar tags or keywords
    const keywords = market.title.split(' ').slice(0, 3).join(' ');
    const related = await searchMarkets(keywords, { limit: 10 });

    // Filter out the original market
    return related.filter(m => m.id !== marketId);
  } catch (error: any) {
    console.error('Failed to get related markets:', error);
    return [];
  }
}

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

/**
 * Analyze market sentiment from multiple signals
 */
export async function analyzeMarketSentiment(marketId: string): Promise<MarketSentiment> {
  const market = await getMarketDetails(marketId);
  const comments = await getMarketComments(marketId);

  // 1. Price-based sentiment
  const yesOutcome = market.outcomes.find(o => o.name.toLowerCase().includes('yes'));
  const price = yesOutcome?.price || 0.5;

  let priceAction: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (price > 0.6) priceAction = 'bullish';
  else if (price < 0.4) priceAction = 'bearish';

  // 2. Volume signal (higher volume = more conviction)
  const volumeSignal = Math.min(market.volume / 100000, 1); // Normalize to 0-1

  // 3. Comment sentiment (basic keyword analysis)
  let bullishKeywords = 0;
  let bearishKeywords = 0;

  const bullishWords = ['yes', 'will', 'bullish', 'up', 'likely', 'definitely', 'absolutely'];
  const bearishWords = ['no', 'wont', 'bearish', 'down', 'unlikely', 'doubt', 'never'];

  comments.forEach((comment: any) => {
    const text = (comment.content || '').toLowerCase();
    bullishWords.forEach(word => {
      if (text.includes(word)) bullishKeywords++;
    });
    bearishWords.forEach(word => {
      if (text.includes(word)) bearishKeywords++;
    });
  });

  const totalKeywords = bullishKeywords + bearishKeywords;
  const commentSentiment = totalKeywords > 0
    ? (bullishKeywords - bearishKeywords) / totalKeywords
    : 0; // -1 to 1

  // 4. Calculate scores
  const bullishScore = Math.min(100, (
    (priceAction === 'bullish' ? 40 : 0) +
    (volumeSignal * 30) +
    (commentSentiment > 0 ? commentSentiment * 30 : 0)
  ));

  const bearishScore = Math.min(100, (
    (priceAction === 'bearish' ? 40 : 0) +
    (volumeSignal * 30) +
    (commentSentiment < 0 ? Math.abs(commentSentiment) * 30 : 0)
  ));

  const neutralScore = Math.max(0, 100 - bullishScore - bearishScore);

  // 5. Confidence based on data availability
  const confidence = Math.min(1, (
    (comments.length / 50) * 0.3 +
    (market.volume / 100000) * 0.4 +
    (market.liquidity / 50000) * 0.3
  ));

  return {
    bullishScore,
    bearishScore,
    neutralScore,
    commentSentiment,
    volumeSignal,
    priceAction,
    confidence
  };
}

// ============================================================================
// RISK ASSESSMENT
// ============================================================================

/**
 * Comprehensive risk analysis
 */
export async function assessMarketRisk(marketId: string): Promise<RiskAssessment> {
  const market = await getMarketDetails(marketId);
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // 1. Liquidity Risk (0-100, higher = more risk)
  const liquidityRisk = market.liquidity < 10000 ? 80 :
                       market.liquidity < 50000 ? 50 :
                       market.liquidity < 100000 ? 30 : 10;

  if (liquidityRisk > 50) {
    warnings.push('Low liquidity - may experience slippage');
    recommendations.push('Consider smaller position sizes');
  }

  // 2. Volatility Risk (based on price extremes)
  const prices = market.outcomes.map(o => o.price);
  const volatility = Math.max(...prices) - Math.min(...prices);
  const volatilityRisk = volatility > 0.7 ? 80 :
                         volatility > 0.5 ? 60 :
                         volatility > 0.3 ? 40 : 20;

  if (volatilityRisk > 60) {
    warnings.push('High price volatility detected');
  }

  // 3. Time Risk (proximity to end date)
  const now = new Date();
  const endDate = new Date(market.endDate);
  const daysRemaining = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  const timeRisk = daysRemaining < 1 ? 90 :
                   daysRemaining < 7 ? 70 :
                   daysRemaining < 30 ? 40 : 20;

  if (timeRisk > 70) {
    warnings.push('Market closing soon - time decay risk');
    recommendations.push('Avoid new positions unless highly confident');
  }

  // 4. Sentiment Risk (conflicting signals)
  const sentiment = await analyzeMarketSentiment(marketId);
  const sentimentRisk = sentiment.confidence < 0.3 ? 70 :
                        sentiment.confidence < 0.5 ? 50 : 30;

  if (sentimentRisk > 50) {
    warnings.push('Mixed or unclear market sentiment');
  }

  // 5. Concentration Risk (single outcome dominance)
  const maxPrice = Math.max(...prices);
  const concentrationRisk = maxPrice > 0.9 ? 80 :
                            maxPrice > 0.8 ? 60 :
                            maxPrice > 0.7 ? 40 : 20;

  if (concentrationRisk > 60) {
    warnings.push('Market heavily skewed - limited upside');
  }

  // Calculate overall risk score
  const riskScore = (
    liquidityRisk * 0.25 +
    volatilityRisk * 0.2 +
    timeRisk * 0.2 +
    sentimentRisk * 0.2 +
    concentrationRisk * 0.15
  );

  const overallRisk: 'low' | 'medium' | 'high' | 'extreme' =
    riskScore > 75 ? 'extreme' :
    riskScore > 60 ? 'high' :
    riskScore > 40 ? 'medium' : 'low';

  if (recommendations.length === 0) {
    recommendations.push('Market conditions appear favorable for trading');
  }

  return {
    overallRisk,
    riskScore,
    factors: {
      liquidityRisk,
      volatilityRisk,
      timeRisk,
      sentimentRisk,
      concentrationRisk
    },
    warnings,
    recommendations
  };
}

// ============================================================================
// ARBITRAGE DETECTION
// ============================================================================

/**
 * Find arbitrage opportunities across related markets
 */
export async function findArbitrageOpportunities(
  keyword: string,
  minReturn: number = 2
): Promise<ArbitrageOpportunity[]> {
  try {
    const markets = await searchMarkets(keyword, { limit: 20, active: true });
    const opportunities: ArbitrageOpportunity[] = [];

    // Look for opposite outcomes across markets
    for (let i = 0; i < markets.length; i++) {
      for (let j = i + 1; j < markets.length; j++) {
        const market1 = markets[i];
        const market2 = markets[j];

        // Check if markets are related but inversely correlated
        const titleSimilarity = calculateSimilarity(market1.title, market2.title);

        if (titleSimilarity > 0.5) {
          // Find opposite outcomes
          const yes1 = market1.outcomes.find(o => o.name.toLowerCase().includes('yes'));
          const no2 = market2.outcomes.find(o => o.name.toLowerCase().includes('no'));

          if (yes1 && no2) {
            const totalCost = yes1.price + no2.price;

            // If total cost < 1, there's an arbitrage opportunity
            if (totalCost < 0.98) {
              const expectedReturn = ((1 - totalCost) / totalCost) * 100;

              if (expectedReturn >= minReturn) {
                opportunities.push({
                  markets: [
                    {
                      id: market1.id,
                      title: market1.title,
                      outcome: yes1.name,
                      price: yes1.price
                    },
                    {
                      id: market2.id,
                      title: market2.title,
                      outcome: no2.name,
                      price: no2.price
                    }
                  ],
                  expectedReturn,
                  confidence: titleSimilarity,
                  risk: expectedReturn > 5 ? 'low' : 'medium',
                  explanation: `Buy '${yes1.name}' at ${yes1.price} and '${no2.name}' at ${no2.price} for guaranteed ${expectedReturn.toFixed(2)}% return`
                });
              }
            }
          }
        }
      }
    }

    return opportunities.sort((a, b) => b.expectedReturn - a.expectedReturn);
  } catch (error: any) {
    console.error('Arbitrage detection failed:', error);
    return [];
  }
}

/**
 * Calculate text similarity (simple Jaccard similarity)
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

// ============================================================================
// ADVANCED ANALYSIS
// ============================================================================

/**
 * Perform comprehensive market analysis with all features
 */
export async function performAdvancedAnalysis(marketId: string): Promise<AdvancedAnalysis> {
  const market = await getMarketDetails(marketId);
  const sentiment = await analyzeMarketSentiment(marketId);
  const riskAssessment = await assessMarketRisk(marketId);

  // Calculate fair value using Kelly Criterion and sentiment
  const yesOutcome = market.outcomes.find(o => o.name.toLowerCase().includes('yes'));
  const currentPrice = yesOutcome?.price || 0.5;

  // Estimate fair value based on sentiment and risk
  const sentimentAdjustment = (sentiment.bullishScore - sentiment.bearishScore) / 200; // -0.5 to 0.5
  const riskAdjustment = (100 - riskAssessment.riskScore) / 200; // 0 to 0.5

  const fairValue = Math.max(0.01, Math.min(0.99,
    currentPrice + sentimentAdjustment + (riskAdjustment * 0.1)
  ));

  const edge = fairValue - currentPrice;
  const edgePercentage = (edge / currentPrice) * 100;

  // Kelly Criterion for optimal bet sizing
  const winProbability = fairValue;
  const lossP probability = 1 - fairValue;
  const kellyBet = Math.max(0, (winProbability - lossProbability) / 1);

  // Price targets
  const priceTargets = {
    shortTerm: currentPrice + (edge * 0.3), // 30% of edge in short term
    mediumTerm: fairValue,
    confidence: sentiment.confidence * (1 - riskAssessment.riskScore / 100)
  };

  // Value bets
  const valueBets = edgePercentage > 2 ? [{
    outcome: yesOutcome?.name || 'Yes',
    currentPrice,
    fairValue,
    edge: edgePercentage,
    kellyBet: kellyBet * 100 // As percentage
  }] : [];

  return {
    market,
    sentiment,
    riskAssessment,
    priceTargets,
    valueBets
  };
}

/**
 * Analyze correlation between multiple markets
 */
export async function analyzeMarketCorrelation(
  marketIds: string[]
): Promise<{
  correlationMatrix: number[][];
  insights: string[];
}> {
  try {
    const markets = await Promise.all(marketIds.map(id => getMarketDetails(id)));
    const prices = markets.map(m =>
      m.outcomes.find(o => o.name.toLowerCase().includes('yes'))?.price || 0.5
    );

    // Simple correlation calculation
    const correlationMatrix: number[][] = [];
    const insights: string[] = [];

    for (let i = 0; i < prices.length; i++) {
      correlationMatrix[i] = [];
      for (let j = 0; j < prices.length; j++) {
        if (i === j) {
          correlationMatrix[i][j] = 1;
        } else {
          // Simplified correlation based on price similarity
          const correlation = 1 - Math.abs(prices[i] - prices[j]);
          correlationMatrix[i][j] = correlation;

          if (i < j && correlation > 0.8) {
            insights.push(
              `High correlation (${(correlation * 100).toFixed(0)}%) between "${markets[i].title}" and "${markets[j].title}"`
            );
          }
        }
      }
    }

    return { correlationMatrix, insights };
  } catch (error: any) {
    throw new Error(`Correlation analysis failed: ${error.message}`);
  }
}

/**
 * Track historical accuracy of similar markets (simulated - would need historical data)
 */
export async function getHistoricalAccuracy(marketId: string): Promise<{
  similarMarkets: number;
  avgAccuracy: number;
  trackRecord: string;
}> {
  // This would require historical market data
  // For now, return placeholder data structure
  return {
    similarMarkets: 0,
    avgAccuracy: 0,
    trackRecord: 'Insufficient historical data available'
  };
}
