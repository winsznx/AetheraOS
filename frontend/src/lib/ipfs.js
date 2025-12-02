/**
 * IPFS Storage Integration
 * Using multiple providers for reliability
 */

// IPFS providers
const PINATA_API = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
const PUBLIC_GATEWAY = 'https://ipfs.io/ipfs/';

// Get API keys from environment
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET_KEY;

/**
 * Upload file to IPFS via Pinata
 * @param {File} file - File to upload
 * @param {Object} metadata - Optional metadata
 * @returns {Promise<string>} IPFS hash (CID)
 */
export async function uploadToIPFS(file, metadata = {}) {
  try {
    // Check if Pinata credentials are configured
    if (!PINATA_JWT && !PINATA_API_KEY) {
      console.warn('Pinata credentials not configured, using Web3.Storage fallback');
      return uploadToWeb3Storage(file, metadata);
    }

    const formData = new FormData();
    formData.append('file', file);

    // Add metadata if provided
    if (Object.keys(metadata).length > 0) {
      const pinataMetadata = {
        name: metadata.name || file.name,
        keyvalues: metadata
      };
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
    }

    // Upload to Pinata
    const headers = {};
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else if (PINATA_API_KEY && PINATA_SECRET) {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET;
    }

    const response = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.IpfsHash; // Returns CID
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

/**
 * Upload JSON data to IPFS
 * @param {Object} data - JSON data to upload
 * @param {string} name - Optional name for the data
 * @returns {Promise<string>} IPFS hash (CID)
 */
export async function uploadJSONToIPFS(data, name = 'data.json') {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const file = new File([blob], name, { type: 'application/json' });

    return await uploadToIPFS(file, { type: 'json' });
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw error;
  }
}

/**
 * Upload work proof (file + metadata) to IPFS
 * @param {File} proofFile - Proof file
 * @param {Object} taskMetadata - Task metadata
 * @returns {Promise<string>} IPFS hash
 */
export async function uploadWorkProof(proofFile, taskMetadata) {
  try {
    // Create proof package with metadata
    const proofData = {
      taskId: taskMetadata.taskId,
      worker: taskMetadata.worker,
      submittedAt: new Date().toISOString(),
      fileName: proofFile.name,
      fileSize: proofFile.size,
      fileType: proofFile.type
    };

    // Upload proof file first
    const fileHash = await uploadToIPFS(proofFile, {
      taskId: taskMetadata.taskId,
      type: 'work-proof'
    });

    // Upload metadata with file reference
    proofData.fileHash = fileHash;
    const metadataHash = await uploadJSONToIPFS(proofData, 'proof-metadata.json');

    // Return metadata hash (which contains reference to file)
    return metadataHash;
  } catch (error) {
    console.error('Error uploading work proof:', error);
    throw error;
  }
}

/**
 * Download file from IPFS
 * @param {string} hash - IPFS hash (CID)
 * @param {boolean} usePinata - Use Pinata gateway (faster, requires auth)
 * @returns {Promise<Blob>} File data
 */
export async function downloadFromIPFS(hash, usePinata = true) {
  try {
    const gateway = usePinata ? PINATA_GATEWAY : PUBLIC_GATEWAY;
    const url = `${gateway}${hash}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error downloading from IPFS:', error);

    // Fallback to public gateway if Pinata fails
    if (usePinata) {
      console.log('Retrying with public gateway...');
      return downloadFromIPFS(hash, false);
    }

    throw error;
  }
}

/**
 * Get IPFS gateway URL for a hash
 * @param {string} hash - IPFS hash (CID)
 * @param {boolean} usePinata - Use Pinata gateway
 * @returns {string} Gateway URL
 */
export function getIPFSUrl(hash, usePinata = true) {
  const gateway = usePinata ? PINATA_GATEWAY : PUBLIC_GATEWAY;
  return `${gateway}${hash}`;
}

/**
 * Fetch JSON data from IPFS
 * @param {string} hash - IPFS hash (CID)
 * @returns {Promise<Object>} Parsed JSON data
 */
export async function fetchJSONFromIPFS(hash) {
  try {
    const blob = await downloadFromIPFS(hash);
    const text = await blob.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error fetching JSON from IPFS:', error);
    throw error;
  }
}

/**
 * Fallback: Upload to Web3.Storage (free, no API key needed)
 * @param {File} file - File to upload
 * @param {Object} metadata - Metadata
 * @returns {Promise<string>} IPFS hash
 */
/**
 * Fallback: Upload to Web3.Storage (free, no API key needed)
 * @param {File} file - File to upload
 * @param {Object} metadata - Metadata
 * @returns {Promise<string>} IPFS hash
 */
async function uploadToWeb3Storage(file, metadata = {}) {
  // In production, we do not want to fallback to a mock implementation that stores data in localStorage.
  // We must enforce proper IPFS configuration.
  throw new Error('IPFS credentials not configured. Please set VITE_PINATA_JWT or VITE_PINATA_API_KEY in your environment variables.');
}

/**
 * Generate mock IPFS hash for demo purposes
 * @param {File} file - File to hash
 * @returns {Promise<string>} Mock CID
 */
async function generateMockIPFSHash(file) {
  // Create a pseudo-hash from file properties
  const data = `${file.name}-${file.size}-${file.type}-${Date.now()}`;

  // Use SubtleCrypto if available
  if (crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Format as IPFS CID (base58-like)
    return 'Qm' + hashHex.slice(0, 44);
  }

  // Simple fallback
  return 'Qm' + btoa(data).replace(/[^a-zA-Z0-9]/g, '').slice(0, 44);
}

/**
 * Check if IPFS is properly configured
 * @returns {boolean}
 */
export function isIPFSConfigured() {
  return !!(PINATA_JWT || PINATA_API_KEY);
}

/**
 * Pin existing IPFS hash to Pinata (for persistence)
 * @param {string} hash - IPFS hash to pin
 * @param {string} name - Name for the pin
 * @returns {Promise<void>}
 */
export async function pinToIPFS(hash, name = '') {
  try {
    if (!PINATA_JWT && !PINATA_API_KEY) {
      console.warn('Cannot pin: Pinata not configured');
      return;
    }

    const headers = { 'Content-Type': 'application/json' };
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
        hashToPin: hash,
        pinataMetadata: { name }
      })
    });

    if (!response.ok) {
      throw new Error(`Pin failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error pinning to IPFS:', error);
    throw error;
  }
}
