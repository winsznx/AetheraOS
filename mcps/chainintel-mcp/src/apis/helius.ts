/**
 * Helius API Integration - Real Solana Blockchain Data
 * Provides wallet analysis for Solana blockchain
 */

import { Helius } from 'helius-sdk';
import { PublicKey } from '@solana/web3.js';

let heliusClient: Helius | null = null;

/**
 * Initialize Helius SDK
 */
export function initHelius(apiKey: string) {
  if (!heliusClient) {
    heliusClient = new Helius(apiKey);
  }
  return heliusClient;
}

/**
 * Get Helius client instance
 */
function getClient(): Helius {
  if (!heliusClient) {
    throw new Error('Helius not initialized. Call initHelius() first.');
  }
  return heliusClient;
}

/**
 * Analyze Solana wallet comprehensively
 */
export async function analyzeSolanaWallet(address: string) {
  const client = getClient();
  const connection = client.connection;

  // Parse address to PublicKey
  const pubkey = new PublicKey(address);

  // Get transaction history
  const transactions = await connection.getSignaturesForAddress(pubkey, {
    limit: 100
  });

  // Get token accounts (SPL tokens)
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') // SPL Token program
  });

  const balances = tokenAccounts.value;

  // Get SOL balance
  const solBalance = await connection.getBalance(pubkey);

  // Detect if whale
  const isWhale = await detectSolanaWhale(address, balances, solBalance);

  // Analyze trading patterns
  const tradingPatterns = analyzeSolanaTrading(transactions);

  return {
    address,
    chain: 'solana',
    balance: {
      native: solBalance,
      nativeSymbol: 'SOL',
      tokens: balances.map((token: any) => ({
        mint: token.account.data.parsed.info.mint,
        amount: token.account.data.parsed.info.tokenAmount.amount,
        decimals: token.account.data.parsed.info.tokenAmount.decimals,
        uiAmount: token.account.data.parsed.info.tokenAmount.uiAmount
      }))
    },
    transactions: {
      total: transactions.length,
      recent: transactions.slice(0, 10).map((tx: any) => ({
        signature: tx.signature,
        slot: tx.slot,
        timestamp: tx.blockTime,
        success: tx.err === null,
        confirmationStatus: tx.confirmationStatus
      }))
    },
    metrics: {
      isWhale,
      tradingPatterns,
      activityScore: calculateSolanaActivityScore(transactions)
    }
  };
}

/**
 * Get detailed Solana transaction history
 */
export async function getSolanaTransactions(address: string, limit: number = 100) {
  const client = getClient();
  const connection = client.connection;
  const pubkey = new PublicKey(address);

  const signatures = await connection.getSignaturesForAddress(pubkey, {
    limit
  });

  // Get parsed transaction data
  const transactions = await Promise.all(
    signatures.slice(0, Math.min(10, limit)).map(async (sig: any) => {
      try {
        const tx = await connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });
        return tx;
      } catch (error) {
        return null;
      }
    })
  );

  return transactions.filter(tx => tx !== null);
}

/**
 * Detect if Solana wallet is a whale
 */
export async function detectSolanaWhale(
  address: string,
  balances?: any[],
  solBalance?: number
): Promise<boolean> {
  const client = getClient();
  const connection = client.connection;
  const pubkey = new PublicKey(address);

  // Get balances if not provided
  const actualSolBalance = solBalance !== undefined
    ? solBalance
    : await connection.getBalance(pubkey);

  const actualBalances = balances !== undefined
    ? balances
    : (await connection.getParsedTokenAccountsByOwner(pubkey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      })).value;

  // SOL price approximation
  const SOL_PRICE = 100; // USD (would use real oracle in production)

  const solValue = (actualSolBalance / 1e9) * SOL_PRICE;

  // For tokens, we'd need price data
  // For now, just use SOL value
  // TODO: Integrate with Jupiter or other Solana DEX for token prices

  return solValue > 100_000; // >$100k in SOL considered whale
}

/**
 * Get token transfers for Solana wallet
 */
export async function getSolanaTokenTransfers(address: string, limit: number = 100) {
  const client = getClient();
  const connection = client.connection;
  const pubkey = new PublicKey(address);

  const signatures = await connection.getSignaturesForAddress(pubkey, {
    limit
  });

  // Parse transactions to find token transfers
  const transfers = [];

  for (const sig of signatures.slice(0, Math.min(20, limit))) {
    try {
      const tx = await connection.getParsedTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0
      });

      if (tx && tx.meta && tx.meta.postTokenBalances) {
        // Extract token transfer info
        const tokenChanges = tx.meta.postTokenBalances.filter((balance: any) =>
          balance.owner === address
        );

        if (tokenChanges.length > 0) {
          transfers.push({
            signature: sig.signature,
            timestamp: sig.blockTime,
            tokenChanges,
            success: tx.meta.err === null
          });
        }
      }
    } catch (error) {
      // Skip failed transaction parsing
      continue;
    }
  }

  return transfers;
}

