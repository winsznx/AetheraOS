/**
 * ChainIntel MCP - Entry Point
 * Can run as both MCP server (stdio) or Cloudflare Worker (HTTP + x402)
 */

import { startServer } from './server';

// Export for Cloudflare Workers
export { default } from './worker';

// Start MCP server if run directly
if (typeof process !== 'undefined' && process.argv) {
  startServer().catch(console.error);
}
