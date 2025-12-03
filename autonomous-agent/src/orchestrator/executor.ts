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
    // Execute steps in order, respecting dependencies
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];

      // Wait for dependencies
      if (step.dependsOn && step.dependsOn.length > 0) {
        const allDepsComplete = step.dependsOn.every(depIdx =>
          context.results.has(depIdx)
        );

        if (!allDepsComplete) {
          throw new Error(`Step ${i}: Dependencies not satisfied`);
        }

        // Enrich params with dependency results
        step.params = enrichParams(step.params, step.dependsOn, context.results);
      }

      // Execute step
      try {
        const result = await executeStep(step, context);
        context.results.set(i, result);
        results.push({
          step: i,
          mcp: step.mcp,
          tool: step.tool,
          result,
          success: true
        });

        // Track cost (extract from result if available)
        if (result.cost) {
          totalCost += parseFloat(result.cost);
        }
      } catch (error: any) {
        // Clean error message
        let errorMsg = error.message;

        // Handle common MCP error patterns
        if (errorMsg.includes('error code: 1042')) {
          errorMsg = 'ChainIntel MCP configuration error: Missing required API keys (MORALIS_API_KEY or HELIUS_API_KEY). Please add these secrets to the ChainIntel Worker.';
        } else if (errorMsg.includes('Unexpected token')) {
          errorMsg = `MCP returned invalid response: ${errorMsg}`;
        }

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
  switch (tool) {
    case 'analyze-wallet':
      return await ChainIntel.analyzeWallet(client, params);

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
