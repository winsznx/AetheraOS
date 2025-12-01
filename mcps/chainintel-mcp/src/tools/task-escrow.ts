/**
 * Task Escrow Tools - Blockchain task management with escrow payments
 * Integrated from task-escrow MCP
 */

import { z } from 'zod';
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';

// TaskEscrow ABI
const TASK_ESCROW_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' }
    ],
    name: 'createTask',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'taskId', type: 'uint256' }],
    name: 'claimTask',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'taskId', type: 'uint256' },
      { internalType: 'string', name: 'proofHash', type: 'string' }
    ],
    name: 'submitWork',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'taskId', type: 'uint256' },
      { internalType: 'bool', name: 'approved', type: 'bool' }
    ],
    name: 'verifyWork',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'taskId', type: 'uint256' }],
    name: 'getTask',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'address', name: 'requester', type: 'address' },
          { internalType: 'address', name: 'worker', type: 'address' },
          { internalType: 'string', name: 'title', type: 'string' },
          { internalType: 'string', name: 'description', type: 'string' },
          { internalType: 'uint256', name: 'budget', type: 'uint256' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'string', name: 'proofHash', type: 'string' },
          { internalType: 'uint8', name: 'status', type: 'uint8' },
          { internalType: 'bool', name: 'paid', type: 'bool' },
          { internalType: 'uint256', name: 'createdAt', type: 'uint256' }
        ],
        internalType: 'struct TaskEscrow.Task',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Schemas
export const CreateTaskSchema = z.object({
  title: z.string().describe('Task title'),
  description: z.string().describe('Detailed task description'),
  budget: z.string().describe('Budget in ETH (e.g., "0.05")'),
  deadline: z.number().describe('Unix timestamp for deadline'),
  contractAddress: z.string().optional().describe('Task escrow contract address (defaults to env variable)')
});

export const ClaimTaskSchema = z.object({
  taskId: z.number().describe('Task ID to claim'),
  contractAddress: z.string().optional()
});

export const SubmitWorkSchema = z.object({
  taskId: z.number().describe('Task ID'),
  proofHash: z.string().describe('IPFS hash of work proof'),
  contractAddress: z.string().optional()
});

export const VerifyWorkSchema = z.object({
  taskId: z.number().describe('Task ID'),
  approved: z.boolean().describe('Whether to approve the work'),
  contractAddress: z.string().optional()
});

export const GetTaskSchema = z.object({
  taskId: z.number().describe('Task ID to fetch'),
  contractAddress: z.string().optional()
});

// Tool definitions
export const createTaskToolDef = {
  name: 'create_task',
  description: 'Create a new task with escrowed ETH payment on Base blockchain',
  parameters: CreateTaskSchema,
  execute: createTask
};

export const claimTaskToolDef = {
  name: 'claim_task',
  description: 'Claim an available task to start working on it',
  parameters: ClaimTaskSchema,
  execute: claimTask
};

export const submitWorkToolDef = {
  name: 'submit_work',
  description: 'Submit work proof (IPFS hash) for a claimed task',
  parameters: SubmitWorkSchema,
  execute: submitWork
};

export const verifyWorkToolDef = {
  name: 'verify_work',
  description: 'Verify submitted work and release payment if approved',
  parameters: VerifyWorkSchema,
  execute: verifyWork
};

export const getTaskToolDef = {
  name: 'get_task',
  description: 'Get details of a task from the blockchain',
  parameters: GetTaskSchema,
  execute: getTaskInfo
};

// Helper functions
function getPublicClient() {
  return createPublicClient({
    chain: baseSepolia,
    transport: http()
  });
}

// Tool implementations
async function createTask(params: z.infer<typeof CreateTaskSchema>) {
  const contractAddress = params.contractAddress || process.env.TASK_ESCROW_ADDRESS;

  if (!contractAddress) {
    throw new Error('Task escrow contract address not configured');
  }

  return {
    success: true,
    message: 'Task creation requires wallet interaction - this would trigger a transaction',
    params: {
      title: params.title,
      description: params.description,
      budget: params.budget,
      deadline: params.deadline,
      contractAddress
    },
    nextSteps: 'User needs to approve transaction in their wallet'
  };
}

async function claimTask(params: z.infer<typeof ClaimTaskSchema>) {
  const contractAddress = params.contractAddress || process.env.TASK_ESCROW_ADDRESS;

  if (!contractAddress) {
    throw new Error('Task escrow contract address not configured');
  }

  return {
    success: true,
    message: 'Task claim requires wallet interaction',
    taskId: params.taskId,
    contractAddress,
    nextSteps: 'User needs to approve transaction in their wallet'
  };
}

async function submitWork(params: z.infer<typeof SubmitWorkSchema>) {
  const contractAddress = params.contractAddress || process.env.TASK_ESCROW_ADDRESS;

  if (!contractAddress) {
    throw new Error('Task escrow contract address not configured');
  }

  return {
    success: true,
    message: 'Work submission requires wallet interaction',
    taskId: params.taskId,
    proofHash: params.proofHash,
    contractAddress,
    nextSteps: 'User needs to approve transaction in their wallet'
  };
}

async function verifyWork(params: z.infer<typeof VerifyWorkSchema>) {
  const contractAddress = params.contractAddress || process.env.TASK_ESCROW_ADDRESS;

  if (!contractAddress) {
    throw new Error('Task escrow contract address not configured');
  }

  return {
    success: true,
    message: 'Work verification requires wallet interaction',
    taskId: params.taskId,
    approved: params.approved,
    contractAddress,
    nextSteps: 'User needs to approve transaction in their wallet'
  };
}

async function getTaskInfo(params: z.infer<typeof GetTaskSchema>) {
  const contractAddress = params.contractAddress || process.env.TASK_ESCROW_ADDRESS;

  if (!contractAddress) {
    throw new Error('Task escrow contract address not configured');
  }

  try {
    const publicClient = getPublicClient();
    const task = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: TASK_ESCROW_ABI,
      functionName: 'getTask',
      args: [BigInt(params.taskId)]
    });

    const statusNames = ['OPEN', 'CLAIMED', 'SUBMITTED', 'VERIFIED', 'COMPLETED', 'DISPUTED'];

    return {
      success: true,
      task: {
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
      }
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch task: ${error.message}`);
  }
}
