/**
 * Node.js globals for Cloudflare Workers environment
 * Workers support some Node.js APIs via compatibility flags
 */

// Process global (available in Workers with nodejs_compat flag)
declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
};

// Buffer global (available in Workers)
declare const Buffer: {
  from(data: string | Uint8Array | ArrayBuffer, encoding?: string): Buffer;
  isBuffer(obj: any): obj is Buffer;
};

interface Buffer extends Uint8Array {
  toString(encoding?: string): string;
}

// ImportMeta for Workers
interface ImportMeta {
  url: string;
  env?: Record<string, string | undefined>;
}
