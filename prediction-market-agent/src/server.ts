/**
 * Prediction Market MCP Server Implementation
 *
 * Extends the MCP Hono Server DO to provide prediction market tools
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Implementation } from '@modelcontextprotocol/sdk/types.js';
import { DurableObject } from 'cloudflare:workers';
import { Hono } from 'hono';
import { setupPredictionMarketTools } from './tools.js';
import type { Env } from './types.js';

export class PredictionMarketMcpServer extends DurableObject {
  private app: Hono;
  private mcpServer: McpServer;
  private registeredTools: Map<string, any>;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    // Initialize tools registry
    this.registeredTools = new Map();

    // Initialize Hono app
    this.app = new Hono();

    // Initialize MCP Server
    const serverInfo: Implementation = {
      name: 'prediction-market-agent',
      version: '1.0.0'
    };

    this.mcpServer = new McpServer(serverInfo);

    // Configure MCP tools
    this.configureServer(this.mcpServer);

    // Setup routes
    this.setupRoutes();
  }

  /**
   * Configure MCP Server with tools, resources, and prompts
   */
  private configureServer(server: McpServer): void {
    // Setup prediction market tools and store references
    setupPredictionMarketTools(server, this.registeredTools);
  }

  /**
   * Setup HTTP routes for MCP protocol
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/', (c) => c.json({
      name: 'Prediction Market Agent',
      version: '1.0.0',
      status: 'healthy'
    }));

    // MCP endpoint (JSON-RPC over HTTP)
    this.app.post('/mcp', async (c) => {
      const request = await c.req.json();

      // Handle MCP JSON-RPC request
      const response = await this.handleMcpRequest(request);

      return c.json(response);
    });

    // SSE endpoint for streaming
    this.app.get('/sse', (c) => {
      // TODO: Implement SSE for streaming responses
      return c.text('SSE endpoint - coming soon', 501);
    });

    // WebSocket endpoint
    this.app.get('/ws', (c) => {
      // TODO: Implement WebSocket for real-time updates
      return c.text('WebSocket endpoint - coming soon', 501);
    });
  }

  /**
   * Handle MCP JSON-RPC request
   */
  private async handleMcpRequest(request: any): Promise<any> {
    const { method, params, id } = request;

    try {
      switch (method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '1.0.0',
              serverInfo: {
                name: 'prediction-market-agent',
                version: '1.0.0'
              },
              capabilities: {
                tools: {}
              }
            }
          };

        case 'tools/list':
          // Build tools list from registered tools
          const tools = Array.from(this.registeredTools.values()).map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
          }));

          return {
            jsonrpc: '2.0',
            id,
            result: { tools }
          };

        case 'tools/call':
          const toolName = params.name;
          const tool = this.registeredTools.get(toolName);

          if (!tool) {
            return {
              jsonrpc: '2.0',
              id,
              error: {
                code: -32602,
                message: `Tool not found: ${toolName}`
              }
            };
          }

          // Call the tool's callback with arguments
          const toolResult = await tool.callback(params.arguments || {});

          return {
            jsonrpc: '2.0',
            id,
            result: toolResult
          };

        default:
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`
            }
          };
      }
    } catch (error: any) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: error.message || 'Internal error'
        }
      };
    }
  }

  /**
   * Handle incoming HTTP requests
   */
  async fetch(request: Request): Promise<Response> {
    return this.app.fetch(request);
  }
}
