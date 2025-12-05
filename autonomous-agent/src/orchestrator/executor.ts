/**
 * Execution Orchestrator
 * Executes plans, manages payments, and handles cross-MCP communication
 */

import type { ExecutionPlan, ExecutionStep } from '../reasoning/planner';
import type { ChainIntelClient } from '../mcp-clients/chainintel-client';
import * as ChainIntel from '../mcp-clients/chainintel-client';

export interface ExecutionContext {
  chainIntelClient: ChainIntelClient;
  results: Map<number, any>; // Step index -> result
  startTime: number;
}

export interface ExecutionResult {
  success: boolean;
  plan: ExecutionPlan;
  results: any[];
  totalCost: number;
  executionTime: number;
  errors?: string[];
}

/**
 * Tool pricing (in ETH)
 */
const TOOL_PRICES: Record<string, number> = {
  'analyze-wallet': 0.0001,
  'detect-whales': 0.0001,
  'smart-money-tracker': 0.0001,
  'risk-score': 0.0001,
  'trading-patterns': 0.0001
};

/**
 * Get cost for a specific tool
 */
function getToolCost(toolName: string): number {
  return TOOL_PRICES[toolName] || 0.0001; // Default to 0.0001 ETH if not found
}

/**
 * Execute a plan with payment handling
 */
export async function executePlan(
  plan: ExecutionPlan,
  chainIntelClient: ChainIntelClient
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const context: ExecutionContext = {
    chainIntelClient,
    results: new Map(),
    startTime
  };

  const results: any[] = [];
  const errors: string[] = [];
  let totalCost = 0;

  try {
    console.log('[Executor] Starting execution of', plan.steps.length, 'steps');

    // Execute steps in order, respecting dependencies
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];

      console.log(`[Executor] Executing step ${i}:`, step.mcp, '::', step.tool);

      // Wait for dependencies
      if (step.dependsOn && step.dependsOn.length > 0) {
        const missingDeps = step.dependsOn.filter(depIdx => !context.results.has(depIdx));

        if (missingDeps.length > 0) {
          const errorMsg = `Step ${i} (${step.tool}): Dependencies not satisfied. Missing results from steps: ${missingDeps.join(', ')}. Completed steps: ${Array.from(context.results.keys()).join(', ') || 'none'}`;
          console.error('[Executor]', errorMsg);
          throw new Error(errorMsg);
        }

        // Enrich params with dependency results
        step.params = enrichParams(step.params, step.dependsOn, context.results);
      }

      // Execute step
      try {
        console.log(`[Executor] Calling executeStep for step ${i}...`);
        const result = await executeStep(step, context);
        console.log(`[Executor] Step ${i} completed successfully`);
        context.results.set(i, result);

        // Calculate cost based on tool pricing
        const stepCost = getToolCost(step.tool);
        totalCost += stepCost;
        console.log(`[Executor] Step ${i} cost: ${stepCost} ETH, Total: ${totalCost} ETH`);

        results.push({
          step: i,
          mcp: step.mcp,
          tool: step.tool,
          result,
          success: true,
          cost: stepCost
        });
      } catch (error: any) {
        // Use the actual error message without masking
        const errorMsg = error.message;

        errors.push(`Step ${i} (${step.mcp}::${step.tool}): ${errorMsg}`);
        results.push({
          step: i,
          mcp: step.mcp,
          tool: step.tool,
          error: errorMsg,
          success: false
        });

        // Fail fast - if a step fails, stop execution
        break;
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      success: errors.length === 0,
      plan,
      results,
      totalCost,
      executionTime,
      ...(errors.length > 0 && { errors })
    };
  } catch (error: any) {
    return {
      success: false,
      plan,
      results,
      totalCost,
      executionTime: Date.now() - startTime,
      errors: [error.message]
    };
  }
}

/**
 * Execute a single step
 */
async function executeStep(
  step: ExecutionStep,
  context: ExecutionContext
): Promise<any> {
  const { mcp, tool, params } = step;

  // Route to appropriate MCP client
  if (mcp === 'chainintel') {
    return await executeChainIntelTool(tool, params, context.chainIntelClient);
  }

  // TODO: Add other MCPs (sentiment-analyzer, prediction-market, task-orchestrator)

  throw new Error(`Unknown MCP: ${mcp}`);
}

/**
 * Execute ChainIntel tool
 */
async function executeChainIntelTool(
  tool: string,
  params: any,
  client: ChainIntelClient
): Promise<any> {
  console.log('[Executor] Calling ChainIntel tool:', tool, 'with params:', JSON.stringify(params));

  switch (tool) {
    case 'analyze-wallet':
      console.log('[Executor] Calling ChainIntel.analyzeWallet...');
      const result = await ChainIntel.analyzeWallet(client, params);
      console.log('[Executor] ChainIntel.analyzeWallet returned:', typeof result);
      return result;

    case 'detect-whales':
      return await ChainIntel.detectWhales(client, params);

    case 'smart-money-tracker':
      return await ChainIntel.trackSmartMoney(client, params);

    case 'risk-score':
      return await ChainIntel.getRiskScore(client, params);

    case 'trading-patterns':
      return await ChainIntel.getTradingPatterns(client, params);

    default:
      throw new Error(`Unknown ChainIntel tool: ${tool}`);
  }
}

/**
 * Enrich params with results from dependencies
 */
function enrichParams(
  params: any,
  dependencies: number[],
  results: Map<number, any>
): any {
  const enriched = { ...params };

  // Add previous results to params
  enriched._previousResults = dependencies.map(depIdx => ({
    step: depIdx,
    result: results.get(depIdx)
  }));

  // Auto-populate common fields from the first dependency if not already set
  if (dependencies.length > 0) {
    const firstDep = results.get(dependencies[0]);

    if (firstDep) {
      // The MCP response structure is: {success: true, result: {...}, tool: "...", ...}
      // The actual data is in the 'result' field
      const actualResult = firstDep.result || firstDep;

      // Extract wallet info from the result
      const walletInfo = actualResult.wallet;

      if (walletInfo) {
        // Populate address if missing
        if (!enriched.address && walletInfo.address) {
          enriched.address = walletInfo.address;
          console.log('[Executor] Auto-populated address from dependency:', walletInfo.address);
        }

        // Populate chain if missing - try both 'chain' and 'primaryChain'
        const chain = walletInfo.chain || walletInfo.primaryChain;
        if (!enriched.chain && chain) {
          enriched.chain = chain;
          console.log('[Executor] Auto-populated chain from dependency:', chain);
        }
      }
    }
  }

  return enriched;
}

/**
 * Estimate execution time based on plan
 */
export function estimateExecutionTime(plan: ExecutionPlan): number {
  // Base time per step (seconds)
  const baseTimePerStep = 3;

  // Additional time for dependencies (parallel execution)
  const maxDepth = calculatePlanDepth(plan);

  // Estimate: base time * max depth (steps in sequence)
  return baseTimePerStep * maxDepth;
}

/**
 * Calculate maximum depth of plan (longest dependency chain)
 */
function calculatePlanDepth(plan: ExecutionPlan): number {
  const depths = new Map<number, number>();

  plan.steps.forEach((step, idx) => {
    if (!step.dependsOn || step.dependsOn.length === 0) {
      depths.set(idx, 1);
    } else {
      const maxDepDepth = Math.max(
        ...step.dependsOn.map(depIdx => depths.get(depIdx) || 1)
      );
      depths.set(idx, maxDepDepth + 1);
    }
  });

  return Math.max(...Array.from(depths.values()));
}
