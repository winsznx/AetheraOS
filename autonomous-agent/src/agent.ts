/**
 * Autonomous Agent - Main orchestration logic
 * Plans, executes, and synthesizes across multiple MCPs
 */

import { createExecutionPlan, validatePlan } from './reasoning/planner';
import { executePlan, estimateExecutionTime } from './orchestrator/executor';
import { synthesizeResults, generateReport, generateConversation } from './reasoning/synthesizer';
import { createChainIntelClient } from './mcp-clients/chainintel-client';
import type { ChainIntelClient } from './mcp-clients/chainintel-client';

export interface AgentConfig {
  anthropicApiKey: string;
  chainIntelUrl: string;
  fetchWithPayment: typeof fetch;
}

export interface PaymentProof {
  transactionHash: string;
  amount: string;
  chain: string;
  from: string;
}

export interface AgentResponse {
  success: boolean;
  query: string;
  plan: any;
  executionResult: any;
  synthesis: any;
  report: string;
  conversation: string[];
  metadata: {
    totalCost: number;
    executionTime: number;
    timestamp: string;
  };
}

/**
 * Autonomous Agent Class
 */
export class AutonomousAgent {
  private config: AgentConfig;
  private chainIntelClient: ChainIntelClient;

  constructor(config: AgentConfig) {
    this.config = config;
    this.chainIntelClient = createChainIntelClient(
      config.chainIntelUrl,
      config.fetchWithPayment
    );
  }

  /**
   * Check if query needs blockchain tools or can be answered directly
   */
  private needsBlockchainTools(query: string): boolean {
    const lowerQuery = query.toLowerCase().trim();

    // Short conversational queries should be answered for free
    if (query.length < 30) {
      const conversationalPatterns = [
        /^(hi|hello|hey|greetings)/i,
        /^(why|how|what|when|where)\s+(is|are|do|does|can|should)/i,
        /^(yes|no|ok|okay|thanks|thank you)/i,
        /^(tell me|show me|explain)/i
      ];

      // If it's a short conversational query without specific blockchain terms, answer free
      if (conversationalPatterns.some(pattern => pattern.test(query))) {
        return false;
      }
    }

    // Keywords that indicate blockchain/wallet analysis needed
    const blockchainKeywords = [
      'wallet', 'address', 'transaction', 'whale', 'smart money',
      'trading', 'portfolio', 'token', 'nft', 'crypto asset',
      'risk score', 'analyze 0x', 'track 0x', 'check 0x',
      'base', 'ethereum', 'solana', 'blockchain'
    ];

    // Check if query contains blockchain keywords AND a wallet address
    const hasWalletAddress = /0x[a-fA-F0-9]{40}/.test(query);
    const hasBlockchainKeyword = blockchainKeywords.some(keyword => lowerQuery.includes(keyword));

    return hasWalletAddress || hasBlockchainKeyword;
  }

