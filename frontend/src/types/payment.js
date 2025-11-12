/**
 * @typedef {Object} PaymentRecord
 * @property {string} id - Payment ID
 * @property {number} timestamp - Payment timestamp
 * @property {string} from - Sender address
 * @property {string} to - Recipient address
 * @property {number} amount - Amount in ETH
 * @property {'completed' | 'pending' | 'failed'} status - Payment status
 * @property {string} [transactionHash] - Blockchain transaction hash
 */

/**
 * @typedef {Object} FeeBreakdown
 * @property {number} total - Total amount
 * @property {number} platformFee - Platform fee amount
 * @property {number} agentPayment - Amount going to agent
 * @property {number} feePercent - Fee percentage
 */

/**
 * @typedef {Object} GasEstimate
 * @property {number} gasLimit - Gas limit
 * @property {string} gasPrice - Gas price in gwei
 * @property {number} estimatedCost - Estimated cost in ETH
 */

export {};
