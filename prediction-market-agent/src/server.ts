/**
 * Prediction Market MCP Server Implementation
 *
 * Extends the MCP Hono Server DO to provide prediction market tools
 */

import { McpServer, Implementation } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DurableObject } from 'cloudflare:workers';
import { Hono } from 'hono';
import { setupPredictionMarketTools } from './tools.js';

export class PredictionMarketMcpServer extends DurableObject {
  private app: Hono;
  private mcpServer: McpServer;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    // Initialize Hono app
    this.app = new Hono();

    // Initialize MCP Server
    this.mcpServer = new McpServer({
      name: 'prediction-market-agent',
      version: '1.0.0'
    });

    // Configure MCP tools
    this.configureServer(this.mcpServer);

    // Setup routes
    this.setupRoutes();
  }

  /**
   * Configure MCP Server with tools, resources, and prompts
   */
  private configureServer(server: McpServer): void {
    // Setup prediction market tools
    setupPredictionMarketTools(server);
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
          const tools = await this.mcpServer.listTools();
          return {
            jsonrpc: '2.0',
            id,
            result: { tools }
          };

        case 'tools/call':
          const result = await this.mcpServer.callTool(params.name, params.arguments || {});
          return {
            jsonrpc: '2.0',
            id,
            result
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
