
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallControlsProps {
  micActive: boolean;
  videoActive: boolean;
  chatOpen: boolean;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  onToggleChat: () => void;
  showChatToggle?: boolean;
}

const CallControls = ({
  micActive,
  videoActive,
  chatOpen,
  onToggleMic,
  onToggleVideo,
  onEndCall,
  onToggleChat,
  showChatToggle = true
}: CallControlsProps) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-background/80 backdrop-blur-sm rounded-full">
      <Button
        variant={micActive ? "ghost" : "destructive"}
        size="icon"
        onClick={onToggleMic}
        className="rounded-full"
      >
        {micActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </Button>
      
      <Button
        variant={videoActive ? "ghost" : "destructive"}
        size="icon"
        onClick={onToggleVideo}
        className="rounded-full"
      >
        {videoActive ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
      </Button>
      
      <Button
        variant="destructive"
        size="icon"
        onClick={onEndCall}
        className="rounded-full"
      >
        <PhoneOff className="h-4 w-4" />
      </Button>
      
      {showChatToggle && (
        <Button
          variant={chatOpen ? "default" : "ghost"}
          size="icon"
          onClick={onToggleChat}
          className="rounded-full md:hidden"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default CallControls;
