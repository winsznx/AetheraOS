/**
 * Moralis API Integration - Real EVM Blockchain Data
 * Provides wallet analysis for Base and Ethereum chains
 */

import Moralis from 'moralis';

// Chain ID mapping for Moralis
const CHAIN_IDS = {
  base: '0x2105',      // Base mainnet
  ethereum: '0x1',     // Ethereum mainnet
  'base-sepolia': '0x14a34' // Base Sepolia testnet
} as const;

type SupportedChain = keyof typeof CHAIN_IDS;

// Initialize Moralis (call once on startup)
export async function initMoralis(apiKey: string) {
  if (!Moralis.Core.isStarted) {
    await Moralis.start({ apiKey });
  }
}

/**
 * Analyze wallet with comprehensive data
 */
export async function analyzeWallet(address: string, chain: SupportedChain = 'base') {
  const chainId = CHAIN_IDS[chain];

  // Get wallet transaction history
  const transactions = await Moralis.EvmApi.transaction.getWalletTransactions({
    address,
    chain: chainId,
    limit: 100,
    order: 'DESC'
  });

  // Get token balances
  const tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
    address,
    chain: chainId
  });

  // Get NFTs
  const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
    address,
    chain: chainId,
    limit: 50
  });

  // Get native balance (ETH/Base)
  const balance = await Moralis.EvmApi.balance.getNativeBalance({
    address,
    chain: chainId
  });

  // Calculate portfolio metrics
  const portfolioValue = calculatePortfolioValue(balance, tokens.result);
  const tradingActivity = analyzeTradingActivity(transactions.result);

  return {
    address,
    chain,
    balance: {
      native: balance.result.balance,
      nativeSymbol: chain === 'base' ? 'ETH' : 'ETH',
      tokens: tokens.result.map((token: any) => ({
        symbol: token.symbol,
        name: token.name,
        balance: token.balance,
        decimals: token.decimals,
        tokenAddress: token.token_address
      }))
    },
    nfts: {
      count: nfts.result.length,
      collections: nfts.result.map((nft: any) => ({
        name: nft.name,
        symbol: nft.symbol,
        tokenId: nft.token_id,
        contractAddress: nft.token_address
      }))
    },
    transactions: {
      total: transactions.result.length,
      recent: transactions.result.slice(0, 10).map((tx: any) => ({
        hash: tx.hash,
        from: tx.from_address,
        to: tx.to_address,
        value: tx.value,
        gas: tx.gas_price,
        timestamp: tx.block_timestamp,
        success: tx.receipt_status === '1'
      }))
    },
    metrics: {
      portfolioValue,
      tradingActivity,
      isWhale: portfolioValue > 1_000_000, // >$1M
      activityScore: tradingActivity.score
    }
  };
}

/**
 * Get detailed transaction history
 */
export async function getWalletHistory(
  address: string,
  chain: SupportedChain = 'base',
  limit: number = 100
) {
  const chainId = CHAIN_IDS[chain];

  const transactions = await Moralis.EvmApi.transaction.getWalletTransactions({
    address,
    chain: chainId,
    limit
  });

  return transactions.result.map((tx: any) => ({
    hash: tx.hash,
    from: tx.from_address,
    to: tx.to_address,
    value: tx.value,
    gas: tx.gas_price,
    timestamp: tx.block_timestamp,
    blockNumber: tx.block_number,
    success: tx.receipt_status === '1',
    nonce: tx.nonce
  }));
}

/**
 * Detect if wallet is a whale (>$1M portfolio)
 */
export async function isWhaleWallet(address: string, chain: SupportedChain = 'base'): Promise<boolean> {
  const chainId = CHAIN_IDS[chain];

  const balance = await Moralis.EvmApi.balance.getNativeBalance({
    address,
    chain: chainId
  });

  const tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
    address,
    chain: chainId
  });

  const totalValue = calculatePortfolioValue(balance, tokens.result);
  return totalValue > 1_000_000;
}

/**
 * Get wallet token transfers
 */
export async function getTokenTransfers(
  address: string,
  chain: SupportedChain = 'base',
  limit: number = 100
) {
  const chainId = CHAIN_IDS[chain];

  const transfers = await Moralis.EvmApi.token.getWalletTokenTransfers({
    address,
    chain: chainId,
    limit
  });

  return transfers.result.map((transfer: any) => ({
    from: transfer.from_address,
    to: transfer.to_address,
    value: transfer.value,
    tokenAddress: transfer.address,
    tokenSymbol: transfer.token_symbol,
    tokenName: transfer.token_name,
    timestamp: transfer.block_timestamp,
    txHash: transfer.transaction_hash
  }));
}

/**
 * Calculate total portfolio value (rough estimate in USD)
 */
function calculatePortfolioValue(nativeBalance: any, tokens: any[]): number {
  // ETH price approximation (would use real price oracle in production)
  const ETH_PRICE = 2000; // USD

  const nativeValue = (Number(nativeBalance.balance) / 1e18) * ETH_PRICE;

  // For tokens, we'd need price data from a DEX or oracle
  // For now, just count native value
  // TODO: Integrate with DeFi Llama or CoinGecko for token prices

  return nativeValue;
}

/**
 * Analyze trading activity patterns
 */
function analyzeTradingActivity(transactions: any[]): {
  score: number;
  frequency: 'low' | 'medium' | 'high';
  avgGasPrice: string;
  recentActivity: number;
} {
  if (transactions.length === 0) {
    return {
      score: 0,
      frequency: 'low',
      avgGasPrice: '0',
      recentActivity: 0
    };
  }

  // Calculate activity in last 30 days
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentTxs = transactions.filter(tx =>
    new Date(tx.block_timestamp).getTime() > thirtyDaysAgo
  );

  const frequency = recentTxs.length > 50 ? 'high' :
                   recentTxs.length > 10 ? 'medium' : 'low';

  // Calculate average gas price
  const avgGas = transactions.reduce((sum, tx) =>
    sum + Number(tx.gas_price || 0), 0
  ) / transactions.length;

  // Activity score (0-100)
  const score = Math.min(100, (recentTxs.length / 100) * 100);

  return {
    score,
    frequency,
    avgGasPrice: avgGas.toString(),
    recentActivity: recentTxs.length
  };
}
