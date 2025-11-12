/**
 * Type definitions for Prediction Market Agent
 */

export interface Env {
  MCP_SERVER: DurableObjectNamespace;
  THIRDWEB_CLIENT_ID?: string;
  POLYMARKET_API_KEY?: string;
  RPC_URL?: string;
}

export interface MarketData {
  id: string;
  title: string;
  description: string;
  outcomes: MarketOutcome[];
  totalVolume: number;
  totalLiquidity: number;
  endDate: string;
  status: 'active' | 'closed' | 'settled';
  source: string;
}

export interface MarketOutcome {
  name: string;
  probability: number;
  odds: number;
  liquidity: number;
}

export interface Position {
  marketId: string;
  outcome: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercentage: number;
  status: 'active' | 'settled';
}

export interface BetResult {
  success: boolean;
  marketId: string;
  outcome: string;
  amount: number;
  shares: number;
  transactionHash: string;
  gasUsed: string;
  timestamp: string;
  expectedPayout: number;
  breakEvenPrice: number;
}

export interface PnLCalculation {
  marketId: string;
  walletAddress: string;
  realizedPnL: {
    amount: number;
    percentage: number;
    currency: string;
  };
  unrealizedPnL: {
    amount: number;
    percentage: number;
    currency: string;
  } | null;
  totalPnL: {
    amount: number;
    percentage: number;
    currency: string;
  };
  breakdown: {
    initialInvestment: number;
    currentValue: number;
    fees: number;
    numberOfTrades: number;
  };
}
