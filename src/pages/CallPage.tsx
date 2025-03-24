
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  MoreVertical,
  User,
  Users,
  Maximize,
  Minimize,
  X,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useWebRTC } from "@/hooks/useWebRtcImplementation";
import { toast } from "sonner";

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
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Array<{sender: string, content: string}>>([]);

  // Mock data to be replaced with real API calls
  const [callData, setCallData] = useState<any>(
      location.state?.groupCall || {
        id: location.state?.callId || callId || "unknown",
        name: "Conference Call",
        type: location.state?.callType || "video",
      }
  );

console.log("callid:", callId);
  // Use our WebRTC hook
  const {
    isConnected,
    micActive,
    videoActive,
    initializeCall,
    toggleMicrophone,
    toggleVideo,
    sendChatMessage,
    endCall
  } = useWebRTC({
    callId: callId || "146",
    localVideoRef,
    remoteVideoRef,
    onCallConnected: () => {
      toast.success("Call connected!");
    },
    onCallEnded: () => {
      toast.info("Call ended");
      setCallActive(false);
      // You can add a slight delay before navigation if needed
      setTimeout(() => navigate("/calls"), 1000);
    }
  });

  useEffect(() => {
    // Initialize call when component mounts
    const fetchCallData = async () => {
      try {
        if (callId) {
          console.log("Setting up call with ID:", callId);
          // Add a slight delay to ensure websocket is connected
          setTimeout(() => {
            const isInitiator = location.state?.isInitiator || false;
            console.log("Initializing call as initiator:", isInitiator);
            initializeCall(isInitiator);
          }, 1500);
        } else {
          console.error("No call ID available");
          toast.error("Missing call information");
          navigate("/calls");
        }
      } catch (error) {
        console.error("Error fetching call data:", error);
        toast.error("Failed to initialize call");
      }
    };

    fetchCallData();
  }, [callId, initializeCall, location.state?.isInitiator, navigate]);
  
  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      sender: "You",
      content: message,
    };
    
    setMessages(prev => [...prev, newMessage]);
    sendChatMessage(message);
    setMessage("");
  };
  
  const handleEndCall = () => {
    endCall();
    navigate("/calls");
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    }
  };

  useEffect(() => {
    console.log("WebRTC connection status:", isConnected);
  }, [isConnected]);
  useEffect(() => {
    if (localVideoRef.current) {
      console.log("Local video ref is set", localVideoRef.current);
    } else {
      console.error("Local video ref is null");
    }
    if (remoteVideoRef.current) {
      console.log("Remote video ref is set", remoteVideoRef.current);
    } else {
      console.error("Remote video ref is null");
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Call header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <X className="h-4 w-4" />
          </Button>
          <h1 className="font-medium">{callData.name || "Video Call"}</h1>
          {callData.is_group_call && (
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded">
              Group
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {fullscreen ? (
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
      
      {/* Call content */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-0">
        {/* Main call area */}
        <div className={`relative ${chatOpen ? "md:col-span-3" : "md:col-span-4"} bg-black`}>
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
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-2 bg-background/80 backdrop-blur-sm rounded-full">
            <Button
              variant={micActive ? "ghost" : "destructive"}
              size="icon"
              onClick={toggleMicrophone}
              className="rounded-full"
            >
              {micActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            
            <Button
              variant={videoActive ? "ghost" : "destructive"}
              size="icon"
              onClick={toggleVideo}
              className="rounded-full"
            >
              {videoActive ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="destructive"
              size="icon"
              onClick={handleEndCall}
              className="rounded-full"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
            
            <Button
              variant={chatOpen ? "default" : "ghost"}
              size="icon"
              onClick={() => setChatOpen(!chatOpen)}
              className="rounded-full md:hidden"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Sidebar (chat and participants) - visible on larger screens or when toggled */}
        {chatOpen && (
          <div className="border-l h-full flex flex-col">
            {/* Tabs */}
            <div className="grid grid-cols-2 border-b">
              <Button variant="ghost" className="rounded-none h-12">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button variant="ghost" className="rounded-none h-12">
                <Users className="h-4 w-4 mr-2" />
                Participants
              </Button>
            </div>
            
            {/* Chat messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${
                      msg.sender === "You" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender !== "You" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{msg.sender[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <Card className={`p-2 px-3 max-w-[80%] ${
                      msg.sender === "You" ? "bg-primary text-primary-foreground" : ""
                    }`}>
                      {msg.sender !== "You" && (
                        <p className="text-xs font-medium mb-1">{msg.sender}</p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mb-2" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                />
                <Button size="icon" onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallPage;
