
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useWebRTC } from "@/hooks/useWebRtcImplementation";

export const useCallPageState = (callId: string, locationState: any) => {
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // State for UI
  const [callActive, setCallActive] = useState<boolean>(true);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  
  // Mock data to be replaced with real API calls
  const [callData, setCallData] = useState<any>(
      locationState?.groupCall || {
        id: callId,
        name: "Conference Call",
        type: locationState?.callType || "video",
        is_group_call: locationState?.isGroupCall || false
      }
  );

  // Use our WebRTC hook
  const {
    isConnected,
    micActive,
    videoActive,
    chatMessages,
    initializeCall,
    toggleMicrophone,
    toggleVideo,
    sendChatMessage,
    endCall
  } = useWebRTC({
    callId,
    localVideoRef,
    remoteVideoRef,
    onCallConnected: () => {
      toast.success("Call connected!");
    },
    onCallEnded: () => {
      toast.info("Call ended");
      setCallActive(false);
      // Add a slight delay before navigation
      setTimeout(() => navigate("/calls"), 1000);
    },
    onError: (error) => {
      console.error("WebRTC error:", error);
      toast.error("Connection error: " + error.message);
    }
  });

  useEffect(() => {
    // Initialize call when component mounts
    const setupCall = async () => {
      try {
        if (callId) {
          console.log("Setting up call with ID:", callId);
          
          // Check if we're the initiator from the location state
          const isInitiator = locationState?.isInitiator || false;
          console.log("Initializing call as initiator:", isInitiator);
          
          // Initialize the call with short delay to ensure setup is complete
          setTimeout(() => {
            initializeCall(isInitiator);
          }, 1000);
        } else {
          console.error("No call ID available");
          toast.error("Missing call information");
          navigate("/calls");
        }
      } catch (error) {
        console.error("Error setting up call:", error);
        toast.error("Failed to initialize call");
      }
    };

    setupCall();
  }, [callId, initializeCall, locationState?.isInitiator, navigate]);
  
  // Handle ending the call
  const handleEndCall = () => {
    endCall();
    navigate("/calls");
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Could not enter fullscreen mode:", err);
      });
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error("Could not exit fullscreen mode:", err);
        });
        setFullscreen(false);
      }
    }
  };

  // Log connection status changes
  useEffect(() => {
    console.log("WebRTC connection status:", isConnected);
  }, [isConnected]);

  return {
    callData,
    localVideoRef,
    remoteVideoRef,
    micActive,
    videoActive,
    chatOpen,
    fullscreen,
    chatMessages,
    isConnected,
    toggleMicrophone,
    toggleVideo,
    sendChatMessage,
    endCall: handleEndCall,
    toggleChat: () => setChatOpen(!chatOpen),
    toggleFullscreen
  };
};
