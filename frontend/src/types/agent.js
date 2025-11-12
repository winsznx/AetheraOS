/**
 * @typedef {Object} AgentPricing
 * @property {'x402' | 'flat'} model - Pricing model
 * @property {number} amount - Price in ETH
 */

/**
 * @typedef {Object} AgentMetadata
 * @property {string} id - Unique agent ID
 * @property {string} name - Agent name
 * @property {string} description - Agent description
 * @property {string[]} capabilities - Capability tags
 * @property {string} endpoint - Agent endpoint URL
 * @property {AgentPricing} pricing - Pricing configuration
 * @property {string} owner - Wallet address of agent owner
 * @property {number} reputation - Reputation score (0-100)
 * @property {'online' | 'busy' | 'offline'} status - Current status
 * @property {number} [tasksCompleted] - Number of completed tasks
 * @property {number} [successRate] - Success rate percentage
 */

/**
 * @typedef {Object} AgentConfig
 * @property {string} name - Agent name
 * @property {string} description - Agent description
 * @property {string[]} capabilities - Capability tags
 * @property {string} version - Agent version
 * @property {string} endpoint - Agent endpoint URL
 */

/**
 * @typedef {Object} AgentStats
 * @property {number} totalTasks - Total tasks completed
 * @property {number} successRate - Success rate percentage
 * @property {number} earnings - Total earnings in ETH
 * @property {number} reputation - Reputation score
 * @property {number} averageResponseTime - Average response time in ms
 */

export {};
