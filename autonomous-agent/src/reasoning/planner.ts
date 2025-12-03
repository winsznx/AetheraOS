/**
 * Agent Reasoning & Planning Engine
 * Uses Claude to create optimal execution plans for user queries
 */

import Anthropic from '@anthropic-ai/sdk';

export interface MCPTool {
  mcp: string;
  tool: string;
  price: string;
  description: string;
}

export interface ExecutionStep {
  mcp: string;
  tool: string;
  params: any;
  reason: string;
  dependsOn?: number[]; // Step indices this depends on
}

export interface ExecutionPlan {
  intent: string;
  steps: ExecutionStep[];
  totalCost: string;
  reasoning: string;
  expectedOutcome: string;
}

const AVAILABLE_TOOLS: MCPTool[] = [
  // ChainIntel MCP
  {
    mcp: 'chainintel',
    tool: 'analyze-wallet',
    price: '0.01 ETH',
    description: 'Deep cross-chain wallet analysis with AI insights (Base + Solana)'
  },
  {
    mcp: 'chainintel',
    tool: 'detect-whales',
    price: '0.005 ETH',
    description: 'Identify whale wallets and track their movements'
  },
  {
    mcp: 'chainintel',
    tool: 'smart-money-tracker',
    price: '0.02 ETH',
    description: 'Track wallets with proven alpha'
  },
  {
    mcp: 'chainintel',
    tool: 'risk-score',
    price: '0.005 ETH',
    description: 'Calculate comprehensive risk score for wallet'
  },
  {
    mcp: 'chainintel',
    tool: 'trading-patterns',
    price: '0.01 ETH',
    description: 'Analyze trading patterns and identify strategies'
  },
  // TODO: Add sentiment-analyzer, prediction-market, task-orchestrator tools
];

/**
 * Analyze user intent and create execution plan
 */
export async function createExecutionPlan(
  userQuery: string,
  anthropicApiKey: string
): Promise<ExecutionPlan> {
  const anthropic = new Anthropic({ apiKey: anthropicApiKey });

  const prompt = `You are an AI agent orchestrator. Analyze this user query and create an optimal execution plan using available MCP tools.

User Query: "${userQuery}"

Available Tools:
${AVAILABLE_TOOLS.map(t => `- ${t.tool} (MCP: ${t.mcp}, Price: ${t.price}): ${t.description}`).join('\n')}

Create an execution plan that:
1. Identifies the user's intent
2. Selects the most relevant tools
3. Determines optimal execution order
4. Specifies dependencies between steps
5. Provides reasoning for each step

Respond in this exact JSON format (do NOT include markdown code blocks):
{
  "intent": "Brief description of what user wants",
  "steps": [
    {
      "mcp": "chainintel",
      "tool": "analyze-wallet",
      "params": {"address": "0x...", "chain": "base"},
      "reason": "Why this step is needed",
      "dependsOn": []
    }
  ],
  "totalCost": "0.01 ETH",
  "reasoning": "Overall reasoning for this plan",
  "expectedOutcome": "What the user will get"
}

CRITICAL RULES:
- The "tool" field must be EXACTLY the tool name (e.g., "analyze-wallet"), NOT prefixed with mcp name
- The "mcp" field must be the MCP name (e.g., "chainintel")
- Only use tools that are actually needed
- Optimize for cost (use cheaper tools when possible)
- Consider dependencies (some tools need results from others)
- Be specific with params based on the query
- Return ONLY valid JSON, no markdown formatting`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  const responseText = textContent ? (textContent as any).text : '{}';

  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText;

    // Remove markdown code blocks if present
    const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
      // Try to extract JSON object
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    }

    const plan = JSON.parse(jsonStr);

    // Clean up tool names: remove mcp prefix if Claude added it
    if (plan.steps) {
      plan.steps.forEach((step: ExecutionStep) => {
        if (step.tool && step.tool.includes('::')) {
          // Extract tool name after last ::
          const parts = step.tool.split('::');
          step.tool = parts[parts.length - 1];
        }
      });
    }

    return plan as ExecutionPlan;
  } catch (error) {
    throw new Error(`Failed to parse execution plan: ${error}`);
  }
}

/**
 * Validate execution plan
 */
export function validatePlan(plan: ExecutionPlan): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!plan.intent) errors.push('Missing intent');
  if (!plan.steps || plan.steps.length === 0) errors.push('No steps defined');
  if (!plan.totalCost) errors.push('Missing totalCost');
  if (!plan.reasoning) errors.push('Missing reasoning');

  // Validate each step
  plan.steps?.forEach((step, idx) => {
    if (!step.mcp) errors.push(`Step ${idx}: Missing mcp`);
    if (!step.tool) errors.push(`Step ${idx}: Missing tool`);
    if (!step.params) errors.push(`Step ${idx}: Missing params`);
    if (!step.reason) errors.push(`Step ${idx}: Missing reason`);

    // Check if tool exists
    const toolExists = AVAILABLE_TOOLS.some(
      t => t.mcp === step.mcp && t.tool === step.tool
    );
    if (!toolExists) {
      errors.push(`Step ${idx}: Unknown tool ${step.mcp}::${step.tool}`);
    }

    // Validate dependencies
    if (step.dependsOn) {
      step.dependsOn.forEach(depIdx => {
        if (depIdx >= idx) {
          errors.push(`Step ${idx}: Invalid dependency on step ${depIdx} (must depend on earlier steps)`);
        }
        if (depIdx < 0 || depIdx >= plan.steps.length) {
          errors.push(`Step ${idx}: Dependency index ${depIdx} out of range`);
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate total cost of plan
 */
export function calculatePlanCost(plan: ExecutionPlan): number {
  let total = 0;

  plan.steps.forEach(step => {
    const tool = AVAILABLE_TOOLS.find(
      t => t.mcp === step.mcp && t.tool === step.tool
    );

    if (tool) {
      // Extract numeric value from price string (e.g., "0.01 ETH" -> 0.01)
      const priceMatch = tool.price.match(/[\d.]+/);
      if (priceMatch) {
        total += parseFloat(priceMatch[0]);
      }
    }
  });

  return total;
}

/**
 * Get tool pricing
 */
export function getToolPricing(): MCPTool[] {
  return AVAILABLE_TOOLS;
}
