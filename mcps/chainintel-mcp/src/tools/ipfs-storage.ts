/**
 * IPFS Storage Tools - Decentralized file storage with Pinata
 * Integrated from work-proof MCP
 */

import { z } from 'zod';

// Environment configuration
const PINATA_API = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
const PUBLIC_GATEWAY = 'https://ipfs.io/ipfs/';

// Schemas
export const UploadWorkProofSchema = z.object({
  content: z.string().describe('File content (base64 encoded)'),
  filename: z.string().describe('File name'),
  taskId: z.number().optional().describe('Associated task ID'),
  worker: z.string().optional().describe('Worker address'),
  metadata: z.record(z.any()).optional().describe('Additional metadata')
});

export const UploadJSONSchema = z.object({
  data: z.record(z.any()).describe('JSON data to upload'),
  name: z.string().optional().describe('Name for the JSON file')
});

export const DownloadProofSchema = z.object({
  ipfsHash: z.string().describe('IPFS CID to download'),
  usePinata: z.boolean().optional().describe('Use Pinata gateway (faster)')
});

export const PinHashSchema = z.object({
  ipfsHash: z.string().describe('IPFS hash to pin'),
  name: z.string().optional().describe('Name for the pin')
});

export const GetIPFSUrlSchema = z.object({
  ipfsHash: z.string().describe('IPFS CID'),
  usePinata: z.boolean().optional().describe('Use Pinata gateway')
});

// Tool definitions
export const uploadWorkProofToolDef = {
  name: 'upload_work_proof',
  description: 'Upload work proof file to IPFS with metadata',
  parameters: UploadWorkProofSchema,
  execute: uploadWorkProof
};

export const uploadJSONToolDef = {
  name: 'upload_json',
  description: 'Upload JSON data to IPFS',
  parameters: UploadJSONSchema,
  execute: uploadJSON
};

export const downloadProofToolDef = {
  name: 'download_proof',
  description: 'Download and verify work proof from IPFS',
  parameters: DownloadProofSchema,
  execute: downloadProof
};

export const pinToIPFSToolDef = {
  name: 'pin_to_ipfs',
  description: 'Pin existing IPFS hash for persistence',
  parameters: PinHashSchema,
  execute: pinToIPFS
};

export const getIPFSUrlToolDef = {
  name: 'get_ipfs_url',
  description: 'Get gateway URL for IPFS hash',
  parameters: GetIPFSUrlSchema,
  execute: getIPFSUrl
};

// Tool implementations
async function uploadWorkProof(params: z.infer<typeof UploadWorkProofSchema>) {
  const PINATA_JWT = process.env.PINATA_JWT || '';
  const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
  const PINATA_SECRET = process.env.PINATA_SECRET_KEY || '';

  // Check if Pinata is configured
  // Check if Pinata is configured
  if (!PINATA_JWT && !PINATA_API_KEY) {
    throw new Error('Pinata not configured. Configure PINATA_JWT or PINATA_API_KEY in environment variables.');
  }

  try {
    // Decode base64 content
    const buffer = Buffer.from(params.content, 'base64');

    // Create FormData
    const formData = new FormData();
    const blob = new Blob([buffer]);
    formData.append('file', blob, params.filename);

    // Add metadata
    const metadata: any = {
      name: params.filename,
      keyvalues: {
        ...params.metadata,
        uploadedAt: new Date().toISOString()
      }
    };

    if (params.taskId) metadata.keyvalues.taskId = params.taskId.toString();
    if (params.worker) metadata.keyvalues.worker = params.worker;

    formData.append('pinataMetadata', JSON.stringify(metadata));

    // Upload to Pinata
    const headers: any = {};
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else if (PINATA_API_KEY && PINATA_SECRET) {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET;
    }

    const response = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers,
      body: formData as any
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const result: any = await response.json();

    return {
      success: true,
      ipfsHash: result.IpfsHash,
      url: `${PINATA_GATEWAY}${result.IpfsHash}`,
      size: result.PinSize,
      timestamp: result.Timestamp
    };
  } catch (error: any) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

async function uploadJSON(params: z.infer<typeof UploadJSONSchema>) {
  const jsonString = JSON.stringify(params.data, null, 2);
  const buffer = Buffer.from(jsonString);
  const base64Content = buffer.toString('base64');

  return uploadWorkProof({
    content: base64Content,
    filename: params.name || 'data.json',
    metadata: { type: 'json' }
  });
}

async function downloadProof(params: z.infer<typeof DownloadProofSchema>) {
  const gateway = params.usePinata !== false ? PINATA_GATEWAY : PUBLIC_GATEWAY;
  const url = `${gateway}${params.ipfsHash}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // Try fallback gateway if Pinata fails
      if (params.usePinata !== false) {
        return downloadProof({ ...params, usePinata: false });
      }
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let content: any;

    if (contentType.includes('application/json')) {
      content = await response.json();
    } else {
      const buffer = await response.arrayBuffer();
      content = Buffer.from(buffer).toString('base64');
    }

    return {
      success: true,
      ipfsHash: params.ipfsHash,
      content,
      contentType,
      url
    };
  } catch (error: any) {
    throw new Error(`Download failed: ${error.message}`);
  }
}

async function pinToIPFS(params: z.infer<typeof PinHashSchema>) {
  const PINATA_JWT = process.env.PINATA_JWT || '';
  const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
  const PINATA_SECRET = process.env.PINATA_SECRET_KEY || '';

  if (!PINATA_JWT && !PINATA_API_KEY) {
    return {
      success: false,
      message: 'Pinata not configured - cannot pin hash. Configure PINATA_JWT or PINATA_API_KEY in environment variables.'
    };
  }

  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else if (PINATA_API_KEY && PINATA_SECRET) {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET;
    }

    const response = await fetch(`${PINATA_API}/pinning/pinByHash`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        hashToPin: params.ipfsHash,
        pinataMetadata: { name: params.name || params.ipfsHash }
      })
    });

    if (!response.ok) {
      throw new Error(`Pin failed: ${response.statusText}`);
    }

    return {
      success: true,
      ipfsHash: params.ipfsHash,
      pinned: true
    };
  } catch (error: any) {
    throw new Error(`Pin failed: ${error.message}`);
  }
}

async function getIPFSUrl(params: z.infer<typeof GetIPFSUrlSchema>) {
  const gateway = params.usePinata !== false ? PINATA_GATEWAY : PUBLIC_GATEWAY;
  const url = `${gateway}${params.ipfsHash}`;

  return {
    success: true,
    url,
    ipfsHash: params.ipfsHash,
    gateway: params.usePinata !== false ? 'pinata' : 'public'
  };
}

async function generateMockHash(filename: string): Promise<string> {
  const data = `${filename}-${Date.now()}`;

  // Simple hash for demo
  const hash = Buffer.from(data).toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 44);

  return `Qm${hash}`;
}
