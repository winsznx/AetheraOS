/**
 * API Client - Complete Backend Integration
 * Centralized API calls for all backend endpoints
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Base fetch wrapper with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================
// USER API
// ============================================

/**
 * Get or create user profile
 * @param {string} address - Wallet address
 */
export async function getUser(address) {
  return apiRequest(`/users/${address}`);
}

/**
 * Update user profile
 * @param {string} address - Wallet address
 * @param {Object} updates - Profile updates
 */
export async function updateUser(address, updates) {
  return apiRequest(`/users/${address}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

/**
 * Get user statistics
 * @param {string} address - Wallet address
 */
export async function getUserStats(address) {
  return apiRequest(`/users/${address}/stats`);
}

// ============================================
// TASK API
// ============================================

/**
 * Get tasks with filters
 * @param {Object} filters - Filter options
 */
export async function getTasks(filters = {}) {
  const params = new URLSearchParams(filters);
  return apiRequest(`/tasks?${params}`);
}

/**
 * Create new task
 * @param {Object} taskData - Task details
 */
export async function createTask(taskData) {
  return apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
}

/**
 * Get task by ID
 * @param {string} id - Task database ID
 */
export async function getTask(id) {
  return apiRequest(`/tasks/${id}`);
}

/**
 * Get task by blockchain taskId
 * @param {string} taskId - Blockchain task ID
 */
export async function getTaskByBlockchainId(taskId) {
  return apiRequest(`/tasks/blockchain/${taskId}`);
}

/**
 * Update task (sync from blockchain)
 * @param {string} id - Task database ID
 * @param {Object} updates - Task updates
 */
export async function updateTask(id, updates) {
  return apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

/**
 * Bulk sync tasks from blockchain
 * @param {Array} tasks - Array of blockchain tasks
 */
export async function syncTasks(tasks) {
  return apiRequest('/tasks/sync', {
    method: 'POST',
    body: JSON.stringify({ tasks })
  });
}

/**
 * Delete/cancel task
 * @param {string} id - Task database ID
 */
export async function deleteTask(id) {
  return apiRequest(`/tasks/${id}`, {
    method: 'DELETE'
  });
}

// ============================================
// AGENT API
// ============================================

/**
 * Get agents with filters
 * @param {Object} filters - Filter options
 */
export async function getAgents(filters = {}) {
  const params = new URLSearchParams(filters);
  return apiRequest(`/agents?${params}`);
}

/**
 * Create/register new agent
 * @param {Object} agentData - Agent details
 */
export async function createAgent(agentData) {
  return apiRequest('/agents', {
    method: 'POST',
    body: JSON.stringify(agentData)
  });
}

/**
 * Get agent by ID
 * @param {string} id - Agent database ID
 */
export async function getAgent(id) {
  return apiRequest(`/agents/${id}`);
}

/**
 * Update agent
 * @param {string} id - Agent database ID
 * @param {Object} updates - Agent updates
 */
export async function updateAgent(id, updates) {
  return apiRequest(`/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

/**
 * Track agent call (increment stats)
 * @param {string} id - Agent database ID
 * @param {string} revenue - Revenue generated (ETH)
 */
export async function trackAgentCall(id, revenue) {
  return apiRequest(`/agents/${id}/call`, {
    method: 'POST',
    body: JSON.stringify({ revenue })
  });
}

/**
 * Delete/deactivate agent
 * @param {string} id - Agent database ID
 */
export async function deleteAgent(id) {
  return apiRequest(`/agents/${id}`, {
    method: 'DELETE'
  });
}

// ============================================
// CHAT API
// ============================================

/**
 * Get chat rooms
 * @param {string} participant - Wallet address filter
 */
export async function getChatRooms(participant = null) {
  const params = participant ? `?participant=${participant}` : '';
  return apiRequest(`/chat/rooms${params}`);
}

/**
 * Create chat room
 * @param {Object} roomData - Room details
 */
export async function createChatRoom(roomData) {
  return apiRequest('/chat/rooms', {
    method: 'POST',
    body: JSON.stringify(roomData)
  });
}

/**
 * Get room messages
 * @param {string} roomId - Room ID
 * @param {Object} options - Query options
 */
export async function getRoomMessages(roomId, options = {}) {
  const params = new URLSearchParams(options);
  return apiRequest(`/chat/rooms/${roomId}/messages?${params}`);
}

/**
 * Send message to room
 * @param {string} roomId - Room ID
 * @param {Object} messageData - Message details
 */
export async function sendMessage(roomId, messageData) {
  return apiRequest(`/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify(messageData)
  });
}

// ============================================
// IPFS API
// ============================================

/**
 * Get IPFS uploads
 * @param {Object} filters - Filter options
 */
export async function getIPFSUploads(filters = {}) {
  const params = new URLSearchParams(filters);
  return apiRequest(`/ipfs/uploads?${params}`);
}

/**
 * Track IPFS upload
 * @param {Object} uploadData - Upload details
 */
export async function trackIPFSUpload(uploadData) {
  return apiRequest('/ipfs/uploads', {
    method: 'POST',
    body: JSON.stringify(uploadData)
  });
}

// ============================================
// ANALYTICS API
// ============================================

/**
 * Get analytics events
 * @param {Object} filters - Filter options
 */
export async function getAnalyticsEvents(filters = {}) {
  const params = new URLSearchParams(filters);
  return apiRequest(`/analytics/events?${params}`);
}

/**
 * Track analytics event
 * @param {string} eventType - Event type
 * @param {string} userAddress - User wallet address
 * @param {Object} data - Event data
 */
export async function trackEvent(eventType, userAddress, data = {}) {
  return apiRequest('/analytics/events', {
    method: 'POST',
    body: JSON.stringify({ eventType, userAddress, data })
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if backend is available
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

/**
 * Get API base URL
 */
export function getApiUrl() {
  return API_URL;
}

/**
 * Export for testing
 */
export const api = {
  // Users
  getUser,
  updateUser,
  getUserStats,

  // Tasks
  getTasks,
  createTask,
  getTask,
  getTaskByBlockchainId,
  updateTask,
  syncTasks,
  deleteTask,

  // Agents
  getAgents,
  createAgent,
  getAgent,
  updateAgent,
  trackAgentCall,
  deleteAgent,

  // Chat
  getChatRooms,
  createChatRoom,
  getRoomMessages,
  sendMessage,

  // IPFS
  getIPFSUploads,
  trackIPFSUpload,

  // Analytics
  getAnalyticsEvents,
  trackEvent,

  // Helpers
  checkBackendHealth,
  getApiUrl
};

export default api;
