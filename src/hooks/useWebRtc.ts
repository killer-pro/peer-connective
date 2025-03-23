
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SignalingMessage } from '@/types/call';
import { WebSocketService, createCallWebSocket } from '@/services/websocket';
import CallService from '@/services/callService';

interface UseWebRTCOptions {
  callId: string;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onCallConnected?: () => void;
  onCallStarted?: () => void;
  onCallEnded?: () => void;
  onError?: (error: Error) => void;
}

export function useWebRTC({
  callId,
  localVideoRef,
  remoteVideoRef,
  onCallConnected,
  onCallStarted,
  onCallEnded,
  onError
}: UseWebRTCOptions) {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const websocketRef = useRef<WebSocketService | null>(null);
  
  const userId = Number(localStorage.getItem('userId') || '0');
  
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
          call: parseInt(callId),
          sender: userId,
          receiver: 0, // Will be set properly later
          candidate: event.candidate.toJSON()
        };
        
        // Only send if we have a proper receiver (should be set by the offer/answer process)
        if (message.receiver !== 0 && websocketRef.current) {
          websocketRef.current.send(message);
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
        if (onCallConnected) onCallConnected();
      } else if (peerConnection.connectionState === 'disconnected' || 
                 peerConnection.connectionState === 'failed' || 
                 peerConnection.connectionState === 'closed') {
        setIsConnected(false);
        if (onCallEnded) onCallEnded();
      }
    };
    
    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
        }
      }
      remoteStreamRef.current.addTrack(event.track);
    };
    
    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [callId, userId, onCallConnected, onCallEnded, remoteVideoRef]);
  
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
      
      // Set local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Add tracks to peer connection
      if (peerConnectionRef.current) {
        stream.getTracks().forEach(track => {
          if (peerConnectionRef.current && localStreamRef.current) {
            peerConnectionRef.current.addTrack(track, localStreamRef.current);
          }
        });
      }
      
      return stream;
    } catch (error) {
      console.error('Error getting user media:', error);
      toast.error('Could not access camera/microphone. Please check permissions.');
      if (onError) onError(error as Error);
      throw error;
    }
  }, [localVideoRef, onError]);
  
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
        await getMediaStream(videoActive);
      }
      
      // Create answer
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      // Send answer
      if (websocketRef.current) {
        websocketRef.current.send({
          type: 'answer',
          call: parseInt(callId),
          sender: userId,
          receiver: message.sender,
          sdp: peerConnectionRef.current.localDescription
        });
      }
      
      setIsReceivingCall(false);
    } catch (error) {
      console.error('Error handling offer:', error);
      toast.error('Failed to process call offer.');
      if (onError) onError(error as Error);
    }
  }, [callId, videoActive, getMediaStream, userId, onError]);
  
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
      if (onError) onError(error as Error);
    }
  }, [onError]);
  
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
      if (onError) onError(error as Error);
    }
  }, [onError]);
  
  // Initialize call
  const initializeCall = useCallback(async (asInitiator: boolean = false) => {
    try {
      console.log(`Initializing call ${callId} as ${asInitiator ? 'initiator' : 'participant'}`);
      
      // Setup WebSocket
      if (!websocketRef.current) {
        websocketRef.current = createCallWebSocket(callId, {
          onMessage: handleSignalingMessage,
          reconnect: true
        });
      }
      
      // Setup peer connection
      setupPeerConnection();
      
      // Get media stream
      await getMediaStream(videoActive);
      
      if (asInitiator && peerConnectionRef.current) {
        // Create offer
        const offer = await peerConnectionRef.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: videoActive
        });
        
        await peerConnectionRef.current.setLocalDescription(offer);
        
        // Find participants from the call
        const callData = await CallService.getCallDetails(parseInt(callId));
        const participants = callData.participants_details;
        
        // Send offer to all participants
        if (websocketRef.current && participants.length > 0) {
          // Send to first participant for now
          const firstParticipant = participants[0];
          
          websocketRef.current.send({
            type: 'offer',
            call: parseInt(callId),
            sender: userId,
            receiver: firstParticipant.user,
            sdp: peerConnectionRef.current.localDescription
          });
        }
      }
      
      if (onCallStarted) onCallStarted();
      
    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Failed to initialize call. Please try again.');
      if (onError) onError(error as Error);
    }
  }, [callId, videoActive, getMediaStream, setupPeerConnection, handleSignalingMessage, userId, onCallStarted, onError]);
  
  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      
      setMicActive(audioTracks.length > 0 ? audioTracks[0].enabled : false);
    }
  }, []);
  
  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      
      setVideoActive(videoTracks.length > 0 ? videoTracks[0].enabled : false);
    }
  }, []);
  
  // Send chat message
  const sendChatMessage = useCallback((content: string) => {
    if (websocketRef.current && callId) {
      websocketRef.current.send({
        type: 'chat',
        call: parseInt(callId),
        sender: userId,
        content
      });
      
      return true;
    }
    return false;
  }, [callId, userId]);
  
  // End call
  const endCall = useCallback(async () => {
    console.log('Ending call');
    
    // Close media streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Close WebSocket
    if (websocketRef.current) {
      websocketRef.current.disconnect();
      websocketRef.current = null;
    }
    
    setIsConnected(false);
    setIsCalling(false);
    setIsReceivingCall(false);
    
    // Update call status in the backend
    if (callId) {
      try {
        await CallService.endCall(parseInt(callId));
      } catch (error) {
        console.error('Error ending call on server:', error);
      }
    }
    
    // Notify parent component
    if (onCallEnded) {
      onCallEnded();
    }
    
  }, [callId, onCallEnded]);
  
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
      
      // Close WebSocket
      if (websocketRef.current) {
        websocketRef.current.disconnect();
      }
    };
  }, []);
  
  return {
    isConnected,
    isCalling,
    isReceivingCall,
    micActive,
    videoActive,
    initializeCall,
    toggleMicrophone,
    toggleVideo,
    sendChatMessage,
    endCall,
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
  };
}

export default useWebRTC;
