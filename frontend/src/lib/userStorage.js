/**
 * User Storage - Multi-layer persistence for user data
 * Uses wallet address as user identifier
 *
 * Storage layers:
 * 1. Edenlayer Protocol - Agents, rooms, chat history
 * 2. Blockchain - Tasks via TaskEscrow contract
 * 3. IPFS - Files and proofs
 * 4. Cloudflare Workers KV - User metadata (optional)
 * 5. localStorage - UI preferences (fallback)
 */

const CHAININTEL_MCP_URL = import.meta.env.VITE_CHAININTEL_MCP_URL || 'https://chainintel-mcp.timjosh507.workers.dev';
const EDENLAYER_API_URL = import.meta.env.VITE_EDENLAYER_API_URL || 'https://api.edenlayer.com';

/**
 * Get current user's wallet address (primary identifier)
 * @returns {string|null} Wallet address or null if not connected
 */
export function getCurrentUserAddress() {
  // Try to get from Reown/WalletConnect
  try {
    const walletAddress = localStorage.getItem('walletAddress');
    if (walletAddress) return walletAddress.toLowerCase();
  } catch (e) {
    console.warn('Could not get wallet address from storage');
  }

  // Try from window.ethereum
  if (window.ethereum?.selectedAddress) {
    return window.ethereum.selectedAddress.toLowerCase();
  }

  return null;
}

/**
 * User Profile Storage
 * Stores user preferences and metadata
 */
export class UserProfileStore {
  constructor(userAddress) {
    this.userAddress = userAddress?.toLowerCase();
    this.storageKey = `aetheraos_profile_${this.userAddress}`;
  }

