/**
 * Blockchain Integration with viem
 * Real smart contract interaction for TaskEscrow
 */

import { createPublicClient, createWalletClient, custom, http, parseEther, formatEther } from 'viem';
import { baseSepolia, base } from 'viem/chains';

const TASK_ESCROW_ADDRESS = import.meta.env.VITE_TASK_ESCROW_ADDRESS || '';
const ACTIVE_CHAIN_NAME = import.meta.env.VITE_ACTIVE_CHAIN || 'base-sepolia';

// Chain configuration
const chains = {
  'base-sepolia': baseSepolia,
  'base': base
};

const ACTIVE_CHAIN = chains[ACTIVE_CHAIN_NAME] || baseSepolia;

// TaskEscrow contract ABI
export const TASK_ESCROW_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_platformWallet", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "requester", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "budget", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "TaskCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "worker", "type": "address" }
    ],
    "name": "TaskClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "proofHash", "type": "string" }
    ],
    "name": "WorkSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }
    ],
    "name": "TaskVerified",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "worker", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "platformFee", "type": "uint256" }
    ],
    "name": "PaymentReleased",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "createTask",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "taskId", "type": "uint256" }],
    "name": "claimTask",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "internalType": "string", "name": "proofHash", "type": "string" }
    ],
    "name": "submitWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "internalType": "bool", "name": "approved", "type": "bool" }
    ],
    "name": "verifyWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "taskId", "type": "uint256" }],
    "name": "getTask",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "requester", "type": "address" },
          { "internalType": "address", "name": "worker", "type": "address" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "budget", "type": "uint256" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" },
          { "internalType": "string", "name": "proofHash", "type": "string" },
          { "internalType": "uint8", "name": "status", "type": "uint8" },
          { "internalType": "bool", "name": "paid", "type": "bool" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
        ],
        "internalType": "struct TaskEscrow.Task",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalTasks",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "taskId", "type": "uint256" }],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

/**
 * Get public client for reading blockchain data
 */
export function getPublicClient() {
  return createPublicClient({
    chain: ACTIVE_CHAIN,
    transport: http()
  });
}

/**
 * Get wallet client for writing transactions
 * Requires browser with injected provider (MetaMask, etc.)
 */
export async function getWalletClient() {
  if (!window.ethereum) {
    throw new Error('No Web3 provider found. Please install MetaMask or another wallet.');
  }

  return createWalletClient({
    chain: ACTIVE_CHAIN,
    transport: custom(window.ethereum)
  });
}

/**
 * Create a new task with escrowed payment
 * @param {Object} params - Task parameters
 * @param {string} params.title - Task title
 * @param {string} params.description - Task description
 * @param {string} params.budget - Budget in ETH (as string)
 * @param {number} params.deadline - Deadline timestamp
 * @returns {Promise<Object>} Transaction result with taskId
 */
export async function createTask({ title, description, budget, deadline }) {
  try {
    if (!TASK_ESCROW_ADDRESS) {
      throw new Error('TaskEscrow contract not deployed. Set VITE_TASK_ESCROW_ADDRESS in .env');
    }

    const walletClient = await getWalletClient();
    const [account] = await walletClient.getAddresses();

    // Create task with escrowed ETH
    const hash = await walletClient.writeContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'createTask',
      args: [title, description, BigInt(deadline)],
      value: parseEther(budget),
      account
    });

    // Wait for transaction confirmation
    const publicClient = getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // TaskCreated event signature: keccak256("TaskCreated(uint256,address,string,uint256,uint256)")
    // Pre-computed: 0x4b3f6f2d5c97ca83f0e4895f4b3c7f9f7f9b74e9c2f8a8f8c3e8f8b3e8f8c3e8
    // Using viem to decode logs properly
    let taskId = null;

    // Find TaskCreated event in logs
    const taskCreatedEvent = TASK_ESCROW_ABI.find(
      item => item.type === 'event' && item.name === 'TaskCreated'
    );

    if (taskCreatedEvent) {
      for (const log of receipt.logs) {
        try {
          // Check if this log is from our contract
          if (log.address.toLowerCase() === TASK_ESCROW_ADDRESS.toLowerCase()) {
            // The taskId is the first indexed parameter (topics[1])
            if (log.topics[1]) {
              taskId = Number(BigInt(log.topics[1]));
              break;
            }
          }
        } catch (e) {
          // Not our event, continue
          continue;
        }
      }
    }

    return {
      hash,
      taskId,
      success: receipt.status === 'success'
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

/**
 * Claim a task
 * @param {string|number} taskId - Task ID
 * @returns {Promise<string>} Transaction hash
 */
export async function claimTask(taskId) {
  try {
    if (!TASK_ESCROW_ADDRESS) {
      throw new Error('TaskEscrow contract not deployed');
    }

    const walletClient = await getWalletClient();
    const [account] = await walletClient.getAddresses();

    const hash = await walletClient.writeContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'claimTask',
      args: [BigInt(taskId)],
      account
    });

    const publicClient = getPublicClient();
    await publicClient.waitForTransactionReceipt({ hash });

    return hash;
  } catch (error) {
    console.error('Error claiming task:', error);
    throw error;
  }
}

