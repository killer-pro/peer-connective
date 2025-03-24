
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useWebRTC } from "@/hooks/useWebRtcImplementation";
import { toast } from "sonner";
import CallHeader from "@/components/call/CallHeader";
import VideoArea from "@/components/call/VideoArea";
import CallControls from "@/components/call/CallControls";
import ChatSidebar from "@/components/call/ChatSidebar";

const CallPage = () => {
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const { callId } = useParams();
  const location = useLocation();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // State for UI
  const [callActive, setCallActive] = useState<boolean>(true);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  
  // Verify callId is available
  const actualCallId = callId || "";
  if (!actualCallId) {
    toast.error("Missing call ID");
    navigate("/calls");
  }

  console.log("Call ID:", actualCallId);

  // Mock data to be replaced with real API calls
  const [callData, setCallData] = useState<any>(
      location.state?.groupCall || {
        id: actualCallId,
        name: "Conference Call",
        type: location.state?.callType || "video",
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
    callId: actualCallId,
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
        if (actualCallId) {
          console.log("Setting up call with ID:", actualCallId);
          
          // Check if we're the initiator from the location state
          const isInitiator = location.state?.isInitiator || false;
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
    
    // Clean up function when component unmounts
    return () => {
      console.log("Call page unmounting, cleaning up");
      endCall();
    };
  }, [actualCallId, initializeCall, location.state?.isInitiator, navigate, endCall]);
  
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

  // Render call controls
  const renderCallControls = () => (
    <CallControls
      micActive={micActive}
      videoActive={videoActive}
      chatOpen={chatOpen}
      onToggleMic={toggleMicrophone}
      onToggleVideo={toggleVideo}
      onEndCall={handleEndCall}
      onToggleChat={() => setChatOpen(!chatOpen)}
      showChatToggle={true}
    />
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Call header */}
      <CallHeader
        callName={callData.name}
        isGroupCall={callData.is_group_call}
        onFullscreenToggle={toggleFullscreen}
        isFullscreen={fullscreen}
      />
      
      {/* Call content */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-0">
        {/* Main call area */}
        <div className={`${chatOpen ? "md:col-span-3" : "md:col-span-4"}`}>
          <VideoArea
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            videoActive={videoActive}
            controls={renderCallControls()}
          />
        </div>
        
        {/* Sidebar (chat) - visible on larger screens or when toggled */}
        {chatOpen && (
          <ChatSidebar
            messages={chatMessages}
            onSendMessage={sendChatMessage}
          />
        )}
      </div>
    </div>
  );
};

export default CallPage;