/**
 * Track smart money on Solana
 */
export async function trackSolanaSmartMoney(address: string, lookbackDays: number = 90) {
  const client = getClient();
  const connection = client.connection;
  const pubkey = new PublicKey(address);

  const lookbackTimestamp = Math.floor(Date.now() / 1000) - (lookbackDays * 24 * 60 * 60);

  const signatures = await connection.getSignaturesForAddress(pubkey, {
    limit: 1000 // Get more for analysis
  });

  // Filter transactions within lookback period
  const recentSigs = signatures.filter((sig: any) =>
    sig.blockTime && sig.blockTime > lookbackTimestamp
  );

  // Analyze for smart money indicators
  const winRate = calculateWinRate(recentSigs);
  const avgProfit = calculateAvgProfit(recentSigs);
  const earlyMints = await detectEarlyMints(client, address, recentSigs);

  return {
    address,
    lookbackDays,
    metrics: {
      totalTrades: recentSigs.length,
      winRate,
      avgProfit,
      earlyMints: earlyMints.length,
      smartMoneyScore: calculateSmartMoneyScore(winRate, avgProfit, earlyMints.length)
    },
    isSmartMoney: winRate > 0.6 && earlyMints.length > 3
  };
}

/**
 * Analyze Solana trading patterns
 */
function analyzeSolanaTrading(transactions: any[]) {
  if (transactions.length === 0) {
    return {
      frequency: 'low',
      avgTransactionsPerDay: 0,
      mostActiveHour: 0
    };
  }

  // Calculate transactions per day
  const timestamps = transactions
    .filter(tx => tx.blockTime)
    .map(tx => tx.blockTime);

  if (timestamps.length === 0) {
    return {
      frequency: 'low',
      avgTransactionsPerDay: 0,
      mostActiveHour: 0
    };
  }

  const oldestTx = Math.min(...timestamps);
  const newestTx = Math.max(...timestamps);
  const daysDiff = (newestTx - oldestTx) / (24 * 60 * 60);

  const avgPerDay = daysDiff > 0 ? transactions.length / daysDiff : 0;

  const frequency = avgPerDay > 10 ? 'high' :
                   avgPerDay > 2 ? 'medium' : 'low';

  // Find most active hour
  const hours = timestamps.map(ts => new Date(ts * 1000).getHours());
  const hourCounts = hours.reduce((acc: any, hour) => {
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const mostActiveHour = Object.entries(hourCounts)
    .sort(([, a]: any, [, b]: any) => b - a)[0]?.[0] || 0;

  return {
    frequency,
    avgTransactionsPerDay: avgPerDay,
    mostActiveHour: Number(mostActiveHour)
  };
}

/**
 * Calculate activity score for Solana wallet
 */
function calculateSolanaActivityScore(transactions: any[]): number {
  if (transactions.length === 0) return 0;

  // Recent activity (last 30 days)
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
  const recentTxs = transactions.filter(tx =>
    tx.blockTime && tx.blockTime > thirtyDaysAgo
  );

  // Score based on recent activity (0-100)
  return Math.min(100, (recentTxs.length / 50) * 100);
}

/**
 * Calculate win rate from transactions
 */
function calculateWinRate(transactions: any[]): number {
  // Simplified - in production would analyze actual profit/loss
  const successfulTxs = transactions.filter(tx => tx.err === null);
  return transactions.length > 0 ? successfulTxs.length / transactions.length : 0;
}

/**
 * Calculate average profit
 */
function calculateAvgProfit(transactions: any[]): number {
  // Placeholder - would need actual price data to calculate
  // TODO: Integrate with Jupiter or other price feeds
  return 0;
}

/**
 * Detect early mint participation (smart money indicator)
 */
async function detectEarlyMints(client: Helius, address: string, transactions: any[]) {
  // Simplified - would analyze if wallet minted NFTs that later became valuable
  // This requires additional data sources
  return [];
}

/**
 * Calculate smart money score (0-100)
 */
function calculateSmartMoneyScore(
  winRate: number,
  avgProfit: number,
  earlyMints: number
): number {
  // Weighted scoring
  const winRateScore = winRate * 50; // 50% weight
  const earlyMintScore = Math.min(30, earlyMints * 5); // 30% weight max
  const profitScore = Math.min(20, avgProfit / 1000); // 20% weight max

  return Math.round(winRateScore + earlyMintScore + profitScore);
}
