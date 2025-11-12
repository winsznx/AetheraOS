/**
 * Real-time Communication Client
 * WebSocket and SSE utilities for Edenlayer Protocol
 * Based on official Edenlayer documentation
 */

/**
 * WebSocket client for room-based real-time communication
 */
export class EdenlayerWebSocketClient {
  constructor(roomId, authConfig) {
    this.roomId = roomId;
    this.authConfig = authConfig; // { apiKey } or { sessionToken, identityToken }
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  /**
   * Connect to WebSocket
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        const baseUrl = import.meta.env.VITE_EDENLAYER_API_URL || 'https://api.edenlayer.com';
        const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');

        let url = `${wsUrl}/parties/chat-server/${this.roomId}`;

        // Add authentication
        if (this.authConfig.apiKey) {
          url += `?api-key=${encodeURIComponent(this.authConfig.apiKey)}`;
        } else if (this.authConfig.sessionToken && this.authConfig.identityToken) {
          const params = new URLSearchParams({
            Authorization: `Bearer ${this.authConfig.sessionToken}`,
            'X-Identity-Token': this.authConfig.identityToken
          });
          url += `?${params}`;
        }

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket connected to room:', this.roomId);
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.emit('connect');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.emit('message', message);

            // Emit specific message type events
            if (message.type) {
              this.emit(message.type.toLowerCase(), message.data);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            this.emit('error', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.emit('disconnect', { code: event.code, reason: event.reason });

          // Auto-reconnect if not closed intentionally
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect();
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Reconnect to WebSocket with exponential backoff
   */
  reconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Send message to room
   * @param {string} content - Message content
   * @param {Object} [metadata] - Optional metadata
   */
  sendMessage(content, metadata = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const message = {
      type: 'MESSAGE',
      data: {
        content,
        metadata
      }
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
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
   * Emit event to all listeners
   * @private
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
   * Close WebSocket connection
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    this.listeners.clear();
  }

  /**
   * Check if WebSocket is connected
   * @returns {boolean}
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

/**
 * Server-Sent Events (SSE) client for real-time updates
 */
export class EdenlayerSSEClient {
  constructor(authConfig) {
    this.authConfig = authConfig; // { apiKey } or { sessionToken, identityToken }
    this.eventSource = null;
    this.listeners = new Map();
  }

  /**
   * Connect to SSE endpoint
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        const baseUrl = import.meta.env.VITE_EDENLAYER_API_URL || 'https://api.edenlayer.com';
        let url = `${baseUrl}/sse`;

        // Add authentication
        if (this.authConfig.apiKey) {
          url += `?api-key=${encodeURIComponent(this.authConfig.apiKey)}`;
        }

        this.eventSource = new EventSource(url);

        this.eventSource.onopen = () => {
          console.log('SSE connected');
          this.emit('connect');
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit('message', data);

            // Emit specific event types
            if (data.type) {
              this.emit(data.type.toLowerCase(), data);
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
            this.emit('error', error);
          }
        };

        this.eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          this.emit('error', error);

          // EventSource automatically reconnects, but we can handle specific errors
          if (this.eventSource.readyState === EventSource.CLOSED) {
            this.emit('disconnect');
          }
        };
      } catch (error) {
        console.error('Error creating SSE connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
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
   * Emit event to all listeners
   * @private
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
   * Close SSE connection
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.listeners.clear();
  }

  /**
   * Check if SSE is connected
   * @returns {boolean}
   */
  isConnected() {
    return this.eventSource && this.eventSource.readyState === EventSource.OPEN;
  }
}

/**
 * Create a WebSocket client for a room
 * @param {string} roomId - Room ID
 * @param {Object} authConfig - Authentication configuration
 * @returns {EdenlayerWebSocketClient}
 */
export function createWebSocketClient(roomId, authConfig) {
  return new EdenlayerWebSocketClient(roomId, authConfig);
}

/**
 * Create an SSE client
 * @param {Object} authConfig - Authentication configuration
 * @returns {EdenlayerSSEClient}
 */
export function createSSEClient(authConfig) {
  return new EdenlayerSSEClient(authConfig);
}
