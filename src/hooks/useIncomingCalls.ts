
import { useEffect, useState } from 'react';
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
  
  const { isConnected } = useWebSocket({
    url: wsUrl,
    onMessage: handleIncomingCall,
    autoConnect: true,
    reconnect: true
  });
  
  function handleIncomingCall(data: any) {
    console.log('Incoming call data received:', data);
    
    if (data.type === 'incoming_call') {
      const call = data.call as CallData;
      setIncomingCall(call);
      
      // Show a toast notification
      toast.info(`Incoming ${call.call_type} call from ${call.initiator_details.username}`, {
        duration: 20000,
        action: {
          label: 'Answer',
          onClick: () => acceptCall(call.id),
        },
        onDismiss: () => rejectCall(call.id),
      });
    }
  }
  
  const acceptCall = (callId: number) => {
    navigate(`/call/${callId}`);
    setIncomingCall(null);
  };
  
  const rejectCall = (callId: number) => {
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
    
    setIncomingCall(null);
  };
  
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
