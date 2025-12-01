/**
 * Sync Service - Auto-sync between Backend, Blockchain, and Edenlayer
 * Keeps all data sources in sync automatically
 */

import { getTasks, updateTask, syncTasks as apiSyncTasks } from '../lib/api';
import { getTotalTasks, getTask as getBlockchainTask } from '../lib/blockchain';
import { discoverAgents } from '../lib/edenlayer';

/**
 * Sync Manager - Coordinates all sync operations
 */
export class SyncManager {
  constructor(userAddress) {
    this.userAddress = userAddress?.toLowerCase();
    this.syncInterval = null;
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.syncCallbacks = new Map();
  }

  /**
   * Start auto-sync (runs every 30 seconds)
   */
  startAutoSync(intervalMs = 30000) {
    if (this.syncInterval) {
      console.warn('Auto-sync already running');
      return;
    }

    console.log('Starting auto-sync...');

    // Initial sync
    this.syncAll();

    // Periodic sync
    this.syncInterval = setInterval(() => {
      this.syncAll();
    }, intervalMs);
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  /**
   * Register callback for sync events
   * @param {string} event - Event name ('tasksSynced', 'agentsSynced', etc.)
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.syncCallbacks.has(event)) {
      this.syncCallbacks.set(event, []);
    }
    this.syncCallbacks.get(event).push(callback);
  }

  /**
   * Emit sync event
   * @private
   */
  emit(event, data) {
    const callbacks = this.syncCallbacks.get(event) || [];
    callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error(`Error in ${event} callback:`, error);
      }
    });
  }

  /**
   * Sync all data sources
   */
  async syncAll() {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    if (!this.userAddress) {
      console.warn('No user address, skipping sync');
      return;
    }

    this.isSyncing = true;

    try {
      console.log('🔄 Starting full sync...');

      await Promise.allSettled([
        this.syncTasksFromBlockchain(),
        this.syncAgentsFromEdenlayer()
      ]);

      this.lastSyncTime = new Date();
      console.log('✅ Full sync completed');

      this.emit('syncCompleted', { timestamp: this.lastSyncTime });
    } catch (error) {
      console.error('Sync error:', error);
      this.emit('syncError', { error });
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync tasks from blockchain to backend
   */
  async syncTasksFromBlockchain() {
    try {
      console.log('📋 Syncing tasks from blockchain...');

      // Get user's tasks from backend
      const backendTasks = await getTasks({ requester: this.userAddress });

      if (!backendTasks.success || !backendTasks.tasks) {
        console.warn('Failed to fetch backend tasks');
        return;
      }

      const tasksToSync = [];

      // Sync each task with blockchain
      for (const task of backendTasks.tasks) {
        if (!task.taskId) continue;

        try {
          // Get task state from blockchain
          const blockchainTask = await getBlockchainTask(task.taskId);

          // Check if status changed
          if (blockchainTask.status !== task.status ||
              blockchainTask.worker !== task.worker ||
              blockchainTask.proofHash !== task.proofHash) {

            tasksToSync.push({
              id: task.id,
              status: blockchainTask.status,
              worker: blockchainTask.worker,
              proofHash: blockchainTask.proofHash,
              budget: blockchainTask.budget,
              paid: blockchainTask.paid
            });
          }
        } catch (error) {
          console.warn(`Failed to sync task ${task.taskId}:`, error.message);
        }
      }

      // Update tasks that changed
      if (tasksToSync.length > 0) {
        console.log(`Updating ${tasksToSync.length} tasks...`);

        await Promise.all(
          tasksToSync.map(task => updateTask(task.id, task))
        );

        console.log(`✅ Synced ${tasksToSync.length} tasks from blockchain`);
        this.emit('tasksSynced', { count: tasksToSync.length, tasks: tasksToSync });
      } else {
        console.log('✅ Tasks already in sync');
      }

    } catch (error) {
      console.error('Error syncing tasks from blockchain:', error);
      throw error;
    }
  }

  /**
   * Sync agents from Edenlayer
   */
  async syncAgentsFromEdenlayer() {
    try {
      console.log('🤖 Syncing agents from Edenlayer...');

      // Get all agents from Edenlayer
      const edenlayerAgents = await discoverAgents([]);

      // Filter to user's agents (if ownership info available)
      const userAgents = edenlayerAgents.filter(agent =>
        agent.owner?.toLowerCase() === this.userAddress
      );

      if (userAgents.length > 0) {
        console.log(`Found ${userAgents.length} user agents on Edenlayer`);
        this.emit('agentsSynced', { count: userAgents.length, agents: userAgents });
      }

      console.log('✅ Agents synced from Edenlayer');

    } catch (error) {
      console.error('Error syncing agents from Edenlayer:', error);
      // Don't throw - Edenlayer sync is optional
    }
  }

  /**
   * Force immediate sync
   */
  async forceSyncNow() {
    return this.syncAll();
  }

  /**
   * Get last sync time
   */
  getLastSyncTime() {
    return this.lastSyncTime;
  }

  /**
   * Check if currently syncing
   */
  isCurrentlySyncing() {
    return this.isSyncing;
  }
}

/**
 * Global sync manager instance
 */
let globalSyncManager = null;

/**
 * Initialize sync manager for user
 * @param {string} userAddress - Wallet address
 * @param {boolean} autoStart - Auto-start sync (default: true)
 */
export function initSyncManager(userAddress, autoStart = true) {
  // Stop existing sync manager
  if (globalSyncManager) {
    globalSyncManager.stopAutoSync();
  }

  // Create new sync manager
  globalSyncManager = new SyncManager(userAddress);

  if (autoStart) {
    globalSyncManager.startAutoSync();
  }

  return globalSyncManager;
}

/**
 * Get global sync manager instance
 */
export function getSyncManager() {
  if (!globalSyncManager) {
    console.warn('Sync manager not initialized');
  }
  return globalSyncManager;
}

/**
 * Stop global sync manager
 */
export function stopSyncManager() {
  if (globalSyncManager) {
    globalSyncManager.stopAutoSync();
    globalSyncManager = null;
  }
}

/**
 * Manual sync trigger (useful for UI buttons)
 */
export async function syncNow() {
  if (!globalSyncManager) {
    throw new Error('Sync manager not initialized');
  }
  return globalSyncManager.forceSyncNow();
}

export default {
  SyncManager,
  initSyncManager,
  getSyncManager,
  stopSyncManager,
  syncNow
};
