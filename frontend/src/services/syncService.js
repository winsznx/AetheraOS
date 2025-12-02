/**
 * Sync Service - Auto-sync between Backend and Blockchain
 * Keeps task data in sync automatically
 * Note: Agent discovery happens on-demand in Marketplace, not in auto-sync
 */

import { getTasks, updateTask, syncTasks as apiSyncTasks } from '../lib/api';
import { getTotalTasks, getTask as getBlockchainTask, getMultipleBlockchainTasks } from '../lib/blockchain';

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
  /**
   * Start auto-sync (adaptive polling)
   */
  startAutoSync(intervalMs = 30000, maxInterval = 300000) {
    if (this.syncInterval) {
      console.warn('Auto-sync already running');
      return;
    }

    console.log('Starting adaptive auto-sync...');

    let currentInterval = intervalMs;
    let lastActivity = Date.now();
    let syncTimeout = null;

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const onActivity = () => {
      lastActivity = Date.now();
      currentInterval = intervalMs; // Reset to fast polling on activity
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, onActivity, { passive: true });
    });

    // Adaptive polling function
    const adaptiveSync = async () => {
      // Don't sync if tab is hidden
      if (document.hidden) {
        syncTimeout = setTimeout(adaptiveSync, currentInterval);
        return;
      }

      const timeSinceActivity = Date.now() - lastActivity;

      // Slow down polling when user is idle
      if (timeSinceActivity > 60000) {
        currentInterval = Math.min(currentInterval * 1.5, maxInterval);
      }

      await this.syncAll();

      syncTimeout = setTimeout(adaptiveSync, currentInterval);
    };

    // Initial sync
    adaptiveSync();

    // Store cleanup function
    this.cleanup = () => {
      clearTimeout(syncTimeout);
      activityEvents.forEach(event => {
        window.removeEventListener(event, onActivity);
      });
    };
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
      console.log('Auto-sync stopped');
    }
    // Also clear interval if it was set by old code (backward compatibility)
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
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

      // Sync tasks from blockchain
      await this.syncTasksFromBlockchain();

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

      // Filter tasks that have a blockchain ID
      const taskIds = backendTasks.tasks
        .filter(t => t.taskId)
        .map(t => t.taskId);

      if (taskIds.length === 0) {
        console.log('No blockchain tasks to sync');
        return;
      }

      // Batch fetch from blockchain
      const blockchainTasks = await getMultipleBlockchainTasks(taskIds);

      // Create a map for faster lookup
      const bcTaskMap = new Map(blockchainTasks.map(t => [t.id, t]));

      const tasksToSync = [];

      // Compare and prepare updates
      for (const task of backendTasks.tasks) {
        if (!task.taskId) continue;

        const blockchainTask = bcTaskMap.get(Number(task.taskId));

        if (!blockchainTask) {
          console.warn(`Task ${task.taskId} not found on blockchain`);
          continue;
        }

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
