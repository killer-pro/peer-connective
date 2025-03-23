
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SignalingMessage } from '@/types/call';
import { websocketService } from '@/services/websocket';
import { callService } from '@/services/callService';

interface UseWebRTCOptions {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onCallEnded?: () => void;
}

export function useWebRTC(callId: number | null, options: UseWebRTCOptions = {}) {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('video');
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  
  const userId = Number(localStorage.getItem('userId'));
  
  // Function to create and setup the peer connection
  const setupPeerConnection = useCallback(() => {
    console.log('Setting up peer connection');
    
    // Create peer connection with STUN/TURN servers
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    });
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && callId) {
        console.log('Sending ICE candidate:', event.candidate);
        
        const message: SignalingMessage = {
          type: 'ice-candidate',
          call: callId,
          sender: userId,
          receiver: 0, // Will be set properly later
          candidate: event.candidate.toJSON()
        };
        
        // Only send if we have a proper receiver (should be set by the offer/answer process)
        if (message.receiver !== 0) {
          // Try WebSocket first, fall back to HTTP
          if (websocketService.isConnected()) {
            websocketService.send(message);
          } else {
            callService.sendIceCandidate(callId, message.receiver, event.candidate.toJSON());
          }
        }
      }
    };
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        setIsConnected(true);
        setIsCalling(false);
        setIsReceivingCall(false);
      } else if (peerConnection.connectionState === 'disconnected' || 
                 peerConnection.connectionState === 'failed' || 
                 peerConnection.connectionState === 'closed') {
        setIsConnected(false);
        if (options.onCallEnded) {
          options.onCallEnded();
        }
      }
    };
    
    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
        if (options.onRemoteStream) {
          options.onRemoteStream(remoteStreamRef.current);
        }
      }
      remoteStreamRef.current.addTrack(event.track);
    };
    
    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [callId, userId, options]);
  
  // Function to get media stream
  const getMediaStream = useCallback(async (isVideo: boolean) => {
    try {
      const constraints = {
        audio: true,
        video: isVideo
      };
      
      console.log('Getting media stream with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      
      // Add tracks to peer connection
      if (peerConnectionRef.current) {
        stream.getTracks().forEach(track => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, stream);
          }
        });
      }
      
      // Notify parent component
      if (options.onLocalStream) {
        options.onLocalStream(stream);
      }
      
      return stream;
    } catch (error) {
      console.error('Error getting user media:', error);
      toast.error('Could not access camera/microphone. Please check permissions.');
      throw error;
    }
  }, [options]);
  
  // Function to poll for signaling messages
  const startPolling = useCallback(() => {
    if (!callId) return;
    
    console.log('Starting polling for signaling messages');
    
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Start new polling interval
    pollingIntervalRef.current = window.setInterval(async () => {
      if (!websocketService.isConnected()) {
        try {
          const messages = await callService.pollSignalingMessages(callId);
          
          messages.forEach(async (message) => {
            console.log('Received message via polling:', message.type);
            handleSignalingMessage(message);
          });
        } catch (error) {
          console.error('Error polling for messages:', error);
        }
      }
    }, 2000) as unknown as number;  // Poll every 2 seconds
  }, [callId]);
  
  // Function to handle signaling messages
  const handleSignalingMessage = useCallback((message: SignalingMessage) => {
    if (!peerConnectionRef.current) return;
    
    console.log('Handling signaling message:', message.type);
    
    switch (message.type) {
      case 'offer':
        if (message.sdp) {
          handleOffer(message);
        }
        break;
        
      case 'answer':
        if (message.sdp) {
          handleAnswer(message);
        }
        break;
        
      case 'ice-candidate':
        if (message.candidate) {
          handleIceCandidate(message);
        }
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }, []);
  
  // Handle incoming offer
  const handleOffer = useCallback(async (message: SignalingMessage) => {
    if (!peerConnectionRef.current || !callId) return;
    
    try {
      console.log('Handling offer:', message);
      
      // Set remote description
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.sdp));
      
      // Get local stream if not already available
      if (!localStreamRef.current) {
        await getMediaStream(callType === 'video');
      }
      
      // Create answer
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      // Send answer
      if (websocketService.isConnected()) {
        websocketService.send({
          type: 'answer',
          call: callId,
          sender: userId,
          receiver: message.sender,
          sdp: peerConnectionRef.current.localDescription
        });
      } else {
        await callService.sendAnswer(callId, message.sender, peerConnectionRef.current.localDescription!);
      }
      
      setIsReceivingCall(false);
    } catch (error) {
      console.error('Error handling offer:', error);
      toast.error('Failed to process call offer.');
    }
  }, [callId, callType, getMediaStream, userId]);
  
  // Handle incoming answer
  const handleAnswer = useCallback(async (message: SignalingMessage) => {
    if (!peerConnectionRef.current) return;
    
    try {
      console.log('Handling answer:', message);
      
      // Set remote description
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.sdp));
      
      setIsCalling(false);
    } catch (error) {
      console.error('Error handling answer:', error);
      toast.error('Failed to establish call connection.');
    }
  }, []);
  
  // Handle incoming ICE candidate
  const handleIceCandidate = useCallback((message: SignalingMessage) => {
    if (!peerConnectionRef.current) return;
    
    try {
      console.log('Handling ICE candidate:', message);
      
      // Add ICE candidate
      const candidate = new RTCIceCandidate(message.candidate);
      peerConnectionRef.current.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);
  
  // Function to start a call
  const startCall = useCallback(async (recipientId: number, type: 'audio' | 'video') => {
    if (!callId) {
      console.error('Cannot start call: No call ID provided');
      return;
    }
    
    try {
      console.log(`Starting ${type} call to user ${recipientId}`);
      setCallType(type);
      setIsCalling(true);
      
      // Setup peer connection if not already done
      const peerConnection = peerConnectionRef.current || setupPeerConnection();
      
      // Get local media stream
      await getMediaStream(type === 'video');
      
      // Create and send offer
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true, 
        offerToReceiveVideo: type === 'video'
      });
      
      await peerConnection.setLocalDescription(offer);
      
      if (websocketService.isConnected()) {
        websocketService.send({
          type: 'offer',
          call: callId,
          sender: userId,
          receiver: recipientId,
          sdp: peerConnection.localDescription
        });
      } else {
        await callService.sendOffer(callId, recipientId, peerConnection.localDescription!);
      }
      
      // Start polling for responses
      startPolling();
      
    } catch (error) {
      console.error('Error starting call:', error);
      setIsCalling(false);
      toast.error('Failed to start call. Please try again.');
    }
  }, [callId, getMediaStream, setupPeerConnection, startPolling, userId]);
  
  // Function to answer a call
  const answerCall = useCallback(async (callId: number, callDetails: any) => {
    try {
      console.log('Answering call:', callDetails);
      navigate(`/call?id=${callId}`);
    } catch (error) {
      console.error('Error answering call:', error);
      toast.error('Failed to answer call.');
    }
  }, [navigate]);
  
  // Function to end the call
  const endCall = useCallback(async () => {
    console.log('Ending call');
    
    // Close media streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setIsConnected(false);
    setIsCalling(false);
    setIsReceivingCall(false);
    
    // Update call status in the backend
    if (callId) {
      try {
        await callService.endCall(callId);
      } catch (error) {
        console.error('Error ending call on server:', error);
      }
    }
    
    // Notify parent component
    if (options.onCallEnded) {
      options.onCallEnded();
    }
    
  }, [callId, options]);
  
  // Set up WebSocket message handler
  useEffect(() => {
    if (!callId) return;
    
    console.log('Setting up WebSocket message handler for call:', callId);
    
    // Handler for WebSocket messages
    const handleWebSocketMessage = (data: any) => {
      if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice-candidate') {
        console.log('Received WebSocket message:', data.type);
        handleSignalingMessage(data);
      }
    };
    
    // Connect to WebSocket for this call
    websocketService.connect(`ws/signaling/${callId}/`);
    websocketService.onMessage(handleWebSocketMessage);
    
    // Start polling as fallback
    startPolling();
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Disconnect from WebSocket
      websocketService.onMessage(null);
      websocketService.disconnect();
    };
  }, [callId, handleSignalingMessage, startPolling]);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Close media streams
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      // Clear polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
  
  return {
    isConnected,
    isCalling,
    isReceivingCall,
    startCall,
    answerCall,
    endCall,
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
  };
}

export default useWebRTC;
