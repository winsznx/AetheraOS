/**
 * Claude AI Integration - Intelligent Wallet Analysis
 * Generates AI-powered insights from blockchain data
 */

import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

/**
 * Initialize Anthropic Claude client
 */
export function initClaude(apiKey: string) {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

/**
 * Get Claude client instance
 */
function getClient(): Anthropic {
  if (!anthropicClient) {
    throw new Error('Claude not initialized. Call initClaude() first.');
  }
  return anthropicClient;
}

/**
 * Generate comprehensive wallet insights using Claude
 */
export async function generateWalletInsights(walletData: any): Promise<string> {
  const client = getClient();

  const prompt = `Analyze this blockchain wallet data and provide factual insights:

${JSON.stringify(walletData, null, 2)}

Please provide a neutral, factual analysis covering:
1. Portfolio composition (tokens, NFTs, native balance)
2. Transaction activity (volume, frequency, patterns)
3. Wallet age and activity level
4. Notable characteristics or behaviors observed
5. Key metrics and statistics

Focus on objective facts and observable data. Avoid making assumptions about the wallet owner's intentions, experience level, or trading strategy unless clearly evident from the data.

Be concise and informative.`;

  const message = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  return textContent ? (textContent as any).text : 'Unable to generate insights';
}

/**
 * Analyze trading patterns with AI
 */
export async function analyzeTradingPatterns(transactions: any[], chain: string): Promise<{
  strategy: string;
  riskLevel: number;
  confidence: number;
  insights: string;
}> {
  const client = getClient();

  const prompt = `Analyze these ${chain} transactions and identify the trading strategy:

Transaction count: ${transactions.length}
Recent transactions:
${JSON.stringify(transactions.slice(0, 20), null, 2)}

Identify:
1. Primary trading strategy (DCA, swing trading, arbitrage, etc.)
2. Risk level (1-10)
3. Confidence in analysis (0-1)
4. Key insights

Respond in JSON format:
{
  "strategy": "string",
  "riskLevel": number,
  "confidence": number,
  "insights": "string"
}`;

  const message = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  const responseText = textContent ? (textContent as any).text : '{}';

  try {
    // Extract JSON from response (Claude might wrap it in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    return JSON.parse(jsonStr);
  } catch (error) {
    return {
      strategy: 'Unknown',
      riskLevel: 5,
      confidence: 0.1,
      insights: 'Unable to determine strategy from available data'
    };
  }
}

/**
 * Detect whale behavior and provide insights
 */
export async function analyzeWhaleNature(walletData: any): Promise<{
  isWhale: boolean;
  whaleType: string;
  behavior: string;
  recommendation: string;
}> {
  const client = getClient();

  const prompt = `Analyze if this is a whale wallet and what type:

Portfolio Value: $${walletData.metrics?.portfolioValue || 0}
Transaction Count: ${walletData.transactions?.total || 0}
Activity: ${walletData.metrics?.tradingActivity?.frequency || 'unknown'}

Determine:
1. Is this a whale? (>$1M portfolio)
2. What type? (Hodler, Trader, Market Maker, Institutional, etc.)
3. Behavioral patterns
4. Should retail traders follow this wallet?

Respond in JSON:
{
  "isWhale": boolean,
  "whaleType": "string",
  "behavior": "string",
  "recommendation": "FOLLOW | WATCH | AVOID"
}`;

  const message = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  const responseText = textContent ? (textContent as any).text : '{}';

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    return JSON.parse(jsonStr);
  } catch (error) {
    return {
      isWhale: false,
      whaleType: 'Unknown',
      behavior: 'Unable to determine',
      recommendation: 'WATCH'
    };
  }
}

/**
 * Calculate risk score with AI reasoning
 */
export async function calculateRiskScore(walletData: any): Promise<{
  score: number;
  factors: string[];
  reasoning: string;
}> {
  const client = getClient();

  const prompt = `Calculate a risk score (0-10) for this wallet:

Data:
${JSON.stringify(walletData, null, 2)}

Consider:
- Transaction patterns
- Portfolio diversity
- Trading frequency
- Historical success rate
- Exposure to risky assets

Respond in JSON:
{
  "score": number (0-10),
  "factors": ["factor1", "factor2", ...],
  "reasoning": "explanation"
}`;

  const message = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  const responseText = textContent ? (textContent as any).text : '{}';

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    return JSON.parse(jsonStr);
  } catch (error) {
    return {
      score: 5,
      factors: ['Insufficient data'],
      reasoning: 'Unable to calculate accurate risk score'
    };
  }
}

/**
 * Identify smart money characteristics
 */
export async function identifySmartMoney(walletData: any): Promise<{
  isSmartMoney: boolean;
  confidence: number;
  indicators: string[];
  recommendation: string;
}> {
  const client = getClient();

  const prompt = `Determine if this is a "smart money" wallet (experienced, profitable trader):

${JSON.stringify(walletData, null, 2)}

Look for:
- Early positions in successful projects
- High win rate
- Consistent profitability
- Following other smart wallets
- Low-risk, high-reward trades

Respond in JSON:
{
  "isSmartMoney": boolean,
  "confidence": number (0-1),
  "indicators": ["indicator1", ...],
  "recommendation": "string"
}`;

  const message = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  const responseText = textContent ? (textContent as any).text : '{}';

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    return JSON.parse(jsonStr);
  } catch (error) {
    return {
      isSmartMoney: false,
      confidence: 0.1,
      indicators: [],
      recommendation: 'Insufficient data to determine'
    };
  }
}

/**
 * Generate cross-chain analysis combining multiple chains
 */
export async function analyzeCrossChain(evmData: any, solanaData: any): Promise<string> {
  const client = getClient();

  const prompt = `Analyze this wallet's activity across EVM (Base/Ethereum) and Solana chains:

EVM Data:
${JSON.stringify(evmData, null, 2)}

Solana Data:
${JSON.stringify(solanaData, null, 2)}

Provide insights on:
1. Cross-chain strategy
2. Portfolio diversification
3. Chain preferences
4. Overall sophistication level
5. Final recommendation for copy trading

Be concise and actionable.`;

  const message = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  return textContent ? (textContent as any).text : 'Unable to generate cross-chain analysis';
}