  /**
   * Get user profile from localStorage
   * @returns {Object} User profile
   */
  getProfile() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : this.getDefaultProfile();
    } catch (error) {
      console.error('Error loading profile:', error);
      return this.getDefaultProfile();
    }
  }

  /**
   * Save user profile to localStorage
   * @param {Object} profile - Profile data
   */
  saveProfile(profile) {
    try {
      const merged = { ...this.getProfile(), ...profile, updatedAt: new Date().toISOString() };
      localStorage.setItem(this.storageKey, JSON.stringify(merged));
      return merged;
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  /**
   * Get default profile structure
   */
  getDefaultProfile() {
    return {
      address: this.userAddress,
      displayName: this.userAddress ? `${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}` : 'Anonymous',
      email: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        theme: 'dark',
        notifications: true,
        emailNotifications: false
      }
    };
  }

  /**
   * Clear user profile
   */
  clearProfile() {
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * Task History Storage
 * Tracks user's task history with blockchain state
 */
export class TaskHistoryStore {
  constructor(userAddress) {
    this.userAddress = userAddress?.toLowerCase();
    this.storageKey = `aetheraos_tasks_${this.userAddress}`;
  }

  /**
   * Get all tasks for this user
   * @returns {Array} Task history
   */
  getTasks() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }

  /**
   * Add a task to history
   * @param {Object} task - Task data
   */
  addTask(task) {
    try {
      const tasks = this.getTasks();
      const newTask = {
        ...task,
        userAddress: this.userAddress,
        createdAt: task.createdAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Check if task already exists
      const existingIndex = tasks.findIndex(t => t.taskId === task.taskId);
      if (existingIndex >= 0) {
        tasks[existingIndex] = newTask;
      } else {
        tasks.unshift(newTask); // Add to beginning
      }

      localStorage.setItem(this.storageKey, JSON.stringify(tasks));
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  /**
   * Update task status
   * @param {string} taskId - Task ID
   * @param {Object} updates - Fields to update
   */
  updateTask(taskId, updates) {
    try {
      const tasks = this.getTasks();
      const taskIndex = tasks.findIndex(t => t.taskId === taskId);

      if (taskIndex >= 0) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...updates,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(tasks));
        return tasks[taskIndex];
      }

      return null;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Get task by ID
   * @param {string} taskId - Task ID
   */
  getTask(taskId) {
    const tasks = this.getTasks();
    return tasks.find(t => t.taskId === taskId);
  }

  /**
   * Clear all tasks
   */
  clearTasks() {
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * Agent Registry Storage
 * Tracks user's deployed agents
 */
export class AgentRegistryStore {
  constructor(userAddress) {
    this.userAddress = userAddress?.toLowerCase();
    this.storageKey = `aetheraos_agents_${this.userAddress}`;
  }

  /**
   * Get all agents for this user
   * @returns {Array} User's agents
   */
  getAgents() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading agents:', error);
      return [];
    }
  }

  /**
   * Add agent to registry
   * @param {Object} agent - Agent data
   */
  addAgent(agent) {
    try {
      const agents = this.getAgents();
      const newAgent = {
        ...agent,
        owner: this.userAddress,
        createdAt: agent.createdAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Check if agent already exists
      const existingIndex = agents.findIndex(a => a.id === agent.id || a.agentId === agent.agentId);
      if (existingIndex >= 0) {
        agents[existingIndex] = newAgent;
      } else {
        agents.unshift(newAgent);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(agents));
      return newAgent;
    } catch (error) {
      console.error('Error adding agent:', error);
      throw error;
    }
  }

  /**
   * Update agent
   * @param {string} agentId - Agent ID
   * @param {Object} updates - Fields to update
   */
  updateAgent(agentId, updates) {
    try {
      const agents = this.getAgents();
      const agentIndex = agents.findIndex(a => a.id === agentId || a.agentId === agentId);

      if (agentIndex >= 0) {
        agents[agentIndex] = {
          ...agents[agentIndex],
          ...updates,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(agents));
        return agents[agentIndex];
      }

      return null;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  }

  /**
   * Remove agent
   * @param {string} agentId - Agent ID
   */
  removeAgent(agentId) {
    try {
      const agents = this.getAgents();
      const filtered = agents.filter(a => a.id !== agentId && a.agentId !== agentId);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing agent:', error);
      throw error;
    }
  }

  /**
   * Clear all agents
   */
  clearAgents() {
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * Chat History Storage
 * Stores chat/conversation history locally
 * Note: Edenlayer also stores room messages, this is just for offline/backup
 */
export class ChatHistoryStore {
  constructor(userAddress) {
    this.userAddress = userAddress?.toLowerCase();
    this.storageKey = `aetheraos_chats_${this.userAddress}`;
  }

  /**
   * Get all chat history
   * @returns {Object} Chat history by room
   */
  getChatHistory() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading chat history:', error);
      return {};
    }
  }

  /**
   * Add message to chat history
   * @param {string} roomId - Room ID
   * @param {Object} message - Message data
   */
  addMessage(roomId, message) {
    try {
      const history = this.getChatHistory();
      if (!history[roomId]) {
        history[roomId] = {
          roomId,
          messages: [],
          lastMessage: null,
          lastUpdated: new Date().toISOString()
        };
      }

      history[roomId].messages.push({
        ...message,
        timestamp: message.timestamp || new Date().toISOString()
      });
      history[roomId].lastMessage = message;
      history[roomId].lastUpdated = new Date().toISOString();

      // Keep only last 100 messages per room
      if (history[roomId].messages.length > 100) {
        history[roomId].messages = history[roomId].messages.slice(-100);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(history));
      return message;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a room
   * @param {string} roomId - Room ID
   * @returns {Array} Messages
   */
  getRoomMessages(roomId) {
    const history = this.getChatHistory();
    return history[roomId]?.messages || [];
  }

  /**
   * Clear chat history
   */
  clearHistory() {
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * Sync Manager - Syncs local data with remote sources
 */
export class SyncManager {
  constructor(userAddress) {
    this.userAddress = userAddress?.toLowerCase();
    this.taskStore = new TaskHistoryStore(userAddress);
    this.agentStore = new AgentRegistryStore(userAddress);
  }

  /**
   * Sync tasks from blockchain
   * Fetches on-chain task state and updates local storage
   */
  async syncTasksFromBlockchain() {
    try {
      const { getTotalTasks, getTask } = await import('./blockchain');
      const totalTasks = await getTotalTasks();

      if (!totalTasks) return;

      const localTasks = this.taskStore.getTasks();

      // Sync known tasks
      for (const localTask of localTasks) {
        if (localTask.taskId) {
          try {
            const onChainTask = await getTask(localTask.taskId);

            // Update local with blockchain state
            this.taskStore.updateTask(localTask.taskId, {
              status: onChainTask.status,
              worker: onChainTask.worker,
              paid: onChainTask.paid,
              proofHash: onChainTask.proofHash,
              syncedAt: new Date().toISOString()
            });
          } catch (error) {
            console.warn(`Failed to sync task ${localTask.taskId}:`, error);
          }
        }
      }

      console.log('Tasks synced from blockchain');
    } catch (error) {
      console.error('Error syncing tasks from blockchain:', error);
    }
  }

  /**
   * Sync agents from Edenlayer
   */
  async syncAgentsFromEdenlayer() {
    try {
      const { discoverAgents } = await import('./edenlayer');

      // Get all agents from Edenlayer
      const allAgents = await discoverAgents([]);

      // Filter to user's agents (if Edenlayer provides ownership info)
      // For now, just mark locally deployed agents
      const localAgents = this.agentStore.getAgents();

      for (const localAgent of localAgents) {
        const remoteAgent = allAgents.find(a => a.id === localAgent.id || a.agentId === localAgent.agentId);

        if (remoteAgent) {
          this.agentStore.updateAgent(localAgent.id || localAgent.agentId, {
            ...remoteAgent,
            syncedAt: new Date().toISOString()
          });
        }
      }

      console.log('Agents synced from Edenlayer');
    } catch (error) {
      console.error('Error syncing agents from Edenlayer:', error);
    }
  }

  /**
   * Full sync - Run on app load
   */
  async syncAll() {
    await Promise.all([
      this.syncTasksFromBlockchain(),
      this.syncAgentsFromEdenlayer()
    ]);
  }
}

/**
 * Initialize user storage for current user
 * @returns {Object} Storage instances
 */
export function initUserStorage() {
  const userAddress = getCurrentUserAddress();

  if (!userAddress) {
    console.warn('No wallet connected - using anonymous storage');
  }

  return {
    profile: new UserProfileStore(userAddress),
    tasks: new TaskHistoryStore(userAddress),
    agents: new AgentRegistryStore(userAddress),
    chats: new ChatHistoryStore(userAddress),
    sync: new SyncManager(userAddress),
    userAddress
  };
}

/**
 * Clear all user data (on logout)
 */
export function clearAllUserData() {
  const userAddress = getCurrentUserAddress();

  if (userAddress) {
    const profile = new UserProfileStore(userAddress);
    const tasks = new TaskHistoryStore(userAddress);
    const agents = new AgentRegistryStore(userAddress);
    const chats = new ChatHistoryStore(userAddress);

    profile.clearProfile();
    tasks.clearTasks();
    agents.clearAgents();
    chats.clearHistory();

    console.log('All user data cleared');
  }
}

/**
 * Export user data (for backup/portability)
 * @returns {Object} All user data
 */
export function exportUserData() {
  const { profile, tasks, agents, chats, userAddress } = initUserStorage();

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    userAddress,
    data: {
      profile: profile.getProfile(),
      tasks: tasks.getTasks(),
      agents: agents.getAgents(),
      chats: chats.getChatHistory()
    }
  };
}

/**
 * Import user data (restore from backup)
 * @param {Object} data - Exported data
 */
export function importUserData(data) {
  const { profile, tasks, agents, chats } = initUserStorage();

  if (data.data.profile) profile.saveProfile(data.data.profile);

  if (data.data.tasks) {
    data.data.tasks.forEach(task => tasks.addTask(task));
  }

  if (data.data.agents) {
    data.data.agents.forEach(agent => agents.addAgent(agent));
  }

  // Chat history import handled separately per room

  console.log('User data imported successfully');
}
