
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
    
    this.socket = new WebSocket(this.url);
    
    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      
      if (this.options.onOpen) {
        this.options.onOpen();
      }
    };
    
    this.socket.onclose = (event) => {
      console.log(`WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`);
      
      if (this.options.onClose) {
        this.options.onClose();
      }
      
      // Tentative de reconnexion si activée
      if (this.options.reconnect && 
          (!this.options.maxReconnectAttempts || 
           this.reconnectAttempts < this.options.maxReconnectAttempts)) {
        this.reconnectTimeout = window.setTimeout(() => {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);
          this.connect();
        }, this.options.reconnectInterval);
      } else if (this.reconnectAttempts >= (this.options.maxReconnectAttempts || 0)) {
        toast.error("La connexion au serveur a été perdue. Veuillez rafraîchir la page.");
      }
    };
    
    this.socket.onerror = (event) => {
      console.error("WebSocket error:", event);
      
      if (this.options.onError) {
        this.options.onError(event);
      }
    };
    
    this.socket.onmessage = (event) => {
      let data;
      
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
        return;
      }
      
      // Traitement global des messages
      if (this.options.onMessage) {
        this.options.onMessage(data);
      }
      
      // Traitement des gestionnaires spécifiques
      if (data.type && this.messageHandlers.has(data.type)) {
        const handlers = this.messageHandlers.get(data.type) || [];
        handlers.forEach(handler => handler(data));
      }
    };
  }
  
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  
  send(data: unknown): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("Cannot send message: WebSocket is not connected");
      return false;
    }
    
    try {
      this.socket.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Failed to send WebSocket message:", error);
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
    
    // Retourne une fonction pour se désabonner
    return () => {
      const handlers = this.messageHandlers.get(type) || [];
      const index = handlers.indexOf(handler);
      
      if (index !== -1) {
        handlers.splice(index, 1);
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
