
import { toast } from "sonner";

export type WebSocketMessageHandler = (data: any) => void;
export type WebSocketStatusHandler = () => void;

interface WebSocketOptions {
  onOpen?: WebSocketStatusHandler;
  onClose?: WebSocketStatusHandler;
  onError?: (event: Event) => void;
  onMessage?: WebSocketMessageHandler;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private options: WebSocketOptions;
  private reconnectAttempts = 0;
  private reconnectTimeout: number | null = null;
  private messageHandlers: Map<string, WebSocketMessageHandler[]> = new Map();
  
  constructor(url: string, options: WebSocketOptions = {}) {
    this.url = url;
    this.options = {
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...options
    };
  }
  
  connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.warn("WebSocket is already connected");
      return;
    }
    
    console.log(`WebSocketService: Connecting to ${this.url}`);
    this.socket = new WebSocket(this.url);
    
    this.socket.onopen = () => {
      console.log(`WebSocketService: Connected to ${this.url}`);
      this.reconnectAttempts = 0;
      
      if (this.options.onOpen) {
        this.options.onOpen();
      }
    };
    
    this.socket.onclose = (event) => {
      console.log(`WebSocketService: Disconnected from ${this.url} (code: ${event.code}, reason: ${event.reason})`);
      
      if (this.options.onClose) {
        this.options.onClose();
      }
      
      // Attempt to reconnect if enabled
      if (this.options.reconnect && 
          (!this.options.maxReconnectAttempts || 
           this.reconnectAttempts < this.options.maxReconnectAttempts)) {
        this.reconnectTimeout = window.setTimeout(() => {
          this.reconnectAttempts++;
          console.log(`WebSocketService: Attempting to reconnect (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);
          this.connect();
        }, this.options.reconnectInterval);
      } else if (this.reconnectAttempts >= (this.options.maxReconnectAttempts || 0)) {
        toast.error("The connection to the server has been lost. Please refresh the page.");
      }
    };
    
    this.socket.onerror = (event) => {
      console.error(`WebSocketService: Error on ${this.url}`, event);
      
      if (this.options.onError) {
        this.options.onError(event);
      }
    };
    
    this.socket.onmessage = (event) => {
      let data;
      
      try {
        data = JSON.parse(event.data);
        console.log(`WebSocketService: Message received from ${this.url}:`, data);
      } catch (error) {
        console.error(`WebSocketService: Failed to parse WebSocket message from ${this.url}:`, error);
        return;
      }
      
      // Global message handler
      if (this.options.onMessage) {
        this.options.onMessage(data);
      }
      
      // Type-specific handlers
      if (data.type && this.messageHandlers.has(data.type)) {
        const handlers = this.messageHandlers.get(data.type) || [];
        handlers.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error(`WebSocketService: Error in message handler for type ${data.type}:`, error);
          }
        });
      }
    };
  }
  
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      console.log(`WebSocketService: Closing connection to ${this.url}`);
      this.socket.close();
      this.socket = null;
    }
  }
  
  send(data: unknown): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error(`WebSocketService: Cannot send message to ${this.url}: WebSocket is not connected`);
      return false;
    }
    
    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      console.log(`WebSocketService: Sending message to ${this.url}:`, message);
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error(`WebSocketService: Failed to send WebSocket message to ${this.url}:`, error);
      return false;
    }
  }
  
  subscribe(type: string, handler: WebSocketMessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    const handlers = this.messageHandlers.get(type) || [];
    
    if (!handlers.includes(handler)) {
      handlers.push(handler);
    }
    
    console.log(`WebSocketService: Subscribed to message type '${type}' on ${this.url}`);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type) || [];
      const index = handlers.indexOf(handler);
      
      if (index !== -1) {
        handlers.splice(index, 1);
        console.log(`WebSocketService: Unsubscribed from message type '${type}' on ${this.url}`);
      }
      
      if (handlers.length === 0) {
        this.messageHandlers.delete(type);
      }
    };
  }
  
  isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Création d'une instance pour les appels vidéo
export const createCallWebSocket = (callId: string, options?: WebSocketOptions) => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = import.meta.env.VITE_WS_HOST || window.location.host;
  const wsUrl = `${wsProtocol}//${wsHost}/ws/call/${callId}/`;
  
  return new WebSocketService(wsUrl, options);
};
