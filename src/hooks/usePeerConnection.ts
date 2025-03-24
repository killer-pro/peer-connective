
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UsePeerConnectionOptions {
  callId: string;
  onTrack?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onError?: (error: Error) => void;
  localStream?: MediaStream | null;
  isInitiator?: boolean;
}

export const usePeerConnection = ({
  callId,
  onTrack,
  onConnectionStateChange,
  onIceCandidate,
  onError,
  localStream,
  isInitiator
}: UsePeerConnectionOptions) => {
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const hasRemoteDescriptionRef = useRef<boolean>(false);
  const sentIceCandidatesRef = useRef<Set<string>>(new Set());
  
  // Function to create and set up the peer connection
  const createPeerConnection = useCallback(() => {
    try {
      // Configure ICE servers
      const iceServers = [
        {urls: 'stun:stun1.l.google.com:19302'},
        {urls: 'stun:stun2.l.google.com:19302'},
        {urls: 'stun:stun3.l.google.com:19302'},
        {urls: 'stun:stun4.l.google.com:19302'},
        {urls: 'stun:stun01.sipphone.com'},
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
      
      console.log('Creating RTCPeerConnection with ICE servers');
      const peerConnection = new RTCPeerConnection({ iceServers });
      peerConnectionRef.current = peerConnection;
      
      // Add local tracks to peer connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          console.log(`Adding ${track.kind} track to peer connection`);
          peerConnection.addTrack(track, localStream);
        });
      }
      
      // Handle remote tracks
      peerConnection.ontrack = (event) => {
        console.log('Remote track received:', event.track.kind);
        
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        
        // Add the track to the remote stream
        remoteStreamRef.current.addTrack(event.track);
        
        if (onTrack && remoteStreamRef.current) {
          onTrack(remoteStreamRef.current);
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
          
          if (onIceCandidate) {
            onIceCandidate(event.candidate);
          }
        }
      };
      
      // Connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state changed:', peerConnection.connectionState);
        setConnectionState(peerConnection.connectionState);
        
        if (onConnectionStateChange) {
          onConnectionStateChange(peerConnection.connectionState);
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
      
      return peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      if (onError) onError(error as Error);
      return null;
    }
  }, [callId, localStream, onTrack, onConnectionStateChange, onIceCandidate, onError]);
  
  // Create offer (for initiator)
  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current) {
      console.error('Cannot create offer: Peer connection not initialized');
      return null;
    }
    
    try {
      console.log('Creating offer as initiator');
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnectionRef.current.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      if (onError) onError(error as Error);
      return null;
    }
  }, [onError]);
  
  // Create answer (for receiver)
  const createAnswer = useCallback(async () => {
    if (!peerConnectionRef.current) {
      console.error('Cannot create answer: Peer connection not initialized');
      return null;
    }
    
    try {
      console.log('Creating answer as receiver');
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      if (onError) onError(error as Error);
      return null;
    }
  }, [onError]);
  
  // Set remote description (SDP)
  const setRemoteDescription = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) {
      console.error('Cannot set remote description: Peer connection not initialized');
      return false;
    }
    
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      hasRemoteDescriptionRef.current = true;
      console.log('Remote description set successfully');
      return true;
    } catch (error) {
      console.error('Error setting remote description:', error);
      if (onError) onError(error as Error);
      return false;
    }
  }, [onError]);
  
  // Add ICE candidate
  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) {
      console.error('Cannot add ICE candidate: Peer connection not initialized');
      return false;
    }
    
    // Only process ICE candidates if we have a remote description
    if (!hasRemoteDescriptionRef.current) {
      console.warn('Received ICE candidate before remote description');
      return false;
    }
    
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('ICE candidate added successfully');
      return true;
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      if (onError) onError(error as Error);
      return false;
    }
  }, [onError]);
  
  // Close peer connection
  const closePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      console.log('Closing peer connection');
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      remoteStreamRef.current = null;
      hasRemoteDescriptionRef.current = false;
      sentIceCandidatesRef.current.clear();
    }
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      closePeerConnection();
    };
  }, [closePeerConnection]);
  
  return {
    connectionState,
    createPeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    closePeerConnection,
    hasRemoteDescription: () => hasRemoteDescriptionRef.current
  };
};
