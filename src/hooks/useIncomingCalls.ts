
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCallWebSocket } from './useWebSocket';
import { CallData } from '@/services/callService';

export const useIncomingCalls = () => {
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const navigate = useNavigate();
  const authToken = localStorage.getItem('auth_token');

  // Connect to the incoming calls WebSocket
  const { isConnected, send } = useCallWebSocket({
    onMessage: handleIncomingCall,
    autoConnect: true,
    reconnect: true
  });

  function handleIncomingCall(data: any) {
    console.log('Incoming call data received:', data);
    
    if (data.type === 'incoming_call') {
      const call = data.call as CallData;
      console.log('Setting incoming call:', call);
      setIncomingCall(call);
    }
  }
  
  const acceptCall = useCallback((callId: number) => {
    console.log(`Accepting call ${callId}`);
    
    // Clear the incoming call state
    setIncomingCall(null);
    
    // Dismiss any remaining toasts for this call
    toast.dismiss(`call-${callId}`);
    
    // Navigate to the call page
    navigate(`/call/${callId}`, { state: { isInitiator: false } });
  }, [navigate]);
  
  const rejectCall = useCallback((callId: number) => {
    console.log(`Rejecting call ${callId}`);
    
    // Send API call to reject the call
    fetch(`/api/calls/${callId}/reject/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
      }
    }).catch(error => {
      console.error('Error rejecting call:', error);
    });
    
    // Clear the incoming call state
    setIncomingCall(null);
    
    // Dismiss any remaining toasts for this call
    toast.dismiss(`call-${callId}`);
  }, [authToken]);
  
  const initiateCall = useCallback((userId: number) => {
    console.log(`Initiating call to user ${userId}`);

    // Send API call to start the call
    return fetch(`/api/calls/initiate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
      },
      body: JSON.stringify({ recipient_id: userId })
    })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to initiate call');
          }
          return response.json();
        })
        .then(data => {
          console.log('Call initiated successfully:', data);
          // Navigate to the call page as initiator
          navigate(`/call/${data.id}`, { state: { isInitiator: true } });
          return data;
        })
        .catch(error => {
          console.error('Error initiating call:', error);
          toast.error('Failed to initiate call. Please try again.');
          throw error;
        });
  }, [navigate, authToken]);

  useEffect(() => {
    // Log connection status
    console.log('Incoming calls WebSocket connected:', isConnected);
  }, [isConnected]);

  return {
    incomingCall,
    acceptCall,
    rejectCall,
    isConnected,
    initiateCall
  };
};

export default useIncomingCalls;
