import { verifyWalletSignature } from '../utils/auth.js';

/**
 * Middleware to authenticate requests using wallet signature
 * Expects headers:
 * - x-wallet-address: The user's wallet address
 * - x-signature: The signature of the message
 * - x-timestamp: The timestamp signed
 */
export const authenticate = (req, res, next) => {
    try {
        const address = req.headers['x-wallet-address'];
        const signature = req.headers['x-signature'];
        const timestamp = req.headers['x-timestamp'];

        if (!address || !signature || !timestamp) {
            return res.status(401).json({
                success: false,
                error: 'Missing authentication headers'
            });
        }

        // Verify timestamp is within 5 minutes to prevent replay attacks
        const now = Date.now();
        const reqTime = parseInt(timestamp);
        if (Math.abs(now - reqTime) > 5 * 60 * 1000) {
            return res.status(401).json({
                success: false,
                error: 'Request expired'
            });
        }

        // Message that was signed (frontend must match this format)
        const message = `Login to AetheraOS: ${timestamp}`;

        const isValid = verifyWalletSignature(message, signature, address);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid signature'
            });
        }

        // Attach user address to request
        req.user = { address: address.toLowerCase() };
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};
