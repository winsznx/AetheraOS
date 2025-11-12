/**
 * Prediction Market Agent - MCP Server Entry Point
 *
 * This agent provides tools for interacting with prediction markets:
 * - Fetch market data from various sources
 * - Analyze odds and probabilities
 * - Place bets on-chain
 * - Track positions and calculate PnL
 */

export { PredictionMarketMcpServer } from './server.js';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        name: 'Prediction Market Agent',
        version: '1.0.0',
        status: 'healthy',
        description: 'AI Agent for prediction markets with on-chain betting capabilities'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get or create Durable Object session
    const sessionIdStr = url.searchParams.get('sessionId');
    const id = sessionIdStr
      ? env.MCP_SERVER.idFromString(sessionIdStr)
      : env.MCP_SERVER.newUniqueId();

    console.log(`Routing to MCP server with sessionId: ${id}`);

    url.searchParams.set('sessionId', id.toString());

    return env.MCP_SERVER.get(id).fetch(new Request(
      url.toString(),
      request
    ));
  }
};
