/**
 * Edenlayer Protocol Integration
 * Agent discovery, registry, and task execution
 * @see https://api.edenlayer.com - Official Edenlayer API
 */

const EDENLAYER_API_URL = import.meta.env.VITE_EDENLAYER_API_URL || 'https://api.edenlayer.com';

/**
 * Get authentication headers
 * @returns {Object} Headers with API key or session tokens
 */
function getAuthHeaders() {
  const apiKey = import.meta.env.VITE_EDENLAYER_API_KEY;
  const sessionToken = localStorage.getItem('privy-session-token');
  const identityToken = localStorage.getItem('privy-identity-token');

  const headers = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  } else if (sessionToken && identityToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
    headers['X-Identity-Token'] = identityToken;
  }

  return headers;
}

/**
 * Register an agent in Edenlayer registry
 * @param {Object} metadata - Agent metadata
 * @param {string} metadata.name - Agent name
 * @param {string} metadata.description - Agent description
 * @param {string} metadata.defaultPrompt - Default prompt for agent
 * @param {string} metadata.imageUrl - Agent image URL
 * @param {string} metadata.mcpUrl - MCP endpoint URL
 * @param {string} metadata.chatUrl - Chat endpoint URL (optional)
 * @param {Object} metadata.capabilities - Agent capabilities with tools
 * @returns {Promise<string>} Agent ID
 */
export async function registerAgent(metadata) {
  try {
    const payload = {
      name: metadata.name,
      description: metadata.description,
      defaultPrompt: metadata.defaultPrompt || `How can ${metadata.name} help you?`,
      imageUrl: metadata.imageUrl || '',
      backgroundImageUrl: metadata.backgroundImageUrl || '',
      websiteUrl: metadata.websiteUrl || '',
      mcpUrl: metadata.mcpUrl || metadata.endpoint,
      chatUrl: metadata.chatUrl || '',
      capabilities: metadata.capabilities || { tools: [] }
    };

    const response = await fetch(`${EDENLAYER_API_URL}/agents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Failed to register agent: ${response.statusText}`);
    }

    const data = await response.json();
    return data.agentId || data.id;
  } catch (error) {
    console.error('Error registering agent:', error);
    throw error;
  }
}

/**
 * Discover agents from registry
 * @param {string[]} capabilities - Optional capability tags to filter
 * @returns {Promise<Array>} List of matching agents
 */
export async function discoverAgents(capabilities = []) {
  try {
    let url = `${EDENLAYER_API_URL}/agents`;

    if (capabilities && capabilities.length > 0) {
      const params = new URLSearchParams({ capabilities: capabilities.join(',') });
      url += `?${params}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to discover agents: ${response.statusText}`);
    }

    const data = await response.json();
    return data.agents || data;
  } catch (error) {
    console.error('Error discovering agents:', error);
    throw error;
  }
}

/**
 * Get agent details by ID
 * @param {string} agentId - Agent ID
 * @returns {Promise<Object>} Agent details
 */
export async function getAgent(agentId) {
  try {
    const response = await fetch(`${EDENLAYER_API_URL}/agents/${agentId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch agent: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching agent:', error);
    throw error;
  }
}

/**
 * Execute a task with an agent
 * @param {string} agentId - Agent ID to execute task
 * @param {string} operation - Operation to perform (e.g., "tools/calculate")
 * @param {Object} params - Task parameters
 * @returns {Promise<Object>} Task execution response with taskId
 */
export async function executeTask(agentId, operation, params = {}) {
  try {
    const payload = {
      agentId,
      operation,
      params
    };

    const response = await fetch(`${EDENLAYER_API_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Failed to execute task: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Returns { taskId, state }
  } catch (error) {
    console.error('Error executing task:', error);
    throw error;
  }
}

/**
 * Get task status and result
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Task status and result
 */
export async function getTaskStatus(taskId) {
  try {
    const response = await fetch(`${EDENLAYER_API_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch task status: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Returns { taskId, state, result }
  } catch (error) {
    console.error('Error fetching task status:', error);
    throw error;
  }
}

/**
 * Compose multiple tasks with dependencies
 * @param {Array} tasks - Array of task definitions
 * @returns {Promise<Object>} Composed task execution response
 */
export async function composeTasks(tasks) {
  try {
    const response = await fetch(`${EDENLAYER_API_URL}/tasks/compose`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tasks)
    });

    if (!response.ok) {
      throw new Error(`Failed to compose tasks: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error composing tasks:', error);
    throw error;
  }
}

/**
 * Search agents by query
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching agents
 */
export async function searchAgents(query) {
  try {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`${EDENLAYER_API_URL}/agents/search?${params}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to search agents: ${response.statusText}`);
    }

    const data = await response.json();
    return data.agents || data;
  } catch (error) {
    console.error('Error searching agents:', error);
    throw error;
  }
}

/**
 * Create a chat room
 * @param {Object} roomConfig - Room configuration
 * @param {string} roomConfig.name - Room name
 * @param {string} roomConfig.type - Room type (e.g., "CHAT")
 * @param {string} roomConfig.description - Room description
 * @param {Array} roomConfig.participants - Array of participants
 * @param {boolean} roomConfig.private - Is room private
 * @param {number} roomConfig.maxParticipants - Max number of participants
 * @returns {Promise<Object>} Room details with roomId
 */
export async function createRoom(roomConfig) {
  try {
    const response = await fetch(`${EDENLAYER_API_URL}/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomConfig)
    });

    if (!response.ok) {
      throw new Error(`Failed to create room: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

/**
 * Get user's rooms
 * @returns {Promise<Array>} List of user's rooms
 */
export async function getUserRooms() {
  try {
    const response = await fetch(`${EDENLAYER_API_URL}/user/rooms`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user rooms: ${response.statusText}`);
    }

    const data = await response.json();
    return data.rooms || data;
  } catch (error) {
    console.error('Error fetching user rooms:', error);
    throw error;
  }
}

/**
 * Get room details
 * @param {string} roomId - Room ID
 * @returns {Promise<Object>} Room details
 */
export async function getRoom(roomId) {
  try {
    const response = await fetch(`${EDENLAYER_API_URL}/rooms/${roomId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch room: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching room:', error);
    throw error;
  }
}

/**
 * List all rooms (alias for getUserRooms)
 * @returns {Promise<Array>} List of rooms
 */
export async function listRooms() {
  return getUserRooms();
}

/**
 * Get room message history
 * @param {string} roomId - Room ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Max messages to retrieve
 * @param {string} options.before - Get messages before this timestamp
 * @returns {Promise<Array>} Array of messages
 */
export async function getRoomMessages(roomId, options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.before) params.set('before', options.before);

    const url = `${EDENLAYER_API_URL}/rooms/${roomId}/messages${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    const data = await response.json();
    return data.messages || data;
  } catch (error) {
    console.error('Error fetching room messages:', error);
    throw error;
  }
}

/**
 * Get WebSocket URL for room connection
 * @param {string} roomId - Room ID
 * @returns {string} WebSocket URL with auth params
 */
export function getRoomWebSocketUrl(roomId) {
  const apiKey = import.meta.env.VITE_EDENLAYER_API_KEY;
  const sessionToken = localStorage.getItem('privy-session-token');
  const identityToken = localStorage.getItem('privy-identity-token');

  let wsUrl = `wss://api.edenlayer.com/parties/chat-server/${roomId}`;

  if (apiKey) {
    wsUrl += `?api-key=${apiKey}`;
  } else if (sessionToken && identityToken) {
    wsUrl += `?Authorization=Bearer+${sessionToken}&X-Identity-Token=${identityToken}`;
  }

  return wsUrl;
}
