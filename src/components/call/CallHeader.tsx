
import { useNavigate } from "react-router-dom";
import { X, Maximize, Minimize, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CallHeaderProps {
  callName: string;
  isGroupCall?: boolean;
  onFullscreenToggle: () => void;
  isFullscreen: boolean;
}

const CallHeader = ({ callName, isGroupCall, onFullscreenToggle, isFullscreen }: CallHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <X className="h-4 w-4" />
        </Button>
        <h1 className="font-medium">{callName || "Video Call"}</h1>
        {isGroupCall && (
          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded">
            Group
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onFullscreenToggle}>
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Invite participants</DropdownMenuItem>
            <DropdownMenuItem>Start recording</DropdownMenuItem>
            <DropdownMenuItem>Share screen</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Report issue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default CallHeader;
