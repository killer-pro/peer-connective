
// Fix for the redeclaration of participants variable
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

const PEER_CONNECTION_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const CallPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { callId } = useParams();
  const location = useLocation();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  
  // State for UI
  const [callActive, setCallActive] = useState<boolean>(true);
  const [micActive, setMicActive] = useState<boolean>(true);
  const [videoActive, setVideoActive] = useState<boolean>(true);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Array<{sender: string, content: string}>>([]);
  
  // Mock data to be replaced with real API calls
  const [callData, setCallData] = useState<any>(
    location.state?.groupCall || {
      id: callId || "1",
      name: "Conference Call",
      type: "video",
    }
  );
  
  // Define the contact list here
  const participantsList = [
    {
      id: "1",
      name: "Alex Morgan",
      avatar: "",
      status: "online",
    },
    {
      id: "2",
      name: "James Wilson",
      avatar: "",
      status: "offline",
    },
    {
      id: "3",
      name: "Sarah Johnson",
      avatar: "",
      status: "online",
    },
  ];

  useEffect(() => {
    // Initialize WebRTC
    const initWebRTC = async () => {
      try {
        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        // Display local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Create peer connection
        peerConnection.current = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
        
        // Add tracks to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.current?.addTrack(track, stream);
        });
        
        // Create data channel for chat
        dataChannel.current = peerConnection.current.createDataChannel("chat");
        setupDataChannel(dataChannel.current);
        
        // Set up event handlers for peer connection
        peerConnection.current.onicecandidate = event => {
          if (event.candidate) {
            // Send to signaling server
            console.log("New ICE candidate:", event.candidate);
          }
        };
        
        peerConnection.current.ontrack = event => {
          // Display remote video
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
        
        // In a real application, here you would:
        // 1. Connect to a signaling server
        // 2. Exchange SDP and ICE candidates with other peers
        
      } catch (error) {
        console.error("Error initializing WebRTC:", error);
        toast({
          variant: "destructive",
          title: "Failed to start call",
          description: "Could not access camera or microphone. Please check permissions.",
        });
      }
    };
    
    initWebRTC();
    
    // Cleanup function
    return () => {
      // Close peer connection
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      
      // Stop all tracks
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);
  
  const setupDataChannel = (channel: RTCDataChannel) => {
    channel.onopen = () => {
      console.log("Data channel is open");
    };
    
    channel.onmessage = event => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };
    
    channel.onclose = () => {
      console.log("Data channel is closed");
    };
  };
  
  const toggleMic = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setMicActive(audioTracks[0]?.enabled || false);
    }
  };
  
  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setVideoActive(videoTracks[0]?.enabled || false);
    }
  };
  
  const sendMessage = () => {
    if (!message.trim() || !dataChannel.current) return;
    
    const newMessage = {
      sender: "You",
      content: message,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    if (dataChannel.current.readyState === "open") {
      dataChannel.current.send(JSON.stringify(newMessage));
    }
    
    setMessage("");
  };
  
  const endCall = () => {
    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    
    // Stop all tracks
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    setCallActive(false);
    
    toast({
      title: "Call ended",
      description: "The call has been disconnected.",
    });
    
    // Navigate back
    navigate("/");
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
              onClick={toggleMic}
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
              onClick={endCall}
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
