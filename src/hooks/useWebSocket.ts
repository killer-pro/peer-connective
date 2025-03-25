import { useEffect, useCallback, useRef, useState } from 'react';

// Mock implementation for demonstration purposes
const createMockWebSocket = (url: string) => {
  const socket = {
    url,
    readyState: WebSocket.CONNECTING,
    onopen: null as any,
    onmessage: null as any,
    onclose: null as any,
    onerror: null as any,
    send: (data: any) => {
      console.log(`[MockWebSocket] Sending data to ${url}:`, data);
      return true;
    },
    close: () => {
      console.log(`[MockWebSocket] Closing connection to ${url}`);
      if (socket.onclose) {
        socket.onclose({ code: 1000, reason: 'Normal closure', wasClean: true });
      }
      socket.readyState = WebSocket.CLOSED;
    }
  };

  // Simulate connection
  setTimeout(() => {
    socket.readyState = WebSocket.OPEN;
    if (socket.onopen) {
      socket.onopen({});
    }
  }, 500);

  return socket as unknown as WebSocket;
};

interface WebSocketOptions {
  onOpen?: (event: Event) => void;
  onMessage?: (data: any) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useWebSocket = (url: string, options: WebSocketOptions = {}) => {
  const {
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = options;

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Close existing connection if there is one
    if (socketRef.current) {
      socketRef.current.close();
    }

    try {
      console.log(`Connecting to WebSocket: ${url}`);
      
      // In a production environment, we'd use a real WebSocket
      // socketRef.current = new WebSocket(url);
      
      // For development/testing, we'll use a mock
      socketRef.current = createMockWebSocket(url);
      
      socketRef.current.onopen = (event) => {
        console.log(`WebSocket connection established: ${url}`);
        reconnectAttemptsRef.current = 0;
        setIsConnected(true);
        if (onOpen) onOpen(event);
      };
      
      socketRef.current.onmessage = (event) => {
        let data;
        try {
          data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
          data = event.data;
        }
        
        if (onMessage) onMessage(data);
      };
      
      socketRef.current.onclose = (event) => {
        console.log(`WebSocket connection closed: ${url}`, event);
        setIsConnected(false);
        
        if (onClose) onClose(event);
        
        // Attempt to reconnect if enabled and not a normal closure
        if (reconnect && event.code !== 1000 && event.code !== 1001) {
          attemptReconnect();
        }
      };
      
      socketRef.current.onerror = (event) => {
        console.error(`WebSocket error: ${url}`, event);
        if (onError) onError(event);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      if (onError) onError(new Event('error'));
    }
  }, [url, onOpen, onMessage, onClose, onError, reconnect]);

  // Attempt to reconnect
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log(`Max reconnect attempts (${maxReconnectAttempts}) reached.`);
      return;
    }
    
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
    }
    
    reconnectTimerRef.current = window.setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
      connect();
    }, reconnectInterval);
  }, [connect, maxReconnectAttempts, reconnectInterval]);

  // Send data through the WebSocket
  const send = useCallback((data: any): boolean => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message - WebSocket is not open');
      return false;
    }
    
    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      socketRef.current.send(message);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }, []);

  // Close the WebSocket connection
  const close = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  // Connect when component mounts
  useEffect(() => {
    connect();
    
    // Clean up on unmount
    return () => {
      close();
    };
  }, [connect, close]);

  return {
    isConnected,
    send,
    close
  };
};

// For signaling server specifically
export const useSignalingWebSocket = (callId: string, options: WebSocketOptions = {}) => {
  const url = `wss://api.yourdomain.com/ws/signaling/${callId}/`;
  return useWebSocket(url, options);
};
