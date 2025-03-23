
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useWebSocket } from './useWebSocket';
import { CallData } from '@/services/callService';

export const useIncomingCalls = () => {
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const navigate = useNavigate();
  
  // Connect to the incoming calls WebSocket
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = import.meta.env.VITE_WS_HOST || window.location.host;
  const wsUrl = `${wsProtocol}//${wsHost}/ws/incoming-calls/`;
  
  const handleIncomingCall = useCallback((data: any) => {
    console.log('Incoming call data received:', data);
    
    if (data.type === 'incoming_call') {
      const call = data.call as CallData;
      console.log('Setting incoming call:', call);
      setIncomingCall(call);
    }
  }, []);
  
  const { isConnected } = useWebSocket({
    url: wsUrl,
    onMessage: handleIncomingCall,
    autoConnect: true,
    reconnect: true
  });
  
  const acceptCall = useCallback((callId: number) => {
    console.log(`Accepting call ${callId}`);
    
    // Clear the incoming call state
    setIncomingCall(null);
    
    // Dismiss any remaining toasts for this call
    toast.dismiss(`call-${callId}`);
    
    // Navigate to the call page
    navigate(`/call/${callId}`);
  }, [navigate]);
  
  const rejectCall = useCallback((callId: number) => {
    console.log(`Rejecting call ${callId}`);
    
    // Send API call to reject the call
    fetch(`/api/calls/${callId}/reject/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('auth_token')}`
      }
    }).catch(error => {
      console.error('Error rejecting call:', error);
    });
    
    // Clear the incoming call state
    setIncomingCall(null);
    
    // Dismiss any remaining toasts for this call
    toast.dismiss(`call-${callId}`);
  }, []);
  
  useEffect(() => {
    // Log connection status
    console.log('Incoming calls WebSocket connected:', isConnected);
  }, [isConnected]);
  
  return {
    incomingCall,
    acceptCall,
    rejectCall,
    isConnected
  };
};

export default useIncomingCalls;