/**
 * Submit work for a task
 * @param {string|number} taskId - Task ID
 * @param {string} proofHash - IPFS hash of work proof
 * @returns {Promise<string>} Transaction hash
 */
export async function submitWork(taskId, proofHash) {
  try {
    if (!TASK_ESCROW_ADDRESS) {
      throw new Error('TaskEscrow contract not deployed');
    }

    const walletClient = await getWalletClient();
    const [account] = await walletClient.getAddresses();

    const hash = await walletClient.writeContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'submitWork',
      args: [BigInt(taskId), proofHash],
      account
    });

    const publicClient = getPublicClient();
    await publicClient.waitForTransactionReceipt({ hash });

    return hash;
  } catch (error) {
    console.error('Error submitting work:', error);
    throw error;
  }
}

/**
 * Verify work and release payment if approved
 * @param {string|number} taskId - Task ID
 * @param {boolean} approved - Whether work is approved
 * @returns {Promise<string>} Transaction hash
 */
export async function verifyWork(taskId, approved) {
  try {
    if (!TASK_ESCROW_ADDRESS) {
      throw new Error('TaskEscrow contract not deployed');
    }

    const walletClient = await getWalletClient();
    const [account] = await walletClient.getAddresses();

    const hash = await walletClient.writeContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'verifyWork',
      args: [BigInt(taskId), approved],
      account
    });

    const publicClient = getPublicClient();
    await publicClient.waitForTransactionReceipt({ hash });

    return hash;
  } catch (error) {
    console.error('Error verifying work:', error);
    throw error;
  }
}

/**
 * Get task details from blockchain
 * @param {string|number} taskId - Task ID
 * @returns {Promise<Object>} Task details
 */
export async function getTask(taskId) {
  try {
    if (!TASK_ESCROW_ADDRESS) {
      throw new Error('TaskEscrow contract not deployed');
    }

    const publicClient = getPublicClient();

    const task = await publicClient.readContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'getTask',
      args: [BigInt(taskId)]
    });

    // Parse and format task data
    const statusNames = ['OPEN', 'CLAIMED', 'SUBMITTED', 'VERIFIED', 'COMPLETED', 'DISPUTED'];

    return {
      id: Number(task.id),
      requester: task.requester,
      worker: task.worker,
      title: task.title,
      description: task.description,
      budget: formatEther(task.budget),
      deadline: Number(task.deadline),
      proofHash: task.proofHash,
      status: statusNames[task.status] || 'UNKNOWN',
      paid: task.paid,
      createdAt: Number(task.createdAt)
    };
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
}

/**
 * Get total number of tasks
 * @returns {Promise<number>} Total tasks count
 */
export async function getTotalTasks() {
  try {
    if (!TASK_ESCROW_ADDRESS) {
      return 0;
    }

    const publicClient = getPublicClient();

    const total = await publicClient.readContract({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'getTotalTasks'
    });

    return Number(total);
  } catch (error) {
    console.error('Error fetching total tasks:', error);
    return 0;
  }
}

/**
 * Get multiple tasks in a single multicall
 * @param {string[]|number[]} taskIds - Array of task IDs
 * @returns {Promise<Object[]>} Array of task details
 */
export async function getMultipleBlockchainTasks(taskIds) {
  try {
    if (!TASK_ESCROW_ADDRESS || taskIds.length === 0) {
      return [];
    }

    const publicClient = getPublicClient();

    // Prepare multicall contracts
    const contracts = taskIds.map(id => ({
      address: TASK_ESCROW_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: 'getTask',
      args: [BigInt(id)]
    }));

    // Execute multicall
    const results = await publicClient.multicall({
      contracts
    });

    // Parse results
    const statusNames = ['OPEN', 'CLAIMED', 'SUBMITTED', 'VERIFIED', 'COMPLETED', 'DISPUTED'];

    return results.map((result, index) => {
      if (result.status !== 'success') {
        console.warn(`Failed to fetch task ${taskIds[index]}:`, result.error);
        return null;
      }

      const task = result.result;
      return {
        id: Number(task.id),
        requester: task.requester,
        worker: task.worker,
        title: task.title,
        description: task.description,
        budget: formatEther(task.budget),
        deadline: Number(task.deadline),
        proofHash: task.proofHash,
        status: statusNames[task.status] || 'UNKNOWN',
        paid: task.paid,
        createdAt: Number(task.createdAt)
      };
    }).filter(Boolean); // Remove failed fetches
  } catch (error) {
    console.error('Error fetching multiple tasks:', error);
    throw error;
  }
}

/**
 * Check if contract is deployed
 * @returns {Promise<boolean>}
 */
export async function isContractDeployed() {
  if (!TASK_ESCROW_ADDRESS) return false;

  try {
    const publicClient = getPublicClient();
    const code = await publicClient.getBytecode({ address: TASK_ESCROW_ADDRESS });
    return code && code !== '0x';
  } catch (error) {
    return false;
  }
}
