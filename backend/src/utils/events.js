/**
 * Event Bus Utility
 * Standardizes real-time event emission across the application
 */

import { io } from '../index.js';

export const EventTypes = {
    // Task Events
    TASK_CREATED: 'TASK_CREATED',
    TASK_UPDATED: 'TASK_UPDATED',
    TASK_COMPLETED: 'TASK_COMPLETED',

    // Agent Events
    AGENT_UPDATED: 'AGENT_UPDATED',
    AGENT_STATUS_CHANGED: 'AGENT_STATUS_CHANGED',
    AGENT_CALLED: 'AGENT_CALLED',

    // System Events
    SYSTEM_NOTIFICATION: 'SYSTEM_NOTIFICATION',

    // Chat Events (handled in chat routes, but listed here for reference)
    CHAT_MESSAGE: 'MESSAGE'
};

/**
 * Emit a task update event
 * @param {string} taskId - The ID of the task
 * @param {string} type - Event type (from EventTypes)
 * @param {Object} data - Payload data
 */
export const emitTaskEvent = (taskId, type, data) => {
    if (!io) return;

    // Emit to specific task room (if anyone is watching this task)
    io.to(`task:${taskId}`).emit('message', {
        type,
        data
    });

    // Also emit to global tasks room for dashboards
    io.to('tasks:global').emit('message', {
        type,
        data: { ...data, taskId }
    });
};

/**
 * Emit an agent update event
 * @param {string} agentId - The ID of the agent
 * @param {string} type - Event type
 * @param {Object} data - Payload data
 */
export const emitAgentEvent = (agentId, type, data) => {
    if (!io) return;

    io.to(`agent:${agentId}`).emit('message', {
        type,
        data
    });

    io.to('agents:global').emit('message', {
        type,
        data: { ...data, agentId }
    });
};

/**
 * Emit a notification to a specific user
 * @param {string} userId - The user's address or ID
 * @param {Object} notification - Notification data
 */
export const emitUserEvent = (userId, notification) => {
    if (!io) return;

    io.to(`user:${userId.toLowerCase()}`).emit('message', {
        type: EventTypes.SYSTEM_NOTIFICATION,
        data: notification
    });
};

/**
 * Emit a global system event
 * @param {string} type - Event type
 * @param {Object} data - Payload data
 */
export const emitSystemEvent = (type, data) => {
    if (!io) return;

    io.to('system:global').emit('message', {
        type,
        data
    });
};
