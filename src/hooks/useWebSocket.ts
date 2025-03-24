
import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketService, WebSocketMessageHandler, WebSocketStatusHandler } from '@/services/websocket';

interface UseWebSocketOptions {
  url: string;
  onOpen?: WebSocketStatusHandler;
  onClose?: WebSocketStatusHandler;
  onError?: (event: Event) => void;
  onMessage?: WebSocketMessageHandler;
  autoConnect?: boolean;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  dependencies?: any[];
}

export const useWebSocket = ({
  url,
  onOpen,
  onClose,
  onError,
  onMessage,
  autoConnect = true,
  reconnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
  dependencies = []
}: UseWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocketService | null>(null);

  // Function to connect
  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.connect();
    }
  }, []);
  
  // Function to disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
    }
  }, []);
  
  // Function to send a message
  const send = useCallback((data: unknown) => {
    if (wsRef.current) {
      return wsRef.current.send(data);
    }
    return false;
  }, []);
  
  // Function to subscribe to a specific message type
  const subscribe = useCallback((type: string, handler: WebSocketMessageHandler) => {
    if (wsRef.current) {
      return wsRef.current.subscribe(type, handler);
    }
    return () => {};
  }, []);
  
  // Effect to manage WebSocket connection
  useEffect(() => {
    const handleOpen = () => {
      console.log(`WebSocket connected to ${url}`);
      setIsConnected(true);
      if (onOpen) onOpen();
    };
    
    const handleClose = () => {
      console.log(`WebSocket disconnected from ${url}`);
      setIsConnected(false);
      if (onClose) onClose();
    };
    
    const handleMessage = (data: any) => {
      console.log(`WebSocket message received from ${url}:`, data);
      if (onMessage) onMessage(data);
    };
    
    const handleError = (event: Event) => {
      console.error(`WebSocket error on ${url}:`, event);
      if (onError) onError(event);
    };
    
    wsRef.current = new WebSocketService(url, {
      onOpen: handleOpen,
      onClose: handleClose,
      onError: handleError,
      onMessage: handleMessage,
      reconnect,
      reconnectInterval,
      maxReconnectAttempts
    });
    
    if (autoConnect) {
      console.log(`Connecting WebSocket to ${url}`);
      wsRef.current.connect();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [url, onOpen, onClose, onError, onMessage, autoConnect, reconnect, reconnectInterval, maxReconnectAttempts, ...dependencies]);
  
  return {
    isConnected,
    connect,
    disconnect,
    send,
    subscribe
  };
};

// Hook for notification WebSockets - dedicated to incoming calls
export const useCallWebSocket = (options: Omit<UseWebSocketOptions, 'url'> = {}) => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const authToken = localStorage.getItem('auth_token');
  const wsHost = import.meta.env.VITE_WS_HOST || 'localhost:8000';

  const wsUrl = `${wsProtocol}//${wsHost}/ws/incoming-calls/?token=${authToken}`;

  return useWebSocket({ ...options, url: wsUrl });
};

// Hook for WebRTC signaling WebSockets - specific to an active call
export const useSignalingWebSocket = (callId: string, options: Omit<UseWebSocketOptions, 'url'> = {}) => {
  const authToken = localStorage.getItem('auth_token');
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = import.meta.env.VITE_WS_HOST || 'localhost:8000';

  // This should point to the signaling endpoint
  const wsUrl = `${wsProtocol}//${wsHost}/ws/signaling/${callId}/?token=${authToken}`;

  return useWebSocket({ 
    ...options, 
    url: wsUrl,
    // Add dependencies to ensure proper WebSocket reconnection when needed
    dependencies: [callId, authToken]
  });
};
