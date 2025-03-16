
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { 
  Mic, MicOff, Video, VideoOff, Phone, 
  ScreenShare, ScreenShareOff, MessageSquare, 
  Users, Settings, Clock, Share2, MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useCallWebSocket } from "@/hooks/useWebSocket";

const CallPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const groupCall = location.state?.groupCall;
  const callId = groupCall?.id || "default";
  
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showParticipants, setShowParticipants] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  
  // Participants initiaux (seront remplacés par les données du serveur)
  const [participants, setParticipants] = useState([
    { id: '1', name: 'You', avatar: '', isCurrentUser: true, isMuted: false, hasVideo: true },
    { id: '2', name: 'Alex Morgan', avatar: '', isMuted: true, hasVideo: true },
    { id: '3', name: 'Taylor Swift', avatar: '', isMuted: false, hasVideo: false },
  ]);
  
  // Initialisation de la connexion WebSocket
  const { isConnected, send, subscribe } = useCallWebSocket(callId, {
    onOpen: () => {
      toast({
        title: "Connecté à l'appel",
        description: "Vous êtes maintenant connecté à la salle d'appel",
      });
      
      // Envoi d'un message de présence
      send({
        type: "join_call",
        data: {
          name: "User", // À remplacer par le nom de l'utilisateur authentifié
          micEnabled,
          videoEnabled
        }
      });
    },
    onClose: () => {
      toast({
        title: "Déconnecté de l'appel",
        description: "La connexion à la salle d'appel a été perdue",
        variant: "destructive"
      });
    },
    onError: () => {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à la salle d'appel",
        variant: "destructive"
      });
    }
  });
  
  // Abonnement aux différents types de messages
  useEffect(() => {
    if (!isConnected) return;
    
    // Gestion des nouveaux participants
    const unsubscribeParticipantJoin = subscribe("participant_joined", (data) => {
      setParticipants(prev => [
        ...prev,
        {
          id: data.participant.id,
          name: data.participant.name,
          avatar: data.participant.avatar || '',
          isCurrentUser: false,
          isMuted: !data.participant.micEnabled,
          hasVideo: data.participant.videoEnabled
        }
      ]);
      
      toast({
        title: "Nouveau participant",
        description: `${data.participant.name} a rejoint l'appel`,
      });
    });
    
    // Gestion des participants qui quittent
    const unsubscribeParticipantLeave = subscribe("participant_left", (data) => {
      setParticipants(prev => prev.filter(p => p.id !== data.participantId));
      
      toast({
        description: `${data.participantName} a quitté l'appel`,
      });
    });
    
    // Gestion des changements d'états des participants
    const unsubscribeParticipantUpdate = subscribe("participant_update", (data) => {
      setParticipants(prev => prev.map(p => 
        p.id === data.participant.id
          ? {
              ...p,
              isMuted: !data.participant.micEnabled,
              hasVideo: data.participant.videoEnabled
            }
          : p
      ));
    });
    
    // Gestion des messages de chat
    const unsubscribeChatMessage = subscribe("chat_message", (data) => {
      setMessages(prev => [...prev, data.message]);
    });
    
    // Nettoyage des abonnements
    return () => {
      unsubscribeParticipantJoin();
      unsubscribeParticipantLeave();
      unsubscribeParticipantUpdate();
      unsubscribeChatMessage();
    };
  }, [isConnected, subscribe, toast]);
  
  // Envoi des mises à jour d'état au serveur
  useEffect(() => {
    if (isConnected) {
      send({
        type: "update_state",
        data: {
          micEnabled,
          videoEnabled,
          screenShareEnabled
        }
      });
    }
  }, [isConnected, micEnabled, videoEnabled, screenShareEnabled, send]);
  
  // Calcul de la durée de l'appel
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Gestion de la fin d'appel
  const handleEndCall = () => {
    // Envoi d'un message de départ avant la déconnexion
    if (isConnected) {
      send({
        type: "leave_call"
      });
    }
    
    // Redirection vers la page d'accueil
    window.location.href = "/";
  };
  
  // Mock participants
  const participants = [
    { id: '1', name: 'You', avatar: '', isCurrentUser: true, isMuted: false, hasVideo: true },
    { id: '2', name: 'Alex Morgan', avatar: '', isMuted: true, hasVideo: true },
    { id: '3', name: 'Taylor Swift', avatar: '', isMuted: false, hasVideo: false },
  ];
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Call header */}
      <div className="py-4 px-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{groupCall?.name || "Appel"}</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTime(callDuration)}</span>
          </div>
          {!isConnected && (
            <span className="text-sm bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
              Connexion perdue
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button className="text-muted-foreground hover:text-foreground" onClick={() => setShowParticipants(!showParticipants)}>
            <Users className="h-5 w-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <MessageSquare className="h-5 w-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <Share2 className="h-5 w-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Main call area */}
      <div className="flex-1 flex">
        {/* Video grid */}
        <div className={cn("flex-1 p-4 grid gap-4", showParticipants ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
          {participants.map((participant) => (
            <div 
              key={participant.id} 
              className={cn(
                "video-container bg-gray-900 flex items-center justify-center relative overflow-hidden rounded-xl", 
                participant.isCurrentUser && "order-1 md:col-span-2"
              )}
            >
              {participant.hasVideo ? (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  {/* This would be replaced with actual video feed */}
                  <span className="text-white/50">Video Feed</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={participant.avatar} alt={participant.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                      {participant.name.split(" ")[0][0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white font-medium">{participant.name}</span>
                </div>
              )}
              
              {/* Participant info overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                    {participant.name} {participant.isCurrentUser && '(You)'}
                  </span>
                  {participant.isMuted && (
                    <span className="bg-black/60 p-1 rounded-full backdrop-blur-sm">
                      <MicOff className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Participants sidebar */}
        {showParticipants && (
          <div className="w-80 border-l border-border p-4 overflow-y-auto">
            <h3 className="font-medium mb-4">Participants ({participants.length})</h3>
            <div className="space-y-3">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {participant.name.split(" ")[0][0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{participant.name} {participant.isCurrentUser && '(You)'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {participant.isMuted ? (
                      <MicOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Mic className="h-4 w-4 text-primary" />
                    )}
                    {participant.hasVideo ? (
                      <Video className="h-4 w-4 text-primary" />
                    ) : (
                      <VideoOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Call controls */}
      <div className="py-4 px-6 border-t border-border bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Button 
            variant={micEnabled ? "outline" : "secondary"} 
            size="icon"
            className="call-control-btn"
            onClick={() => setMicEnabled(!micEnabled)}
            disabled={!isConnected}
          >
            {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant={videoEnabled ? "outline" : "secondary"}
            size="icon"
            className="call-control-btn"
            onClick={() => setVideoEnabled(!videoEnabled)}
            disabled={!isConnected}
          >
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant={screenShareEnabled ? "secondary" : "outline"}
            size="icon"
            className="call-control-btn"
            onClick={() => setScreenShareEnabled(!screenShareEnabled)}
            disabled={!isConnected}
          >
            {screenShareEnabled ? <ScreenShareOff className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant="destructive" 
            size="icon"
            className="call-control-btn"
            onClick={handleEndCall}
          >
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CallPage;
