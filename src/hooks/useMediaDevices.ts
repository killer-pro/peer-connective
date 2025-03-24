
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseMediaDevicesOptions {
  videoEnabled?: boolean;
  audioEnabled?: boolean;
  onError?: (error: Error) => void;
}

export const useMediaDevices = ({
  videoEnabled = true,
  audioEnabled = true,
  onError
}: UseMediaDevicesOptions = {}) => {
  const [micActive, setMicActive] = useState(audioEnabled);
  const [videoActive, setVideoActive] = useState(videoEnabled);
  const [isInitialized, setIsInitialized] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  // Initialize media devices
  const initializeDevices = useCallback(async (video = videoEnabled, audio = audioEnabled) => {
    try {
      // Stop any existing tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      
      const constraints = {
        audio,
        video: video ? { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      };
      
      console.log('Requesting user media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      
      setMicActive(audio);
      setVideoActive(video);
      setIsInitialized(true);
      
      return stream;
    } catch (error) {
      console.error('Error initializing media devices:', error);
      toast.error('Failed to access camera or microphone. Please check your permissions.');
      if (onError) onError(error as Error);
      return null;
    }
  }, [videoEnabled, audioEnabled, onError]);
  
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
  
  // Stop all tracks and clean up
  const stopStream = useCallback(() => {
    if (localStreamRef.current) {
      console.log('Stopping all media tracks');
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setIsInitialized(false);
    }
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);
  
  return {
    micActive,
    videoActive,
    localStream: localStreamRef.current,
    isInitialized,
    initializeDevices,
    toggleMicrophone,
    toggleVideo,
    stopStream
  };
};
