
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSignalingWebSocket } from './useWebSocket';
import axios from 'axios';
import { toast } from 'sonner';

const PEER_CONNECTION_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

type UseWebRTCProps = {
  callId: string;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onCallConnected?: () => void;
  onCallEnded?: () => void;
};

export const useWebRTC = ({
  callId,
  localVideoRef,
  remoteVideoRef,
  onCallConnected,
  onCallEnded,
}: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [micActive, setMicActive] = useState<boolean>(true);
  const [videoActive, setVideoActive] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInitiator, setIsInitiator] = useState<boolean>(false);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  
  // Polling interval for signaling messages when WebSocket is not available
  const pollingIntervalRef = useRef<number | null>(null);
  const currentUserId = localStorage.getItem('userId');
  
  // Use WebSocket for signaling if available
  const { isConnected: wsConnected, send: wsSend, subscribe } = useSignalingWebSocket(callId, {
    onMessage: (data) => {
      console.log('WebSocket message received:', data);
      handleSignalingMessage(data);
    },
  });
  
  // Initialize WebRTC
  const initializeCall = useCallback(async (isInitiatingCall = false) => {
    try {
      setIsInitiator(isInitiatingCall);
      console.log('Initializing call as initiator:', isInitiatingCall);
      
      // Create peer connection
      const pc = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
      peerConnection.current = pc;
      
      // Setup event handlers
      pc.onicecandidate = handleIceCandidate;
      pc.ontrack = handleTrack;
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        handleIceConnectionStateChange();
      };
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      
      setLocalStream(stream);
      setMicActive(true);
      setVideoActive(true);
      
      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Create data channel if initiating the call
      if (isInitiatingCall) {
        console.log('Creating data channel');
        dataChannel.current = pc.createDataChannel('chat');
        setupDataChannel(dataChannel.current);
        
        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        const receiverId = getReceiverId();
        if (receiverId) {
          sendSignalingMessage({
            type: 'offer',
            call: parseInt(callId),
            receiver: receiverId,
            sdp: pc.localDescription,
          });
        } else {
          console.error('No receiver ID available');
        }
      } else {
        // Set up data channel event for the answering side
        pc.ondatachannel = (event) => {
          console.log('Data channel received');
          dataChannel.current = event.channel;
          setupDataChannel(dataChannel.current);
        };
      }
      
      // Start polling for signaling messages if WebSocket is not connected
      if (!wsConnected) {
        console.log('WebSocket not connected, starting polling');
        startPollingMessages();
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      toast.error('Could not access camera or microphone. Please check permissions.');
      return false;
    }
  }, [callId, localVideoRef, wsConnected]);
  
  // Helper to get the receiver ID (the other participant in the call)
  const getReceiverId = () => {
    // This would come from your call data in a real implementation
    // For now, we're just using a hardcoded value or the call ID
    return parseInt(callId) || 1;
  };
  
  // Handle incoming signaling messages (from WebSocket or polling)
  function handleSignalingMessage(data: any) {
    if (!peerConnection.current) return;
    
    const pc = peerConnection.current;
    
    try {
      console.log('Received signaling message:', data);
      
      if (data.type === 'offer' && !isInitiator) {
        // Handle offer
        console.log('Processing offer');
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
          .then(() => pc.createAnswer())
          .then(answer => pc.setLocalDescription(answer))
          .then(() => {
            const receiverId = data.sender;
            sendSignalingMessage({
              type: 'answer',
              call: parseInt(callId),
              receiver: receiverId,
              sdp: pc.localDescription,
            });
          })
          .catch(error => console.error('Error handling offer:', error));
      } else if (data.type === 'answer' && isInitiator) {
        // Handle answer
        console.log('Processing answer');
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
          .catch(error => console.error('Error handling answer:', error));
      } else if (data.type === 'ice-candidate') {
        // Handle ICE candidate
        console.log('Processing ICE candidate');
        pc.addIceCandidate(new RTCIceCandidate(data.candidate))
          .catch(error => console.error('Error adding ice candidate:', error));
      } else if (data.type === 'incoming_call') {
        // Handle incoming call notification
        console.log('Incoming call notification received');
        toast.info(`Incoming call from ${data.call.initiator_details.username}`, {
          action: {
            label: 'Answer',
            onClick: () => window.location.href = `/call/${data.call.id}`,
          },
          duration: 10000,
        });
      }
    } catch (error) {
      console.error('Error processing signaling message:', error);
    }
  }
  
  // Handle ICE candidates
  function handleIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      console.log('New ICE candidate', event.candidate);
      const receiverId = getReceiverId();
      sendSignalingMessage({
        type: 'ice-candidate',
        call: parseInt(callId),
        receiver: receiverId,
        candidate: event.candidate,
      });
    }
  }
  
  // Handle incoming tracks
  function handleTrack(event: RTCTrackEvent) {
    console.log('Track received', event.streams[0]);
    setRemoteStream(event.streams[0]);
    
    if (remoteVideoRef.current && event.streams[0]) {
      remoteVideoRef.current.srcObject = event.streams[0];
      setIsConnected(true);
      if (onCallConnected) onCallConnected();
    }
  }
  
  // Handle ICE connection state changes
  function handleIceConnectionStateChange() {
    if (!peerConnection.current) return;
    
    const state = peerConnection.current.iceConnectionState;
    console.log('ICE connection state:', state);
    
    if (state === 'connected' || state === 'completed') {
      setIsConnected(true);
      if (onCallConnected) onCallConnected();
    } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
      setIsConnected(false);
      if (onCallEnded) onCallEnded();
    }
  }
  
  // Setup data channel for chat
  function setupDataChannel(channel: RTCDataChannel) {
    channel.onopen = () => {
      console.log('Data channel is open');
    };
    
    channel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    channel.onclose = () => {
      console.log('Data channel is closed');
    };
  }
  
  // Send a signaling message
  const sendSignalingMessage = useCallback((message: any) => {
    console.log('Sending signaling message:', message);
    
    // Try to send via WebSocket first
    if (wsConnected) {
      console.log('Sending via WebSocket');
      wsSend(message);
      return;
    }
    
    // Fall back to REST API
    console.log('Sending via REST API');
    const endpoint = `/api/signaling/${message.type}/`;
    axios.post(endpoint, message)
      .then(() => console.log(`${message.type} sent successfully`))
      .catch(error => console.error(`Error sending ${message.type}:`, error));
  }, [wsConnected, wsSend]);
  
  // Start polling for signaling messages
  const startPollingMessages = useCallback(() => {
    if (pollingIntervalRef.current) return;
    
    const pollMessages = async () => {
      try {
        console.log(`Polling for messages for call ${callId}`);
        const response = await axios.get(`/api/signaling/poll/${callId}/`);
        const messages = response.data;
        
        messages.forEach((message: any) => {
          handleSignalingMessage(message);
        });
      } catch (error) {
        console.error('Error polling signaling messages:', error);
      }
    };
    
    // Poll immediately and then at intervals
    pollMessages();
    pollingIntervalRef.current = window.setInterval(pollMessages, 2000);
  }, [callId]);
  
  // Stop polling
  const stopPollingMessages = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);
  
  // Send a chat message
  const sendChatMessage = useCallback((content: string) => {
    if (!dataChannel.current || dataChannel.current.readyState !== 'open') {
      console.warn('Data channel is not open');
      return false;
    }
    
    const message = {
      sender: 'You',
      content,
      timestamp: new Date().toISOString()
    };
    
    try {
      dataChannel.current.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, []);
  
  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setMicActive(audioTracks[0]?.enabled || false);
    }
  }, [localStream]);
  
  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setVideoActive(videoTracks[0]?.enabled || false);
    }
  }, [localStream]);
  
  // End call
  const endCall = useCallback(() => {
    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    // Stop polling
    stopPollingMessages();
    
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    setRemoteStream(null);
    setIsConnected(false);
    
    if (onCallEnded) onCallEnded();
    
    return true;
  }, [localStream, onCallEnded, stopPollingMessages]);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);
  
  // Subscribe to WebSocket messages
  useEffect(() => {
    if (wsConnected) {
      const unsubOffer = subscribe('offer', handleSignalingMessage);
      const unsubAnswer = subscribe('answer', handleSignalingMessage);
      const unsubIceCandidate = subscribe('ice-candidate', handleSignalingMessage);
      
      return () => {
        unsubOffer();
        unsubAnswer();
        unsubIceCandidate();
      };
    }
  }, [wsConnected, subscribe]);
  
  return {
    isConnected,
    micActive,
    videoActive,
    localStream,
    remoteStream,
    initializeCall,
    toggleMicrophone,
    toggleVideo,
    sendChatMessage,
    endCall
  };
};

export default useWebRTC;
