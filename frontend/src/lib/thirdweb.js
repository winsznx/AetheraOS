/**
 * Thirdweb SDK Integration with x402 Payments
 * Client configuration for Base Sepolia and payment processing
 */

import { createThirdwebClient } from 'thirdweb';
import { wrapFetchWithPayment } from 'thirdweb/x402';
import { createWallet, injectedProvider } from 'thirdweb/wallets';
import { baseSepolia, base } from 'thirdweb/chains';

// Environment Configuration
const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID || '';
const NETWORK = import.meta.env.VITE_NETWORK || 'testnet';
const CHAININTEL_MCP_URL = import.meta.env.VITE_CHAININTEL_MCP_URL || 'https://chainintel-mcp.timjosh507.workers.dev';

// Select chain based on network
export const ACTIVE_CHAIN = NETWORK === 'mainnet' ? base : baseSepolia;

/**
 * Initialize Thirdweb Client
 * @returns {object} Thirdweb client instance
 */
export function getThirdwebClient() {
  if (!THIRDWEB_CLIENT_ID) {
    console.warn('VITE_THIRDWEB_CLIENT_ID not set - x402 payments will not work');
    return null;
  }

  return createThirdwebClient({
    clientId: THIRDWEB_CLIENT_ID
  });
}

/**
 * Connect wallet for x402 payments
 * @returns {Promise<object>} Connected wallet instance
 */
export async function connectWallet() {
  const client = getThirdwebClient();

  if (!client) {
    throw new Error('Thirdweb client not initialized');
  }

  try {
    // Try MetaMask first
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
    throw new Error('Please install MetaMask or another Web3 wallet');
  }
}

/**
 * Create fetch wrapper with x402 payment support
 * @param {object} wallet - Connected wallet instance
 * @returns {function} Fetch function with payment support
 */
export function createPaymentFetch(wallet) {
  const client = getThirdwebClient();

  if (!client || !wallet) {
    console.warn('Payment fetch not available - using standard fetch');
    return fetch;
  }

  return wrapFetchWithPayment(fetch, client, wallet);
}

/**
 * Call a ChainIntel MCP tool with payment
 * @param {string} toolName - Tool name (e.g., 'analyze-wallet')
 * @param {object} params - Tool parameters
 * @param {object} wallet - Connected wallet (optional, will connect if not provided)
 * @returns {Promise<object>} Tool execution result
 */
export async function callMCPTool(toolName, params, wallet = null) {
  try {
    // Connect wallet if not provided
    if (!wallet) {
      wallet = await connectWallet();
    }

    // Create payment-enabled fetch
    const fetchWithPay = createPaymentFetch(wallet);

    // Construct endpoint URL
    const endpoint = `${CHAININTEL_MCP_URL}/${toolName}`;

    // Make the request (will handle 402 automatically)
    const response = await fetchWithPay(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${toolName}:`, error);
    throw error;
  }
}

/**
 * Get MCP tool pricing info
 * @returns {Promise<array>} Array of tool pricing information
 */
export async function getMCPPricing() {
  try {
    const response = await fetch(`${CHAININTEL_MCP_URL}/pricing`);

    if (!response.ok) {
      throw new Error('Failed to fetch pricing');
    }

    const data = await response.json();
    return data.tools || [];
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return [];
  }
}

/**
 * Get MCP server info
 * @returns {Promise<object>} Server information
 */
export async function getMCPInfo() {
  try {
    const response = await fetch(`${CHAININTEL_MCP_URL}/`);

    if (!response.ok) {
      throw new Error('Failed to fetch server info');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching server info:', error);
    return null;
  }
}

/**
 * Create a new task in the escrow contract (via MCP)
 * @param {Object} params - Task parameters
 * @param {string} params.title - Task title
 * @param {string} params.description - Task description
 * @param {string} params.budget - Budget in ETH
 * @param {number} params.deadline - Deadline timestamp
 * @returns {Promise<string>} Task ID
 */
export async function createTask({ title, description, budget, deadline }) {
  try {
    const result = await callMCPTool('create_task', {
      title,
      description,
      budget,
      deadline
    });

    return result.taskId || `task-${Date.now()}`;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

/**
 * Claim a task (via MCP)
 * @param {string} taskId - Task ID
 * @returns {Promise<void>}
 */
export async function claimTask(taskId) {
  return await callMCPTool('claim_task', { taskId });
}

/**
 * Submit work for a task (via MCP)
 * @param {string} taskId - Task ID
 * @param {string} proofHash - IPFS hash of work proof
 * @returns {Promise<void>}
 */
export async function submitWork(taskId, proofHash) {
  return await callMCPTool('submit_work', { taskId, proofHash });
}

/**
 * Verify work and release payment (via MCP)
 * @param {string} taskId - Task ID
 * @param {boolean} approved - Whether work is approved
 * @returns {Promise<void>}
 */
export async function verifyWork(taskId, approved) {
  return await callMCPTool('verify_work', { taskId, approved });
}

/**
 * Get task details from blockchain (via MCP)
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Task details
 */
export async function getTask(taskId) {
  return await callMCPTool('get_task', { taskId });
}

/**
 * Upload file to IPFS (via MCP)
 * @param {File} file - File to upload
 * @returns {Promise<string>} IPFS hash
 */
export async function uploadToIPFS(file) {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const base64Content = reader.result.split(',')[1];

        const result = await callMCPTool('upload_work_proof', {
          content: base64Content,
          filename: file.name
        });

        resolve(result.ipfsHash);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Download file from IPFS (via MCP)
 * @param {string} hash - IPFS hash
 * @returns {Promise<Blob>} File data
 */
export async function downloadFromIPFS(hash) {
  const result = await callMCPTool('download_proof', { ipfsHash: hash });

  // Convert base64 to blob if needed
  if (result.content && typeof result.content === 'string') {
    const byteCharacters = atob(result.content);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays);
  }

  return new Blob(['No content']);
}

// Export configuration for use in components
export const config = {
  clientId: THIRDWEB_CLIENT_ID,
  chain: ACTIVE_CHAIN,
  network: NETWORK,
  mcpUrl: CHAININTEL_MCP_URL
};
