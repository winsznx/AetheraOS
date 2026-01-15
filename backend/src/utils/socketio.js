/**
 * Socket.io Instance Module
 * Separated to avoid circular dependencies
 */

let io = null;

/**
 * Set the Socket.io instance
 * @param {Object} socketIo - The Socket.io server instance
 */
export function setSocketIO(socketIo) {
    io = socketIo;
}

/**
 * Get the Socket.io instance
 * @returns {Object|null} The Socket.io server instance
 */
export function getSocketIO() {
    return io;
}

export default { setSocketIO, getSocketIO };