  /**
   * Answer general questions directly without blockchain tools
   */
  private async answerDirectly(query: string): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const anthropic = new Anthropic({ apiKey: this.config.anthropicApiKey });

      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: query
        }]
      });

      const textContent = message.content.find(block => block.type === 'text');
      const answer = textContent ? (textContent as any).text : 'I apologize, but I could not generate a response.';

      const totalTime = Date.now() - startTime;

      return {
        success: true,
        query,
        plan: null,
        executionResult: null,
        synthesis: null,
        report: answer,
        conversation: [
          `**You:** ${query}`,
          `**Agent:** ${answer}`
        ],
        metadata: {
          totalCost: 0,
          executionTime: totalTime,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      return this.createErrorResponse(query, error.message, Date.now() - startTime);
    }
  }

  /**
   * Create error response
   */
  private createErrorResponse(query: string, error: string, executionTime: number): AgentResponse {
    return {
      success: false,
      query,
      plan: null,
      executionResult: null,
      synthesis: null,
      report: `Error: ${error}`,
      conversation: [
        `**You:** ${query}`,
        `**Agent:** I encountered an error: ${error}`
      ],
      metadata: {
        totalCost: 0,
        executionTime,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Process user query end-to-end
   */
  async processQuery(userQuery: string): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      // ROUTING: Check if query needs blockchain tools
      if (!this.needsBlockchainTools(userQuery)) {
        console.log('[Agent] Query does not need blockchain tools, answering directly...');
        return await this.answerDirectly(userQuery);
      }

      // 1. PLANNING PHASE: Understand intent and create execution plan
      console.log('[Agent] Analyzing query and creating plan...');
      const plan = await createExecutionPlan(
        userQuery,
        this.config.anthropicApiKey
      );

      // Validate plan
      const validation = validatePlan(plan);
      if (!validation.valid) {
        throw new Error(`Invalid plan: ${validation.errors.join(', ')}`);
      }

      console.log(`[Agent] Plan created: ${plan.steps.length} steps, estimated cost: ${plan.totalCost}`);
      console.log(`[Agent] Estimated time: ${estimateExecutionTime(plan)}s`);

      // 2. EXECUTION PHASE: Execute plan with payments
      console.log('[Agent] Executing plan...');
      const executionResult = await executePlan(plan, this.chainIntelClient);

      if (!executionResult.success) {
        console.log(`[Agent] Execution failed:`, executionResult.errors);
        throw new Error(`Execution failed: ${executionResult.errors?.join(', ')}`);
      }

      console.log(`[Agent] Execution completed in ${executionResult.executionTime}ms`);

      // 3. SYNTHESIS PHASE: Synthesize results into recommendation
      console.log('[Agent] Synthesizing results...');
      const synthesis = await synthesizeResults(
        userQuery,
        executionResult,
        this.config.anthropicApiKey
      );

      console.log(`[Agent] Synthesis complete. Recommendation: ${synthesis.recommendation}`);

      // 4. GENERATE OUTPUTS
      const report = generateReport(userQuery, executionResult, synthesis);
      const conversation = generateConversation(userQuery, plan, executionResult, synthesis);

      const totalTime = Date.now() - startTime;

      return {
        success: true,
        query: userQuery,
        plan,
        executionResult,
        synthesis,
        report,
        conversation,
        metadata: {
          totalCost: executionResult.totalCost,
          executionTime: totalTime,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('[Agent] Error:', error);
      return this.createErrorResponse(userQuery, error.message, Date.now() - startTime);
    }
  }

  /**
   * Get plan without executing (for user approval)
   */
  async planQuery(userQuery: string): Promise<{
    plan: any;
    estimatedCost: string;
    estimatedTime: number;
    isFreeQuery?: boolean;
    freeResponse?: string;
  }> {
    // Check if query needs blockchain tools
    if (!this.needsBlockchainTools(userQuery)) {
      // For free conversational queries, return a flag indicating no payment needed
      const response = await this.answerDirectly(userQuery);

      return {
        plan: null,
        estimatedCost: '0 ETH',
        estimatedTime: 0,
        isFreeQuery: true,
        freeResponse: response.report
      };
    }

    const plan = await createExecutionPlan(
      userQuery,
      this.config.anthropicApiKey
    );

    const validation = validatePlan(plan);
    if (!validation.valid) {
      throw new Error(`Invalid plan: ${validation.errors.join(', ')}`);
    }

    return {
      plan,
      estimatedCost: plan.totalCost,
      estimatedTime: estimateExecutionTime(plan)
    };
  }

  /**
   * Create fetch with user payment proof
   */
  private createFetchWithUserPayment(paymentProof: PaymentProof): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const headers = {
        ...init?.headers,
        'x-payment': JSON.stringify(paymentProof),
        'X-Payment-TxHash': paymentProof.transactionHash,
        'X-Payment-Amount': paymentProof.amount,
        'X-Payment-Chain': paymentProof.chain,
        'X-Payment-From': paymentProof.from
      };

      return fetch(input, {
        ...init,
        headers
      });
    };
  }

  /**
   * Execute a pre-approved plan with user payment proof
   */
  async executePlanWithPayment(plan: any, paymentProof: PaymentProof): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      // Create temporary client with user's payment proof
      const clientWithPayment = createChainIntelClient(
        this.config.chainIntelUrl,
        this.createFetchWithUserPayment(paymentProof)
      );

      const executionResult = await executePlan(plan, clientWithPayment);

      if (!executionResult.success) {
        throw new Error(`Execution failed: ${executionResult.errors?.join(', ')}`);
      }

      const synthesis = await synthesizeResults(
        plan.intent || 'User query',
        executionResult,
        this.config.anthropicApiKey
      );

      const report = generateReport(plan.intent, executionResult, synthesis);
      const conversation = generateConversation(plan.intent, plan, executionResult, synthesis);

      const totalTime = Date.now() - startTime;

      return {
        success: true,
        query: plan.intent,
        plan,
        executionResult,
        synthesis,
        report,
        conversation,
        metadata: {
          totalCost: executionResult.totalCost,
          executionTime: totalTime,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('[Agent] Execution error:', error);
      return this.createErrorResponse(plan.intent, error.message, Date.now() - startTime);
    }
  }

  /**
   * Execute a pre-approved plan (without payment proof - uses agent wallet)
   */
  async executePlan(plan: any): Promise<AgentResponse> {
    // Use the existing processQuery logic but skip planning
    const startTime = Date.now();

    try {
      const executionResult = await executePlan(plan, this.chainIntelClient);

      if (!executionResult.success) {
        throw new Error(`Execution failed: ${executionResult.errors?.join(', ')}`);
      }

      const synthesis = await synthesizeResults(
        'Pre-approved plan',
        executionResult,
        this.config.anthropicApiKey
      );

      const report = generateReport('Pre-approved plan', executionResult, synthesis);
      const conversation = generateConversation('Pre-approved plan', plan, executionResult, synthesis);

      return {
        success: true,
        query: 'Pre-approved plan',
        plan,
        executionResult,
        synthesis,
        report,
        conversation,
        metadata: {
          totalCost: executionResult.totalCost,
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      return {
        success: false,
        query: 'Pre-approved plan',
        plan,
        executionResult: null,
        synthesis: null,
        report: `Error: ${error.message}`,
        conversation: [`**Agent:** Error executing plan: ${error.message}`],
        metadata: {
          totalCost: 0,
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}
