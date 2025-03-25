
import React from "react";
import CallHeader from "@/components/call/CallHeader";
import VideoArea from "@/components/call/VideoArea";
import CallControls from "@/components/call/CallControls";
import ChatSidebar from "@/components/call/ChatSidebar";

interface CallPageLayoutProps {
  callData: any;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  micActive: boolean;
  videoActive: boolean;
  chatOpen: boolean;
  fullscreen: boolean;
  chatMessages: { sender: string; content: string }[];
  toggleMicrophone: () => void;
  toggleVideo: () => void;
  sendChatMessage: (content: string) => void;
  endCall: () => void;
  toggleChat: () => void;
  toggleFullscreen: () => void;
}

const CallPageLayout: React.FC<CallPageLayoutProps> = ({
  callData,
  localVideoRef,
  remoteVideoRef,
  micActive,
  videoActive,
  chatOpen,
  fullscreen,
  chatMessages,
  toggleMicrophone,
  toggleVideo,
  sendChatMessage,
  endCall,
  toggleChat,
  toggleFullscreen
}) => {
  // Render call controls
  const renderCallControls = () => (
    <CallControls
      micActive={micActive}
      videoActive={videoActive}
      chatOpen={chatOpen}
      onToggleMic={toggleMicrophone}
      onToggleVideo={toggleVideo}
      onEndCall={endCall}
      onToggleChat={toggleChat}
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

export default CallPageLayout;
