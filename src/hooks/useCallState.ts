
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import CallService from '@/services/callService';

export interface CallState {
  status: 'connecting' | 'connected' | 'disconnected';
  chatMessages: { sender: string; content: string; timestamp: Date }[];
}

export function useCallState(callId?: string) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [chatMessages, setChatMessages] = useState<{ sender: string; content: string; timestamp: Date }[]>([]);

  const addChatMessage = useCallback((sender: string, content: string) => {
    setChatMessages(prev => [
      ...prev,
      { sender, content, timestamp: new Date() }
    ]);
  }, []);

  const endCall = useCallback(async () => {
    console.log('Ending call');
    
    setStatus('disconnected');
    
    // Call the API to end the call
    if (callId) {
      try {
        await CallService.endCall(parseInt(callId));
        console.log('Call ended successfully');
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
    
    // Navigate back to calls page
    navigate('/calls', { replace: true });
  }, [callId, navigate]);

  const handleConnectionStateChange = useCallback((state: RTCPeerConnectionState) => {
    console.log(`Peer connection state changed to ${state}`);
    
    if (state === 'connected') {
      setStatus('connected');
      toast.success('Call connected');
    } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
      setStatus('disconnected');
      
      if (state !== 'closed') {
        toast.error('Call disconnected');
        setTimeout(() => {
          endCall();
        }, 1000);
      }
    }
  }, [endCall]);

  return {
    status,
    chatMessages,
    addChatMessage,
    endCall,
    handleConnectionStateChange
  };
}
