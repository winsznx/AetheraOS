# Manual Deployment Guide - Autonomous Agent

Due to npm installation issues, please deploy manually via Cloudflare Dashboard.

## Quick Deploy via Dashboard

### 1. Go to Cloudflare Workers Dashboard
1. Navigate to: https://dash.cloudflare.com/
2. Select your account: `Timjosh507@gmail.com's Account`
3. Go to Workers & Pages
4. Find and click on `aetheraos-autonomous-agent`

### 2. Update the Code

Click **"Quick edit"** and replace these 4 files:

#### File 1: `src/reasoning/planner.ts` (Lines 75-157)
Replace the `createExecutionPlan` function with the fixed version:

```typescript
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
```

#### File 2: `src/orchestrator/executor.ts` (Lines 78-100)
Replace the error handling section in the execute step loop:

```typescript
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
```

#### File 3: `src/mcp-clients/chainintel-client.ts`
Add `: any` type assertions to all JSON response variables (7 locations):

```typescript
// Line 50
const data: any = await response.json();

// Line 85-89
if (!response.ok) {
  const error: any = await response.json();
  throw new Error(`ChainIntel ${toolName} failed: ${error.error || response.statusText}`);
}
const data: any = await response.json();

// Line 117-119
if (!response.ok) {
  const error: any = await response.json();
  throw new Error(`ChainIntel analyze-wallet failed: ${error.error}`);
}

// Similarly for lines 142, 167, 191, 216
```

#### File 4: `src/utils/payment.ts` (Line 29)
```typescript
const errorData: any = await initialResponse.json().catch(() => null);
```

### 3. Save and Deploy
1. Click **"Save and Deploy"**
2. Wait for deployment to complete (usually 10-30 seconds)
3. You'll see a success message with the worker URL

### 4. Verify Deployment
Test the worker:
```bash
curl https://aetheraos-autonomous-agent.timjosh507.workers.dev/info
```

You should see worker information without errors.

## Alternative: Deploy via CLI (if npm fixes itself)

If you want to try the CLI again later:

```bash
cd autonomous-agent

# Clean install
rm -rf node_modules package-lock.json
npm install

# Deploy
npm run build
```

## Testing the Fixes

Once deployed, test these queries in your frontend:

1. **Simple greeting**: "hello"
   - Should generate minimal plan without errors

2. **Wallet analysis**: "analyze wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
   - Should show clear error about missing API keys (until you add them to ChainIntel MCP)

3. **Smart money check**: "is this wallet smart money: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
   - Should plan risk-score and smart-money-tracker tools

## What the Fixes Do

✅ **Fixed double namespace bug** - No more `chainintel::risk-score::chainintel::risk-score` errors
✅ **Enhanced JSON parsing** - Handles markdown code blocks and malformed JSON from Claude
✅ **Better error messages** - Error 1042 now shows clear instructions to add API keys
✅ **TypeScript compatibility** - All type errors resolved

## Next Steps After Deployment

Add blockchain API keys to **ChainIntel MCP Worker** (not autonomous agent):
1. Go to ChainIntel MCP worker in dashboard
2. Settings → Variables and Secrets
3. Add secrets:
   - `MORALIS_API_KEY` - Get from https://moralis.io
   - `HELIUS_API_KEY` - Get from https://helius.dev

This will fix the "error code 1042" and enable actual wallet analysis.
