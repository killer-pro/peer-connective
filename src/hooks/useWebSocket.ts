
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
  
  // Fonction pour se connecter
  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.connect();
    }
  }, []);
  
  // Fonction pour se déconnecter
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
    }
  }, []);
  
  // Fonction pour envoyer un message
  const send = useCallback((data: unknown) => {
    if (wsRef.current) {
      return wsRef.current.send(data);
    }
    return false;
  }, []);
  
  // Fonction pour s'abonner à un type de message spécifique
  const subscribe = useCallback((type: string, handler: WebSocketMessageHandler) => {
    if (wsRef.current) {
      return wsRef.current.subscribe(type, handler);
    }
    return () => {};
  }, []);
  
  // Effet pour gérer la connexion WebSocket
  useEffect(() => {
    const handleOpen = () => {
      setIsConnected(true);
      if (onOpen) onOpen();
    };
    
    const handleClose = () => {
      setIsConnected(false);
      if (onClose) onClose();
    };
    
    wsRef.current = new WebSocketService(url, {
      onOpen: handleOpen,
      onClose: handleClose,
      onError,
      onMessage,
      reconnect,
      reconnectInterval,
      maxReconnectAttempts
    });
    
    if (autoConnect) {
      wsRef.current.connect();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [url, ...dependencies]);
  
  return {
    isConnected,
    connect,
    disconnect,
    send,
    subscribe
  };
};

// Hook pour les appels vidéo
export const useCallWebSocket = (callId: string, options: Omit<UseWebSocketOptions, 'url'> = {}) => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = import.meta.env.VITE_WS_HOST || window.location.host;
  const wsUrl = `${wsProtocol}//${wsHost}/ws/call/${callId}/`;
  
  return useWebSocket({ ...options, url: wsUrl });
};

// Hook pour la signalisation WebRTC
export const useSignalingWebSocket = (callId: string, options: Omit<UseWebSocketOptions, 'url'> = {}) => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = import.meta.env.VITE_WS_HOST || window.location.host;
  const wsUrl = `${wsProtocol}//${wsHost}/ws/signaling/${callId}/`;
  
  return useWebSocket({ ...options, url: wsUrl });
};
