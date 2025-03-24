
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoAreaProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  videoActive: boolean;
  controls: React.ReactNode;
}

const VideoArea = ({ localVideoRef, remoteVideoRef, videoActive, controls }: VideoAreaProps) => {
  return (
    <div className="relative h-full w-full bg-black">
      {/* Remote video (full size) */}
      <video
        ref={remoteVideoRef}
        className="h-full w-full object-cover"
        autoPlay
        playsInline
      />
      
      {/* Local video (picture-in-picture) */}
      <div className="absolute bottom-4 right-4 w-40 h-30 md:w-48 md:h-36 rounded-md overflow-hidden border-2 border-background">
        <video
          ref={localVideoRef}
          className="h-full w-full object-cover"
          autoPlay
          playsInline
          muted
        />
        
        {/* Video disabled overlay */}
        {!videoActive && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      
      {/* Call controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        {controls}
      </div>
    </div>
  );
};

export default VideoArea;
