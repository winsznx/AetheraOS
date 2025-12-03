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
  chainIntelApiKey?: string;
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
      config.fetchWithPayment,
      config.chainIntelApiKey
    );
  }

  /**
   * Process user query end-to-end
   */
  async processQuery(userQuery: string): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
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

      return {
        success: false,
        query: userQuery,
        plan: null,
        executionResult: null,
        synthesis: null,
        report: `Error: ${error.message}`,
        conversation: [
          `**You:** ${userQuery}`,
          `**Agent:** I encountered an error: ${error.message}`
        ],
        metadata: {
          totalCost: 0,
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get plan without executing (for user approval)
   */
  async planQuery(userQuery: string): Promise<{
    plan: any;
    estimatedCost: string;
    estimatedTime: number;
  }> {
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
   * Execute a pre-approved plan
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
