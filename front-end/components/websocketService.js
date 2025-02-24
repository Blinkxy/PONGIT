class WebSocketService {
    constructor() {
      this.socket = null;
      this.callbacks = {
        onMessage: null,
        onError: null,
        onClose: null,
        onOpen: null,
      };
    }
    // Establish WebSocket connection only if not already connected
    connect(url, token) {
      // Check if socket is already created to prevent multiple connections
      if (this.socket && this.socket.readyState === WebSocket.OPEN && this.socket.url === `${url}?token=${token}`) {
        console.log('WebSocket connection already established.');
        return; // Return early if the connection already exists
      }
  
      this.socket = new WebSocket(`${url}?token=${token}`);
      console.log('WebSocket connection created.');
      console.log('url', `${url}?token=${token}`);
  
      this.socket.onopen = () => {
        console.log('WebSocket is connected.');
        if (this.callbacks.onOpen) this.callbacks.onOpen();
      };
  
      this.socket.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        if (this.callbacks.onMessage) this.callbacks.onMessage(messageData);
      };
  
      this.socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        if (this.callbacks.onError) this.callbacks.onError(error);
      };
  
      this.socket.onclose = () => {
        console.log('BIG WebSocket connection closed.');
        if (this.callbacks.onClose) this.callbacks.onClose();
      };
    }
  
    // Set callback functions for different events
    setCallbacks({ onMessage, onError, onClose, onOpen }) {
      if (onMessage) this.callbacks.onMessage = onMessage;
      if (onError) this.callbacks.onError = onError;
      if (onClose) this.callbacks.onClose = onClose;
      if (onOpen) this.callbacks.onOpen = onOpen;
    }
  
    // Send a message through WebSocket
    sendMessage(message) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      } else {
        console.error('WebSocket is not open.');
      }
    }
  
    // Close the WebSocket connection
    closeConnection() {
      if (this.socket) {
        this.socket.close();
        this.socket = null; // Reset the socket after closing
      }
    }
  }
  // Export a singleton instance of WebSocketService
  const webSocketService = new WebSocketService();
  export default webSocketService;
  