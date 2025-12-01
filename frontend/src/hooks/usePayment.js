/**
 * usePayment Hook
 * Manages x402 payments with Thirdweb for MCP tool usage
 */

import { useState, useCallback } from 'react';
import { wrapFetchWithPayment } from 'thirdweb/x402';
import { createThirdwebClient } from 'thirdweb';
import { createWallet, injectedProvider } from 'thirdweb/wallets';
import { baseSepolia } from 'thirdweb/chains';

// Tool pricing (matches backend)
const TOOL_PRICING = {
  // Wallet Intelligence
  'analyze-wallet': '0.01',
  'detect-whales': '0.005',
  'smart-money-tracker': '0.02',
  'risk-score': '0.005',
  'trading-patterns': '0.01',
  // Task Escrow
  'create_task': '0.005',
  'claim_task': '0.002',
  'submit_work': '0.002',
  'verify_work': '0.003',
  'get_task': '0.001',
  // IPFS Storage
  'upload_work_proof': '0.003',
  'upload_json': '0.002',
  'download_proof': '0.001',
  'pin_to_ipfs': '0.002',
  'get_ipfs_url': '0.0005',
  // Prediction Markets
  'get_market_data': '0.002',
  'analyze_market': '0.005',
  'get_trending_markets': '0.003',
  'search_markets': '0.002'
};

// Tool categories
const TOOL_CATEGORIES = {
  'analyze-wallet': 'Wallet Intelligence',
  'detect-whales': 'Wallet Intelligence',
  'smart-money-tracker': 'Wallet Intelligence',
  'risk-score': 'Wallet Intelligence',
  'trading-patterns': 'Wallet Intelligence',
  'create_task': 'Task Escrow',
  'claim_task': 'Task Escrow',
  'submit_work': 'Task Escrow',
  'verify_work': 'Task Escrow',
  'get_task': 'Task Escrow',
  'upload_work_proof': 'IPFS Storage',
  'upload_json': 'IPFS Storage',
  'download_proof': 'IPFS Storage',
  'pin_to_ipfs': 'IPFS Storage',
  'get_ipfs_url': 'IPFS Storage',
  'get_market_data': 'Prediction Markets',
  'analyze_market': 'Prediction Markets',
  'get_trending_markets': 'Prediction Markets',
  'search_markets': 'Prediction Markets'
};

// Tool descriptions
const TOOL_DESCRIPTIONS = {
  'analyze-wallet': 'Deep cross-chain wallet analysis with AI insights',
  'detect-whales': 'Identify whale wallets and track their movements',
  'smart-money-tracker': 'Track smart money wallets with proven alpha',
  'risk-score': 'Calculate comprehensive risk score for wallet',
  'trading-patterns': 'Analyze trading patterns and identify strategies',
  'create_task': 'Create blockchain task with escrowed ETH payment',
  'claim_task': 'Claim an available task to start working',
  'submit_work': 'Submit work proof (IPFS hash) for task',
  'verify_work': 'Verify work and release escrowed payment',
  'get_task': 'Get task details from blockchain',
  'upload_work_proof': 'Upload work proof file to IPFS with metadata',
  'upload_json': 'Upload JSON data to IPFS',
  'download_proof': 'Download and verify work proof from IPFS',
  'pin_to_ipfs': 'Pin existing IPFS hash for persistence',
  'get_ipfs_url': 'Get gateway URL for IPFS hash',
  'get_market_data': 'Fetch prediction market data from Polymarket',
  'analyze_market': 'Analyze prediction market odds to find value bets',
  'get_trending_markets': 'Get trending prediction markets by category',
  'search_markets': 'Search prediction markets by query'
};

export function usePayment() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);

  /**
   * Initialize Thirdweb client
   */
  const getClient = useCallback(() => {
    const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

    if (!clientId) {
      console.warn('VITE_THIRDWEB_CLIENT_ID not set - using demo mode');
      return null;
    }

    return createThirdwebClient({ clientId });
  }, []);

  /**
   * Get connected wallet
   */
  const getWallet = useCallback(async (client) => {
    if (!client) return null;

    try {
      // Try to use injected provider (MetaMask, etc.)
      if (injectedProvider('io.metamask')) {
        const wallet = createWallet('io.metamask');
        await wallet.connect({ client });
        return wallet;
      }

      // Fallback to any injected provider
      const wallet = createWallet('injected');
      await wallet.connect({ client });
      return wallet;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }, []);

  /**
   * Get payment details for a tool
   */
  const getPaymentDetails = useCallback((toolName) => {
    return {
      toolName,
      price: TOOL_PRICING[toolName] || '0',
      currency: 'ETH',
      network: 'Base Sepolia',
      description: TOOL_DESCRIPTIONS[toolName] || '',
      category: TOOL_CATEGORIES[toolName] || ''
    };
  }, []);

  /**
   * Open payment modal
   */
  const requestPayment = useCallback((toolName, requestFn) => {
    const details = getPaymentDetails(toolName);

    setCurrentPayment(details);
    setPendingRequest(() => requestFn);
    setIsPaymentModalOpen(true);
  }, [getPaymentDetails]);

  /**
   * Handle payment approval
   */
  const handlePaymentApproval = useCallback(async () => {
    if (!pendingRequest) {
      throw new Error('No pending request');
    }

    try {
      // Execute the pending request
      const result = await pendingRequest();

      return {
        success: true,
        result,
        txHash: result?.transactionHash || result?.txHash
      };
    } catch (error) {
      console.error('Payment execution error:', error);
      throw error;
    }
  }, [pendingRequest]);

  /**
   * Close payment modal
   */
  const closePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
    setCurrentPayment(null);
    setPendingRequest(null);
  }, []);

  /**
   * Make a paid tool call
   */
  const callPaidTool = useCallback(async (toolName, params, endpoint) => {
    const client = getClient();

    if (!client) {
      console.warn('Thirdweb client not available - making direct call');
      // Fallback to direct fetch (will get 402 error)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (response.status === 402) {
        throw new Error('Payment required but Thirdweb not configured');
      }

      return await response.json();
    }

    // Get wallet
    const wallet = await getWallet(client);
    if (!wallet) {
      throw new Error('Failed to connect wallet');
    }

    // Wrap fetch with payment
    const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);

    // Make the paid request
    const response = await fetchWithPay(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return await response.json();
  }, [getClient, getWallet]);

  return {
    // State
    isPaymentModalOpen,
    currentPayment,

    // Actions
    requestPayment,
    handlePaymentApproval,
    closePaymentModal,
    callPaidTool,
    getPaymentDetails
  };
}
