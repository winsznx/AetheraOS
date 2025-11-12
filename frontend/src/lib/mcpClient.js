/**
 * MCP (Model Context Protocol) Client Integration
 * Utilities for interacting with NullShot MCP servers
 *
 * Based on official MCP specification and NullShot framework documentation
 * @see https://modelcontextprotocol.io - MCP Specification
 * @see https://docs.nullshot.com - NullShot Framework
 */

/**
 * MCP Client for calling agent tools via MCP protocol
 */
export class MCPClient {
  constructor(serverUrl, authConfig = {}) {
    this.serverUrl = serverUrl;
    this.authConfig = authConfig;
    this.requestId = 0;
  }

  /**
   * Call a tool on the MCP server
   * @param {string} toolName - Name of the tool to call
   * @param {Object} args - Tool arguments
   * @returns {Promise<Object>} Tool execution result
   */
  async callTool(toolName, args = {}) {
    this.requestId++;

    const request = {
      jsonrpc: '2.0',
      id: this.requestId,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    const response = await this.makeRequest('/mcp', request);

    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    return response.result;
  }

  /**
   * List available tools from MCP server
   * @returns {Promise<Array>} List of available tools
   */
  async listTools() {
    this.requestId++;

    const request = {
      jsonrpc: '2.0',
      id: this.requestId,
      method: 'tools/list'
    };

    const response = await this.makeRequest('/mcp', request);

    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    return response.result.tools || [];
  }

  /**
   * Get a resource from the MCP server
   * @param {string} resourceUri - Resource URI
   * @returns {Promise<Object>} Resource data
   */
  async getResource(resourceUri) {
    this.requestId++;

    const request = {
      jsonrpc: '2.0',
      id: this.requestId,
      method: 'resources/read',
      params: {
        uri: resourceUri
      }
    };

    const response = await this.makeRequest('/mcp', request);

    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    return response.result;
  }

  /**
   * List available resources
   * @returns {Promise<Array>} List of available resources
   */
  async listResources() {
    this.requestId++;

    const request = {
      jsonrpc: '2.0',
      id: this.requestId,
      method: 'resources/list'
    };

    const response = await this.makeRequest('/mcp', request);

    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    return response.result.resources || [];
  }

  /**
   * Get a prompt from the MCP server
   * @param {string} promptName - Prompt name
   * @param {Object} args - Prompt arguments
   * @returns {Promise<Object>} Prompt data
   */
  async getPrompt(promptName, args = {}) {
    this.requestId++;

    const request = {
      jsonrpc: '2.0',
      id: this.requestId,
      method: 'prompts/get',
      params: {
        name: promptName,
        arguments: args
      }
    };

    const response = await this.makeRequest('/mcp', request);

    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    return response.result;
  }

  /**
   * List available prompts
   * @returns {Promise<Array>} List of available prompts
   */
  async listPrompts() {
    this.requestId++;

    const request = {
      jsonrpc: '2.0',
      id: this.requestId,
      method: 'prompts/list'
    };

    const response = await this.makeRequest('/mcp', request);

    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    return response.result.prompts || [];
  }

  /**
   * Make HTTP request to MCP server
   * @private
   */
  async makeRequest(endpoint, body) {
    const url = `${this.serverUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json'
    };

    // Add authentication if provided
    if (this.authConfig.apiKey) {
      headers['X-Api-Key'] = this.authConfig.apiKey;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Create an MCP client for an agent
 * @param {string} serverUrl - MCP server URL
 * @param {Object} [authConfig] - Authentication configuration
 * @returns {MCPClient}
 */
export function createMCPClient(serverUrl, authConfig = {}) {
  return new MCPClient(serverUrl, authConfig);
}

/**
 * SSE-based MCP client for streaming responses
 */
export class MCPSSEClient extends MCPClient {
  constructor(serverUrl, authConfig = {}) {
    super(serverUrl, authConfig);
    this.eventSource = null;
  }

  /**
   * Connect to MCP server via SSE
   * @returns {Promise<void>}
   */
  async connectSSE() {
    let url = `${this.serverUrl}/sse`;

    if (this.authConfig.apiKey) {
      url += `?api-key=${encodeURIComponent(this.authConfig.apiKey)}`;
    }

    return new Promise((resolve, reject) => {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('MCP SSE connected');
        resolve();
      };

      this.eventSource.onerror = (error) => {
        console.error('MCP SSE error:', error);
        reject(error);
      };
    });
  }

  /**
   * Listen for MCP server events
   * @param {Function} handler - Event handler
   */
  onEvent(handler) {
    if (!this.eventSource) {
      throw new Error('SSE not connected. Call connectSSE() first.');
    }

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handler(data);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };
  }

  /**
   * Disconnect SSE
   */
  disconnectSSE() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

/**
 * Create an SSE-based MCP client
 * @param {string} serverUrl - MCP server URL
 * @param {Object} [authConfig] - Authentication configuration
 * @returns {MCPSSEClient}
 */
export function createMCPSSEClient(serverUrl, authConfig = {}) {
  return new MCPSSEClient(serverUrl, authConfig);
}

/**
 * Helper: Call MCP tool with retry logic
 * @param {MCPClient} client - MCP client instance
 * @param {string} toolName - Tool name
 * @param {Object} args - Tool arguments
 * @param {number} [maxRetries=3] - Maximum retry attempts
 * @returns {Promise<Object>} Tool result
 */
export async function callToolWithRetry(client, toolName, args, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.callTool(toolName, args);
    } catch (error) {
      console.warn(`MCP tool call attempt ${attempt}/${maxRetries} failed:`, error);
      lastError = error;

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Helper: Validate MCP tool schema
 * @param {Object} tool - Tool definition from MCP server
 * @returns {boolean} Whether tool schema is valid
 */
export function validateToolSchema(tool) {
  if (!tool || typeof tool !== 'object') return false;
  if (!tool.name || typeof tool.name !== 'string') return false;
  if (!tool.description || typeof tool.description !== 'string') return false;
  if (!tool.inputSchema || typeof tool.inputSchema !== 'object') return false;

  return true;
}

/**
 * Helper: Format tool call for display
 * @param {string} toolName - Tool name
 * @param {Object} args - Tool arguments
 * @param {Object} result - Tool result
 * @returns {Object} Formatted tool call
 */
export function formatToolCall(toolName, args, result) {
  return {
    tool: toolName,
    arguments: args,
    result: result,
    timestamp: new Date().toISOString()
  };
}
