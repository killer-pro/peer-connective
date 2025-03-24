
import { useEffect, useRef, useState, useCallback } from 'react';
import { usePeerConnection } from './usePeerConnection';
import { useMediaDevices } from './useMediaDevices';
import { useSignaling } from './useSignaling';
import { toast } from 'sonner';

interface WebRTCOptions {
  callId: string;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onCallConnected?: () => void;
  onCallEnded?: () => void;
  onCallStarted?: () => void;
  onError?: (error: Error) => void;
}

export const useWebRTC = ({
  callId,
  localVideoRef,
  remoteVideoRef,
  onCallConnected,
  onCallEnded,
  onCallStarted,
  onError
}: WebRTCOptions) => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  
  // For connection management
  const connectionTimeoutRef = useRef<number | null>(null);
  
  // Chat messages
  const [chatMessages, setChatMessages] = useState<Array<{sender: string, content: string}>>([]);
  
  // Initialize media devices
  const { 
    micActive, 
    videoActive, 
    localStream, 
    initializeDevices, 
    toggleMicrophone, 
    toggleVideo, 
    stopStream 
  } = useMediaDevices({
    onError
  });
  
  // Set up signaling
  const { 
    isConnected: signalingConnected, 
    sendOffer, 
    sendAnswer, 
    sendIceCandidate, 
    sendChatMessage 
  } = useSignaling({
    callId,
    onOffer: handleOffer,
    onAnswer: handleAnswer,
    onIceCandidate: handleIceCandidate,
    onChatMessage: handleChatMessage,
    onError
  });
  
  // Set up peer connection
  const { 
    connectionState, 
    createPeerConnection, 
    createOffer, 
    createAnswer, 
    setRemoteDescription, 
    addIceCandidate, 
    closePeerConnection 
  } = usePeerConnection({
    callId,
    onTrack: handleTrack,
    onConnectionStateChange: handleConnectionStateChange,
    onIceCandidate: handleLocalIceCandidate,
    onError,
    localStream,
    isInitiator
  });
  
  // Handle remote track
  function handleTrack(stream: MediaStream) {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
      setIsConnected(true);
      if (onCallConnected) onCallConnected();
      
      // Clear connection timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
    }
  }
  
  // Handle connection state change
  function handleConnectionStateChange(state: RTCPeerConnectionState) {
    if (state === 'connected') {
      setIsConnected(true);
      if (onCallConnected) onCallConnected();
      
      // Clear connection timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
    } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
      setIsConnected(false);
      if (onCallEnded) onCallEnded();
    }
  }
  
  // Handle local ICE candidate
  function handleLocalIceCandidate(candidate: RTCIceCandidate) {
    sendIceCandidate(candidate);
  }
  
  // Handle remote SDP offer
  async function handleOffer(sdp: RTCSessionDescriptionInit) {
    console.log('Handling remote offer');
    await setRemoteDescription(sdp);
    const answer = await createAnswer();
    if (answer) {
      sendAnswer(answer);
    }
  }
  
  // Handle remote SDP answer
  async function handleAnswer(sdp: RTCSessionDescriptionInit) {
    console.log('Handling remote answer');
    await setRemoteDescription(sdp);
  }
  
  // Handle remote ICE candidate
  async function handleIceCandidate(candidate: RTCIceCandidateInit) {
    console.log('Handling remote ICE candidate');
    await addIceCandidate(candidate);
  }
  
  // Handle chat message
  function handleChatMessage(sender: string, content: string) {
    setChatMessages(prev => [...prev, { sender, content }]);
  }
  
  // Initialize call
  const initializeCall = useCallback(async (asInitiator: boolean = false) => {
    try {
      console.log(`Initializing call ${callId} as ${asInitiator ? 'initiator' : 'participant'}`);
      setIsInitiator(asInitiator);
      
      // Set up a timeout for connection establishment
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      
      connectionTimeoutRef.current = window.setTimeout(() => {
        if (!isConnected) {
          toast.error('Connection timeout. Please try again.');
          if (onError) onError(new Error('Connection timeout'));
        }
      }, 30000); // 30 seconds timeout
      
      // Request media devices if not already acquired
      const stream = await initializeDevices();
      
      if (stream && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log('Local video stream set');
        if (onCallStarted) onCallStarted();
      }
      
      // Create peer connection
      createPeerConnection();
      
      // If initiator, create and send offer after a short delay
      if (asInitiator) {
        setTimeout(async () => {
          const offer = await createOffer();
          if (offer) {
            sendOffer(offer);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Failed to initialize call. Please check your camera and microphone permissions.');
      if (onError) onError(error as Error);
    }
  }, [
    callId, 
    createPeerConnection, 
    createOffer, 
    initializeDevices, 
    localVideoRef, 
    onCallStarted, 
    onError, 
    sendOffer, 
    isConnected
  ]);
  
  // Send a chat message
  const sendMessage = useCallback((content: string) => {
    sendChatMessage(content);
    
    // Add to local messages
    setChatMessages(prev => [...prev, {
      sender: 'You',
      content
    }]);
  }, [sendChatMessage]);
  
  // End the call
  const endCall = useCallback(() => {
    console.log('Ending call');
    
    // Clear timeout if it exists
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    
    // Close the peer connection
    closePeerConnection();
    
    // Stop media tracks
    stopStream();
    
    // Clear video elements
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    
    setIsConnected(false);
    if (onCallEnded) onCallEnded();
    
    // Call the API to end the call
    fetch(`/api/calls/me/${callId}/end/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('auth_token')}`
      }
    }).catch(error => {
      console.error('Error ending call via API:', error);
    });
  }, [callId, localVideoRef, remoteVideoRef, onCallEnded, closePeerConnection, stopStream]);
  
  // Clean up resources when the component unmounts
  useEffect(() => {
    return () => {
      console.log('Cleaning up WebRTC resources');
      
      // Clear timeout if it exists
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      // Close peer connection and stop media
      closePeerConnection();
      stopStream();
    };
  }, [closePeerConnection, stopStream]);
  
  return {
    isConnected,
    micActive,
    videoActive,
    chatMessages,
    initializeCall,
    toggleMicrophone,
    toggleVideo,
    sendChatMessage: sendMessage,
    endCall
  };
};

export default useWebRTC;
