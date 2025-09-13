import { io } from 'socket.io-client';

// Environment configuration
const config = {
  API_BASE_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://wildlife-photography-backend.azurewebsites.net'
}

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(url = config.SOCKET_URL) {
    if (!url) {
      console.log('Socket service disabled - no URL configured')
      return null
    }
    
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    console.log('Connecting to Socket.IO server at:', url);
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server with ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server. Reason:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting from Socket.IO server');
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Listen for new sighting events
  onNewSighting(callback) {
    if (!this.socket) {
      console.error('Socket not connected. Call connect() first.');
      return;
    }

    console.log('Setting up listener for new sightings');
    this.socket.on('newSighting', (data) => {
      console.log('Received new sighting:', data);
      callback(data);
    });

    // Store the callback for cleanup
    this.listeners.set('newSighting', callback);
  }

  // Remove listener for new sighting events
  offNewSighting() {
    if (this.socket && this.listeners.has('newSighting')) {
      this.socket.off('newSighting');
      this.listeners.delete('newSighting');
      console.log('Removed new sighting listener');
    }
  }

  // Get connection status
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Get socket ID
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
