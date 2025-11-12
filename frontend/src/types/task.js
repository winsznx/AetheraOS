/**
 * @typedef {'OPEN' | 'CLAIMED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'DISPUTED' | 'COMPLETED' | 'CANCELLED'} TaskStatus
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Unique task ID
 * @property {string} requester - Requester wallet address
 * @property {string|null} worker - Worker wallet address
 * @property {string|null} verifier - Verifier wallet address
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {string} budget - Budget in ETH
 * @property {number} deadline - Deadline timestamp
 * @property {string|null} proofHash - IPFS hash of work proof
 * @property {TaskStatus} status - Current task status
 * @property {number} createdAt - Creation timestamp
 * @property {number} [updatedAt] - Last update timestamp
 */

/**
 * @typedef {Object} TaskParams
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {string} budget - Budget in ETH
 * @property {number} deadline - Deadline timestamp
 */

/**
 * @typedef {Object} TaskSubmission
 * @property {string} taskId - Task ID
 * @property {string} proofHash - IPFS hash of work proof
 * @property {number} submittedAt - Submission timestamp
 * @property {string} worker - Worker wallet address
 */

/**
 * @typedef {Object} TaskVerification
 * @property {string} taskId - Task ID
 * @property {boolean} approved - Whether work is approved
 * @property {string} feedback - Verification feedback
 * @property {number} verifiedAt - Verification timestamp
 * @property {string} verifier - Verifier wallet address
 */

export {};
