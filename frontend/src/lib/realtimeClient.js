/**
 * Real-time Communication Client
 * Socket.io client for AetheraOS
 */

import { io } from 'socket.io-client';

/**
 * WebSocket client for room-based real-time communication
 */
export class EdenlayerWebSocketClient {
  constructor(roomId, authConfig) {
    this.roomId = roomId;
    this.authConfig = authConfig;
    this.socket = null;
    this.listeners = new Map();
  }

  /**
   * Connect to WebSocket
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const baseUrl = apiUrl.replace('/api', '');

        this.socket = io(baseUrl, {
          withCredentials: true,
          transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
          console.log('Socket connected, joining room:', this.roomId);
          this.socket.emit('join_room', this.roomId);
          this.emit('connect');
          resolve();
        });

        this.socket.on('message', (packet) => {
          // Handle structured message from backend
          if (packet && packet.type === 'MESSAGE' && packet.data) {
            // Emit 'message' with the actual data for the chat UI
            this.emit('message', packet.data);
          } else if (packet && packet.type && packet.data) {
            // Emit other types based on their type name
            this.emit(packet.type.toLowerCase(), packet.data);
          } else {
            // Fallback for raw messages or unknown structure
            this.emit('message', packet);
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.emit('error', error);
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          this.emit('disconnect', reason);
        });

      } catch (error) {
        console.error('Error creating Socket:', error);
        reject(error);
      }
    });
  }

  /**
   * Reconnect (handled automatically by socket.io, but kept for API compatibility)
   */
  reconnect() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  /**
   * Send message (Deprecated: Use REST API)
   */
  sendMessage(content, metadata = {}) {
    console.warn('sendMessage via socket is deprecated. Use REST API.');
    // We don't emit here because backend expects REST calls for persistence
  }

  /**
   * Add event listener
   */
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  /**
   * Remove event listener
   */
  off(event, handler) {
    if (!this.listeners.has(event)) return;
    const handlers = this.listeners.get(event);
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Emit event locally
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    });
  }

  /**
   * Disconnect
   */
  disconnect() {
    if (this.socket) {
      this.socket.emit('leave_room', this.roomId);
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  /**
   * Subscribe to a specific channel/room
   * @param {string} channel - Channel name (e.g., 'tasks:global', 'agent:123')
   */
  subscribe(channel) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_room', channel);
    }
  }

  /**
   * Unsubscribe from a specific channel/room
   * @param {string} channel - Channel name
   */
  unsubscribe(channel) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_room', channel);
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

// Keep SSE Client as is or stub it if not used
export class EdenlayerSSEClient {
  constructor() { }
  connect() { return Promise.resolve(); }
  on() { }
  off() { }
  disconnect() { }
}

export function createWebSocketClient(roomId, authConfig) {
  return new EdenlayerWebSocketClient(roomId, authConfig);
}

export function createSSEClient(authConfig) {
  return new EdenlayerSSEClient(authConfig);
}
