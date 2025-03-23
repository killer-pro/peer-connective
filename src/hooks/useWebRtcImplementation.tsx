
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSignalingWebSocket } from './useWebSocket';
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
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [isInitiator, setIsInitiator] = useState(false);
  
  // RTCPeerConnection and stream references
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  
  // Chat messages
  const [chatMessages, setChatMessages] = useState<Array<{sender: string, content: string}>>([]);
  
  // Get WebSocket connection
  const { isConnected: wsConnected, send } = useSignalingWebSocket(callId, {
    onMessage: handleSignalingMessage,
    reconnect: true
  });
  
  // Handle incoming signaling messages
  function handleSignalingMessage(message: any) {
    console.log('Received signaling message:', message);
    
    try {
      if (!peerConnectionRef.current) {
        console.error('PeerConnection not initialized');
        return;
      }
      
      // Handle different message types
      if (message.type === 'offer' && !isInitiator) {
        console.log('Received offer, setting remote description');
        
        peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.sdp))
          .then(() => peerConnectionRef.current?.createAnswer())
          .then(answer => peerConnectionRef.current?.setLocalDescription(answer))
          .then(() => {
            // Send answer
            send({
              type: 'answer',
              callId: parseInt(callId),
              call: parseInt(callId),
              receiver: message.sender,
              sdp: peerConnectionRef.current?.localDescription
            });
          })
          .catch(error => {
            console.error('Error handling offer:', error);
            if (onError) onError(error);
          });
      } 
      else if (message.type === 'answer' && isInitiator) {
        console.log('Received answer, setting remote description');
        
        peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.sdp))
          .catch(error => {
            console.error('Error setting remote description:', error);
            if (onError) onError(error);
          });
      } 
      else if (message.type === 'ice-candidate') {
        console.log('Received ICE candidate');
        
        const candidate = new RTCIceCandidate(message.candidate);
        peerConnectionRef.current.addIceCandidate(candidate)
          .catch(error => {
            console.error('Error adding ICE candidate:', error);
            if (onError) onError(error);
          });
      }
      else if (message.type === 'chat') {
        // Handle chat messages
        setChatMessages(prev => [...prev, {
          sender: message.senderName || 'Participant',
          content: message.content
        }]);
      }
    } catch (error) {
      console.error('Error processing signaling message:', error);
      if (onError) onError(error as Error);
    }
  }
  
  // Initialize media and peer connection
  const initializeCall = useCallback(async (asInitiator: boolean = false) => {
    try {
      console.log(`Initializing call ${callId} as ${asInitiator ? 'initiator' : 'participant'}`);
      setIsInitiator(asInitiator);
      
      // Request media devices if not already acquired
      if (!localStreamRef.current) {
        const constraints = {
          audio: true,
          video: videoActive ? { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } : false
        };
        
        console.log('Requesting user media with constraints:', constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        
        // Display local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        if (onCallStarted) onCallStarted();
      }
      
      // Configure ICE servers
      const iceServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ];
      
      // Create RTCPeerConnection
      console.log('Creating RTCPeerConnection');
      const peerConnection = new RTCPeerConnection({ iceServers });
      peerConnectionRef.current = peerConnection;
      
      // Add local streams to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          if (localStreamRef.current) {
            console.log(`Adding track to peer connection: ${track.kind}`);
            peerConnection.addTrack(track, localStreamRef.current);
          }
        });
      }
      
      // Handle remote streams
      peerConnection.ontrack = (event) => {
        console.log('Remote track received:', event.track);
        
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
          
          // Display remote video
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
          }
        }
        
        // Add the track to the remote stream
        remoteStreamRef.current.addTrack(event.track);
        
        setIsConnected(true);
        if (onCallConnected) onCallConnected();
      };
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Generated ICE candidate:', event.candidate);
          
          // Send ICE candidate to the peer
          send({
            type: 'ice-candidate',
            callId: parseInt(callId),
            call: parseInt(callId),
            receiver: asInitiator ? parseInt(callId) : undefined, // Django needs the receiver
            candidate: event.candidate
          });
        }
      };
      
      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state changed:', peerConnection.connectionState);
        
        if (peerConnection.connectionState === 'connected') {
          setIsConnected(true);
          if (onCallConnected) onCallConnected();
        } else if (peerConnection.connectionState === 'disconnected' || 
                  peerConnection.connectionState === 'failed' ||
                  peerConnection.connectionState === 'closed') {
          setIsConnected(false);
          if (onCallEnded) onCallEnded();
        }
      };
      
      // If initiator, create and send offer
      if (asInitiator) {
        console.log('Creating offer as initiator');
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        
        await peerConnection.setLocalDescription(offer);
        
        // Send offer to the peer
        send({
          type: 'offer',
          callId: parseInt(callId),
          call: parseInt(callId),
          receiver: parseInt(callId), // Django needs the receiver
          sdp: peerConnection.localDescription
        });
      }
      
    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Failed to initialize call. Please check your camera and microphone permissions.');
      if (onError) onError(error as Error);
    }
  }, [callId, videoActive, localVideoRef, remoteVideoRef, onCallConnected, onCallEnded, onCallStarted, onError, send]);
  
  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setMicActive(audioTracks[0]?.enabled || false);
      
      console.log(`Microphone ${micActive ? 'muted' : 'unmuted'}`);
    }
  }, [micActive]);
  
  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setVideoActive(videoTracks[0]?.enabled || false);
      
      console.log(`Video ${videoActive ? 'stopped' : 'started'}`);
    }
  }, [videoActive]);
  
  // Send a chat message
  const sendChatMessage = useCallback((content: string) => {
    send({
      type: 'chat',
      callId: parseInt(callId),
      call: parseInt(callId),
      content,
      senderName: 'You' // This will be replaced by the backend with the actual username
    });
    
    // Add to local messages
    setChatMessages(prev => [...prev, {
      sender: 'You',
      content
    }]);
  }, [callId, send]);
  
  // End the call
  const endCall = useCallback(() => {
    console.log('Ending call');
    
    // Close the peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    // Clear remote stream
    remoteStreamRef.current = null;
    
    // Clear video elements
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    
    setIsConnected(false);
    if (onCallEnded) onCallEnded();
    
    // Call the API to end the call
    fetch(`/api/calls/${callId}/end/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('auth_token')}`
      }
    }).catch(error => {
      console.error('Error ending call via API:', error);
    });
  }, [callId, localVideoRef, remoteVideoRef, onCallEnded]);
  
  // Clean up resources when the component unmounts
  useEffect(() => {
    return () => {
      console.log('Cleaning up WebRTC resources');
      
      // Stop all media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close the peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);
  
  return {
    isConnected,
    micActive,
    videoActive,
    chatMessages,
    initializeCall,
    toggleMicrophone,
    toggleVideo,
    sendChatMessage,
    endCall
  };
};

export default useWebRTC;
