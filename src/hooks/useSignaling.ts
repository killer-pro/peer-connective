
import { useCallback, useEffect, useState } from 'react';
import { useSignalingWebSocket } from './useWebSocket';
import { SignalingMessage } from '@/types/call';

interface UseSignalingOptions {
  callId: string;
  onOffer?: (sdp: RTCSessionDescriptionInit) => void;
  onAnswer?: (sdp: RTCSessionDescriptionInit) => void;
  onIceCandidate?: (candidate: RTCIceCandidateInit) => void;
  onChatMessage?: (sender: string, content: string) => void;
  onError?: (error: Error) => void;
}

export const useSignaling = ({
  callId,
  onOffer,
  onAnswer,
  onIceCandidate,
  onChatMessage,
  onError
}: UseSignalingOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  
  // Get WebSocket connection
  const { isConnected: wsConnected, send } = useSignalingWebSocket(callId, {
    onOpen: () => {
      console.log(`Signaling WebSocket for call ${callId} connected!`);
      setIsConnected(true);
    },
    onMessage: (message) => {
      console.log(`Received signaling message for call ${callId}:`, message);
      handleSignalingMessage(message);
    },
    onError: (event) => {
      console.error(`Signaling WebSocket error for call ${callId}:`, event);
      if (onError) onError(new Error('Signaling WebSocket error'));
    },
    onClose: () => {
      console.log(`Signaling WebSocket for call ${callId} closed`);
      setIsConnected(false);
    },
    reconnect: true
  });
  
  // Handle incoming signaling messages
  const handleSignalingMessage = useCallback((message: any) => {
    if (!message || !message.type) {
      console.error('Invalid signaling message received:', message);
      return;
    }
    
    try {
      if (message.type === 'offer' && onOffer) {
        console.log('Received offer');
        onOffer(message.sdp);
      } 
      else if (message.type === 'answer' && onAnswer) {
        console.log('Received answer');
        onAnswer(message.sdp);
      } 
      else if (message.type === 'ice-candidate' && onIceCandidate) {
        console.log('Received ICE candidate');
        onIceCandidate(message.candidate);
      }
      else if (message.type === 'chat' && onChatMessage) {
        console.log('Received chat message');
        onChatMessage(message.senderName || 'Participant', message.content);
      }
    } catch (error) {
      console.error('Error processing signaling message:', error);
      if (onError) onError(error as Error);
    }
  }, [onOffer, onAnswer, onIceCandidate, onChatMessage, onError]);
  
  // Send offer
  const sendOffer = useCallback((sdp: RTCSessionDescriptionInit) => {
    if (!wsConnected) {
      console.error('Cannot send offer - WebSocket not connected');
      return false;
    }
    
    console.log('Sending offer:', sdp);
    return send({
      type: 'offer',
      callId: parseInt(callId),
      call: parseInt(callId),
      sender: localStorage.getItem('userId') || 'initiator',
      sdp
    });
  }, [wsConnected, send, callId]);
  
  // Send answer
  const sendAnswer = useCallback((sdp: RTCSessionDescriptionInit) => {
    if (!wsConnected) {
      console.error('Cannot send answer - WebSocket not connected');
      return false;
    }
    
    console.log('Sending answer:', sdp);
    return send({
      type: 'answer',
      callId: parseInt(callId),
      call: parseInt(callId),
      sender: localStorage.getItem('userId') || 'recipient',
      sdp
    });
  }, [wsConnected, send, callId]);
  
  // Send ICE candidate
  const sendIceCandidate = useCallback((candidate: RTCIceCandidate) => {
    if (!wsConnected) {
      console.error('Cannot send ICE candidate - WebSocket not connected');
      return false;
    }
    
    console.log('Sending ICE candidate:', candidate);
    return send({
      type: 'ice-candidate',
      callId: parseInt(callId),
      call: parseInt(callId),
      sender: localStorage.getItem('userId') || 'unknown',
      candidate
    });
  }, [wsConnected, send, callId]);
  
  // Send chat message
  const sendChatMessage = useCallback((content: string) => {
    if (!wsConnected) {
      console.error('Cannot send chat message - WebSocket not connected');
      return false;
    }
    
    console.log('Sending chat message:', content);
    return send({
      type: 'chat',
      callId: parseInt(callId),
      call: parseInt(callId),
      content,
      senderName: 'You' // This will be replaced by the backend with the actual username
    });
  }, [wsConnected, send, callId]);
  
  return {
    isConnected,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendChatMessage
  };
};
