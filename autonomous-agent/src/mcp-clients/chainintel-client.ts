/**
 * ChainIntel MCP Client
 * Handles communication with ChainIntel MCP including payment
 * Supports ALL 27 tools dynamically via MCP protocol
 */

export interface ChainIntelClient {
  baseUrl: string;
  fetch: typeof fetch;
  apiKey?: string;
  binding?: Fetcher; // Service binding for direct worker-to-worker communication
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export function createChainIntelClient(
  baseUrl: string,
  fetchWithPayment: typeof fetch,
  apiKey?: string,
  binding?: Fetcher
): ChainIntelClient {
  return {
    baseUrl,
    fetch: fetchWithPayment,
    apiKey,
    binding
  };
}

/**
 * List all available tools from ChainIntel MCP
 */
export async function listTools(client: ChainIntelClient): Promise<MCPTool[]> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (client.apiKey) {
    headers['x-api-key'] = client.apiKey;
  }

  const response = await client.fetch(`${client.baseUrl}/mcp`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to list tools: ${response.statusText}`);
  }

  const data: any = await response.json();
  return data.result?.tools || [];
}

/**
 * Call any ChainIntel MCP tool dynamically with payment
 * @param client - ChainIntel client
 * @param toolName - Name of the tool to call (e.g., 'analyze_wallet', 'find_arbitrage')
 * @param params - Tool parameters as object
 */
export async function callTool(
  client: ChainIntelClient,
  toolName: string,
  params: any
): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (client.apiKey) {
    headers['x-api-key'] = client.apiKey;
  }

  const response = await client.fetch(`${client.baseUrl}/mcp`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: params
      },
      id: Date.now()
    })
  });

  if (!response.ok) {
    const error: any = await response.json();
    throw new Error(`ChainIntel ${toolName} failed: ${error.error || response.statusText}`);
  }

  const data: any = await response.json();
  return data.result;
}

// ============================================================================
// CONVENIENCE FUNCTIONS (Legacy - prefer using callTool() directly)
// These are kept for backward compatibility
// ============================================================================

/**
 * Analyze wallet with payment
 * @deprecated Use callTool(client, 'analyze_wallet', params) instead
 */
export async function analyzeWallet(
  client: ChainIntelClient,
  params: {
    address: string;
    chain: 'base' | 'ethereum' | 'solana';
    depth?: 'quick' | 'standard' | 'deep';
    includeCrossChain?: boolean;
  }
) {
  // Use service binding if available, otherwise fall back to HTTP
  if (client.binding) {
    console.log('[ChainIntelClient] Using service binding to call analyze-wallet');
    console.log('[ChainIntelClient] Params:', JSON.stringify(params));

    const response = await client.binding.fetch('http://chainintel-mcp/analyze-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    console.log('[ChainIntelClient] Service binding response:', response.status, response.statusText);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMsg = `HTTP ${response.status} ${response.statusText}`;

      try {
        if (contentType?.includes('application/json')) {
          const error: any = await response.json();
          errorMsg = error.error || error.message || errorMsg;
        } else {
          const text = await response.text();
          errorMsg = `${errorMsg} - ${text.substring(0, 200)}`;
        }
      } catch (e) {
        errorMsg = `${errorMsg} - Failed to parse error response`;
      }

      throw new Error(`ChainIntel analyze-wallet failed: ${errorMsg}. Params sent: ${JSON.stringify(params)}`);
    }

    return await response.json();
  }

  // Fallback to HTTP (legacy)
  const url = `${client.baseUrl}/analyze-wallet`;
  console.log('[ChainIntelClient] Using HTTP to call analyze-wallet:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  console.log('[ChainIntelClient] Response status:', response.status, response.statusText);

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMsg = `HTTP ${response.status} ${response.statusText}`;

    try {
      if (contentType?.includes('application/json')) {
        const error: any = await response.json();
        errorMsg = error.error || error.message || errorMsg;
      } else {
        // Not JSON - probably HTML error page
        const text = await response.text();
        errorMsg = `${errorMsg} - ${text.substring(0, 200)}`;
      }
    } catch (e) {
      errorMsg = `${errorMsg} - Failed to parse error response`;
    }

    throw new Error(`ChainIntel analyze-wallet failed: ${errorMsg}`);
  }

  return await response.json();
}

/**
 * Detect whales with payment
 */
export async function detectWhales(
  client: ChainIntelClient,
  params: {
    chain: 'base' | 'ethereum' | 'solana';
    minPortfolioValue?: number;
    addresses?: string[];
  }
) {
  // Use service binding if available
  if (client.binding) {
    console.log('[ChainIntelClient] Using service binding to call detect-whales');
    const response = await client.binding.fetch('http://chainintel-mcp/detect-whales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(`ChainIntel detect-whales failed: ${error.error || error.message}`);
    }

    return await response.json();
  }

  // Fallback to HTTP
  const response = await client.fetch(`${client.baseUrl}/detect-whales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const error: any = await response.json();
    throw new Error(`ChainIntel detect-whales failed: ${error.error}`);
  }

  return await response.json();
}

/**
 * Track smart money with payment
 */
export async function trackSmartMoney(
  client: ChainIntelClient,
  params: {
    address: string;
    chain: 'base' | 'ethereum' | 'solana';
  }
) {
  // Use service binding if available
  if (client.binding) {
    console.log('[ChainIntelClient] Using service binding to call smart-money-tracker');
    const response = await client.binding.fetch('http://chainintel-mcp/smart-money-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(`ChainIntel smart-money-tracker failed: ${error.error || error.message}`);
    }

    return await response.json();
  }

  // Fallback to HTTP
  const response = await client.fetch(`${client.baseUrl}/smart-money-tracker`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const error: any = await response.json();
    throw new Error(`ChainIntel smart-money-tracker failed: ${error.error}`);
  }

  return await response.json();
}

/**
 * Calculate risk score with payment
 */
export async function getRiskScore(
  client: ChainIntelClient,
  params: {
    address: string;
    chain: 'base' | 'ethereum' | 'solana';
  }
) {
  // Use service binding if available
  if (client.binding) {
    console.log('[ChainIntelClient] Using service binding to call risk-score');
    const response = await client.binding.fetch('http://chainintel-mcp/risk-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(`ChainIntel risk-score failed: ${error.error || error.message}`);
    }

    return await response.json();
  }

  // Fallback to HTTP
  const response = await client.fetch(`${client.baseUrl}/risk-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const error: any = await response.json();
    throw new Error(`ChainIntel risk-score failed: ${error.error}`);
  }

  return await response.json();
}

/**
 * Analyze trading patterns with payment
 */
export async function getTradingPatterns(
  client: ChainIntelClient,
  params: {
    address: string;
    chain: 'base' | 'ethereum' | 'solana';
    minTrades?: number;
  }
) {
  // Use service binding if available
  if (client.binding) {
    console.log('[ChainIntelClient] Using service binding to call trading-patterns');
    const response = await client.binding.fetch('http://chainintel-mcp/trading-patterns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(`ChainIntel trading-patterns failed: ${error.error || error.message}`);
    }

    return await response.json();
  }

  // Fallback to HTTP
  const response = await client.fetch(`${client.baseUrl}/trading-patterns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const error: any = await response.json();
    throw new Error(`ChainIntel trading-patterns failed: ${error.error}`);
  }

  return await response.json();
}

/**
 * Get pricing information
 */
export async function getPricing(client: ChainIntelClient) {
  const response = await fetch(`${client.baseUrl}/pricing`);
  return await response.json();
}
