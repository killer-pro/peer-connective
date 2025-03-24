
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
  
  // To track sent ICE candidates and prevent duplicates
  const sentIceCandidatesRef = useRef<Set<string>>(new Set());
  
  // For connection management
  const hasRemoteDescriptionRef = useRef<boolean>(false);
  const connectionTimeoutRef = useRef<number | null>(null);
  
  // Chat messages
  const [chatMessages, setChatMessages] = useState<Array<{sender: string, content: string}>>([]);
  
  // Get WebSocket connection
  const { isConnected: wsConnected, send } = useSignalingWebSocket(callId, {
    onOpen: () => {
      console.log(`Signaling WebSocket for call ${callId} connected!`);
    },
    onMessage: (message) => {
      console.log(`Received signaling message for call ${callId}:`, message);
      handleSignalingMessage(message);
    },
    onError: (event) => {
      console.error(`Signaling WebSocket error for call ${callId}:`, event);
    },
    onClose: () => {
      console.log(`Signaling WebSocket for call ${callId} closed`);
    },
    reconnect: true
  });

  // Send signaling message with validation
  const sendSignalingMessage = useCallback((messageData: any) => {
    if (!wsConnected) {
      console.error(`Cannot send message - WebSocket not connected`);
      return false;
    }
    
    console.log(`Sending signaling message for call ${callId}:`, messageData);
    return send(messageData);
  }, [wsConnected, send, callId]);

  // Handle incoming signaling messages
  function handleSignalingMessage(message: any) {
    if (!message || !message.type) {
      console.error('Invalid signaling message received:', message);
      return;
    }
    
    console.log('RECEIVED SIGNALING MESSAGE:', {
      type: message.type,
      connectionState: peerConnectionRef.current?.connectionState,
      iceConnectionState: peerConnectionRef.current?.iceConnectionState,
      signalingState: peerConnectionRef.current?.signalingState
    });
    
    try {
      if (!peerConnectionRef.current) {
        console.error('PeerConnection not initialized when receiving', message.type);
        return;
      }
      
      // Handle different message types
      if (message.type === 'offer' && !isInitiator) {
        console.log('Received offer from initiator');
        
        if (peerConnectionRef.current.signalingState !== 'stable') {
          console.warn('Cannot handle offer in current state:', peerConnectionRef.current.signalingState);
          return;
        }
        
        peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.sdp))
          .then(() => {
            hasRemoteDescriptionRef.current = true;
            return peerConnectionRef.current!.createAnswer();
          })
          .then(answer => peerConnectionRef.current!.setLocalDescription(answer))
          .then(() => {
            // Send answer back to initiator
            sendSignalingMessage({
              type: 'answer',
              callId: parseInt(callId),
              call: parseInt(callId),
              sender: parseInt(callId), // Send as the call recipient
              sdp: peerConnectionRef.current?.localDescription
            });
          })
          .catch(error => {
            console.error('Error handling offer:', error);
            if (onError) onError(error);
          });
      } 
      else if (message.type === 'answer' && isInitiator) {
        console.log('Received answer from recipient');
        
        peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.sdp))
          .then(() => {
            hasRemoteDescriptionRef.current = true;
            console.log('Remote description set successfully');
          })
          .catch(error => {
            console.error('Error setting remote description:', error);
            if (onError) onError(error);
          });
      } 
      else if (message.type === 'ice-candidate') {
        // Only process ICE candidates if we have a remote description
        if (!hasRemoteDescriptionRef.current) {
          console.warn('Received ICE candidate before remote description');
          return;
        }
        
        console.log('Received ICE candidate');
        
        const candidate = new RTCIceCandidate(message.candidate);
        peerConnectionRef.current.addIceCandidate(candidate)
          .then(() => {
            console.log('ICE candidate added successfully');
          })
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
          console.log('Local video stream set');
        } else {
          console.error('Local video element not found');
        }
        
        if (onCallStarted) onCallStarted();
      }
      
      // Configure ICE servers
      const iceServers = [
        {urls:'stun:stun1.l.google.com:19302'},
        {urls:'stun:stun2.l.google.com:19302'},
        {urls:'stun:stun3.l.google.com:19302'},
        {urls:'stun:stun4.l.google.com:19302'},
        {urls:'stun:stun01.sipphone.com'},
        {
          urls: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
        },
        {
          urls: 'turn:192.158.29.39:3478?transport=udp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808'
        },
        {
          urls: 'turn:192.158.29.39:3478?transport=tcp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808'
        }
      ];
      
      // Create RTCPeerConnection with ICE servers
      console.log('Creating RTCPeerConnection with ICE servers');
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
        console.log('Remote track received:', event.track.kind);
        
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
          
          // Display remote video
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
            console.log('Remote video stream created');
          } else {
            console.error('Remote video element not found');
          }
        }
        
        // Add the track to the remote stream
        remoteStreamRef.current.addTrack(event.track);
        console.log(`Added ${event.track.kind} track to remote stream`);
        
        setIsConnected(true);
        if (onCallConnected) onCallConnected();
        
        // Clear connection timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
      };
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Prevent duplicate ICE candidates
          const candidateStr = JSON.stringify(event.candidate);
          if (sentIceCandidatesRef.current.has(candidateStr)) {
            return;
          }
          
          sentIceCandidatesRef.current.add(candidateStr);
          console.log('Generated ICE candidate:', event.candidate.candidate.substring(0, 50) + '...');
          
          // Only send ICE candidates if we have a WebSocket connection
          if (wsConnected) {
            sendSignalingMessage({
              type: 'ice-candidate',
              callId: parseInt(callId),
              call: parseInt(callId),
              sender: asInitiator ? 'initiator' : 'participant',
              candidate: event.candidate
            });
          } else {
            console.error('Cannot send ICE candidate - WebSocket not connected');
          }
        }
      };
      
      // Connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state changed:', peerConnection.connectionState);
        
        if (peerConnection.connectionState === 'connected') {
          setIsConnected(true);
          if (onCallConnected) onCallConnected();
          
          // Clear connection timeout
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
        } else if (peerConnection.connectionState === 'disconnected' || 
                  peerConnection.connectionState === 'failed' ||
                  peerConnection.connectionState === 'closed') {
          setIsConnected(false);
          if (onCallEnded) onCallEnded();
        }
      };
      
      // ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state changed:', peerConnection.iceConnectionState);
      };
      
      // Signaling state changes
      peerConnection.onsignalingstatechange = () => {
        console.log('Signaling state changed:', peerConnection.signalingState);
      };
      
      // If initiator, create and send offer after a short delay
      // This ensures the signaling connection is established
      if (asInitiator) {
        setTimeout(async () => {
          if (!peerConnectionRef.current) return;
          
          console.log('Creating offer as initiator');
          try {
            const offer = await peerConnectionRef.current.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            });
            
            await peerConnectionRef.current.setLocalDescription(offer);
            
            // Send offer to the recipient
            sendSignalingMessage({
              type: 'offer',
              callId: parseInt(callId),
              call: parseInt(callId),
              sender: 'initiator', // Identify as initiator
              sdp: peerConnectionRef.current.localDescription
            });
          } catch (error) {
            console.error('Error creating offer:', error);
            if (onError) onError(error as Error);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Failed to initialize call. Please check your camera and microphone permissions.');
      if (onError) onError(error as Error);
    }
  }, [callId, videoActive, localVideoRef, remoteVideoRef, wsConnected, sendSignalingMessage, onCallConnected, onCallEnded, onCallStarted, onError, isConnected]);
  
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
    sendSignalingMessage({
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
  }, [callId, sendSignalingMessage]);
  
  // End the call
  const endCall = useCallback(() => {
    console.log('Ending call');
    
    // Clear timeout if it exists
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    
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
    fetch(`/api/calls/me/${callId}/end/`, {
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
      
      // Clear timeout if it exists
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
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
