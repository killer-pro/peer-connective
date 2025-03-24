
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useSignaling } from './useSignaling';
import { usePeerConnection } from './usePeerConnection';
import { useMediaDevices } from './useMediaDevices';
import CallService from '@/services/callService';

interface UseWebRTCReturn {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  micActive: boolean;
  videoActive: boolean;
  toggleMicrophone: () => void;
  toggleVideo: () => void;
  chatMessages: { sender: string; content: string; timestamp: Date }[];
  sendChatMessage: (content: string) => void;
  endCall: () => void;
  callStatus: 'connecting' | 'connected' | 'disconnected';
}

const useWebRTC = (isInitiator: boolean = false): UseWebRTCReturn => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [chatMessages, setChatMessages] = useState<{ sender: string; content: string; timestamp: Date }[]>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  console.log(`useWebRTC initialized as ${isInitiator ? 'initiator' : 'recipient'} for call ${callId}`);

  // Initialize media devices
  const {
    micActive,
    videoActive,
    localStream,
    isInitialized,
    initializeDevices,
    toggleMicrophone,
    toggleVideo,
    stopStream
  } = useMediaDevices({
    videoEnabled: true,
    audioEnabled: true,
    onError: (error) => {
      console.error('Media device error:', error);
      toast.error('Could not access camera or microphone');
    }
  });

  // Handle signaling states
  const {
    isConnected: signalingConnected,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendChatMessage
  } = useSignaling({
    callId: callId || '0',
    onOffer: (sdp) => {
      console.log('Offer received from peer, setting remote description');
      handleOffer(sdp);
    },
    onAnswer: (sdp) => {
      console.log('Answer received from peer, setting remote description');
      handleAnswer(sdp);
    },
    onIceCandidate: (candidate) => {
      console.log('ICE candidate received from peer');
      handleRemoteIceCandidate(candidate);
    },
    onChatMessage: (sender, content) => {
      console.log(`Chat message from ${sender}: ${content}`);
      addChatMessage(sender, content);
    },
    onError: (error) => {
      console.error('Signaling error:', error);
      toast.error('Communication error');
    }
  });

  // Initialize peer connection for WebRTC
  const {
    connectionState,
    createPeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    closePeerConnection,
    hasRemoteDescription
  } = usePeerConnection({
    callId: callId || '0',
    localStream,
    isInitiator,
    onTrack: (stream) => {
      console.log('Remote track received, updating remote video');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    },
    onConnectionStateChange: (state) => {
      console.log(`Peer connection state changed to ${state}`);
      
      if (state === 'connected') {
        setCallStatus('connected');
        toast.success('Call connected');
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        setCallStatus('disconnected');
        
        if (state !== 'closed') {
          toast.error('Call disconnected');
          setTimeout(() => {
            endCall();
          }, 1000);
        }
      }
    },
    onIceCandidate: (candidate) => {
      console.log('Local ICE candidate generated, sending to peer');
      sendIceCandidate(candidate);
    },
    onError: (error) => {
      console.error('Peer connection error:', error);
      toast.error('Connection error');
    }
  });

  // Initialize media devices on component mount
  useEffect(() => {
    const initMedia = async () => {
      console.log('Initializing media devices');
      await initializeDevices(true, true);
    };
    
    initMedia();
    
    // Clean up on unmount
    return () => {
      stopStream();
    };
  }, []);

  // Initialize WebRTC when media and signaling are ready
  useEffect(() => {
    if (!isInitialized || !signalingConnected || !callId) {
      console.log('Waiting for media initialization or signaling connection');
      return;
    }
    
    const setupCall = async () => {
      console.log('Setting up WebRTC call');
      
      // Create the peer connection
      const pc = createPeerConnection();
      
      if (!pc) {
        console.error('Failed to create peer connection');
        return;
      }
      
      // If we're the initiator, create an offer
      if (isInitiator) {
        console.log('Creating and sending offer as initiator');
        const offer = await createOffer();
        if (offer) {
          sendOffer(offer);
        }
      }
    };
    
    setupCall();
    
    return () => {
      closePeerConnection();
    };
  }, [isInitialized, signalingConnected, callId]);

  // Update local video display when stream is available
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log('Setting local video stream');
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Handle connection state changes
  useEffect(() => {
    console.log(`WebRTC connection state: ${connectionState}`);
  }, [connectionState]);

  // Handle receiving an offer (as the recipient)
  const handleOffer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    console.log('Handling received offer');
    if (!isInitiator) {
      await setRemoteDescription(sdp);
      
      const answer = await createAnswer();
      if (answer) {
        console.log('Sending answer to offer');
        sendAnswer(answer);
      }
    }
  }, [isInitiator, setRemoteDescription, createAnswer, sendAnswer]);

  // Handle receiving an answer (as the initiator)
  const handleAnswer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    console.log('Handling received answer');
    if (isInitiator) {
      await setRemoteDescription(sdp);
    }
  }, [isInitiator, setRemoteDescription]);

  // Handle remote ICE candidates
  const handleRemoteIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    console.log('Adding remote ICE candidate');
    if (hasRemoteDescription()) {
      await addIceCandidate(candidate);
    } else {
      console.warn('Postponing adding ICE candidate until remote description is set');
      setTimeout(() => {
        if (hasRemoteDescription()) {
          addIceCandidate(candidate);
        }
      }, 1000);
    }
  }, [addIceCandidate, hasRemoteDescription]);

  // Add chat message to the list
  const addChatMessage = useCallback((sender: string, content: string) => {
    setChatMessages(prev => [
      ...prev,
      { sender, content, timestamp: new Date() }
    ]);
  }, []);

  // Send a chat message
  const handleSendChatMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    
    console.log('Sending chat message:', content);
    
    // Add to our own chat display first
    addChatMessage('You', content);
    
    // Send via signaling channel
    sendChatMessage(content);
  }, [addChatMessage, sendChatMessage]);

  // End the call
  const endCall = useCallback(async () => {
    console.log('Ending call');
    
    // Close peer connection
    closePeerConnection();
    
    // Stop media streams
    stopStream();
    
    // Update UI state
    setCallStatus('disconnected');
    
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
  }, [callId, navigate, closePeerConnection, stopStream]);

  return {
    localVideoRef,
    remoteVideoRef,
    micActive,
    videoActive,
    toggleMicrophone,
    toggleVideo,
    chatMessages,
    sendChatMessage: handleSendChatMessage,
    endCall,
    callStatus
  };
};

export default useWebRTC;
export { useWebRTC };
