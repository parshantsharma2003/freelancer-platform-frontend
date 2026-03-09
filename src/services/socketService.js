import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '');

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.connectPromise = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to Socket.io server with JWT authentication
   */
  async connect() {
    // Prevent multiple connections
    if (this.socket?.connected) {
      return true;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = new Promise((resolve) => {
      try {
        const token = localStorage.getItem('accessToken');

        if (!token) {
          // No token, socket connection impossible
          resolve(false);
          return;
        }

        const socket = io(SOCKET_URL, {
          auth: { token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 10000,
          reconnectionAttempts: this.maxReconnectAttempts,
          transports: ['websocket', 'polling']
        });

        this.socket = socket;

        // Connection success
        socket.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectPromise = null;
          console.log('[Socket] ✅ Connected:', socket.id);
          resolve(true);
        });

        // Connection error
        socket.on('connect_error', (error) => {
          this.isConnected = false;
          this.connectPromise = null;
          console.warn('[Socket] Connection error:', error.message);

          // Do not force logout on socket auth errors; keep session alive.
          if (error.message.includes('Authentication')) {
            window.dispatchEvent(
              new CustomEvent('socket:auth_error', { detail: error.message })
            );
          }
        });

        // Disconnect
        socket.on('disconnect', (reason) => {
          this.isConnected = false;
          console.log('[Socket] Disconnected:', reason);
        });

        // Generic error
        socket.on('error', (error) => {
          console.error('[Socket] Error:', error);
        });

        // Timeout if no connection within 5s
        setTimeout(() => {
          if (!this.isConnected) {
            this.connectPromise = null;
            resolve(false);
          }
        }, 5000);

      } catch (error) {
        console.warn('[Socket] Connection failed:', error.message);
        this.connectPromise = null;
        resolve(false);
      }
    });

    return this.connectPromise;
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.connectPromise = null;
      console.log('[Socket] Disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  connected() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Subscribe to socket event
   * Stores listener for cleanup
   */
  on(event, callback) {
    if (!this.socket) {
      console.warn(`[Socket] Socket not initialized, cannot listen to ${event}`);
      return;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    this.socket.on(event, callback);
    console.log(`[Socket] Subscribed to "${event}"`);
  }

  /**
   * Unsubscribe from socket event
   */
  off(event, callback) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
      const listeners = this.listeners.get(event);
      if (listeners) {
        const idx = listeners.indexOf(callback);
        if (idx > -1) listeners.splice(idx, 1);
      }
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  /**
   * Remove all listeners for an event
   */
  offAll(event) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(cb => {
      this.socket?.off(event, cb);
    });
    this.listeners.delete(event);
  }

  /**
   * Clear all listeners
   */
  removeAllListeners() {
    this.listeners.forEach((cbs, event) => {
      cbs.forEach(cb => this.socket?.off(event, cb));
    });
    this.listeners.clear();
  }

  /**
   * Emit event to server
   */
  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn(`[Socket] Not connected, cannot emit "${event}"`);
      return false;
    }
    this.socket.emit(event, data);
    return true;
  }
}

// Export singleton
const socketService = new SocketService();
export default socketService;
