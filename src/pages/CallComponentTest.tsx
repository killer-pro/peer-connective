
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { useWebRTC } from '@/hooks/useWebRTC';
import CallService from '@/services/callService';

// Custom hook to manage call data fetching
const useCallData = (callId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callData, setCallData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchCallData = async () => {
      try {
        setLoading(true);
        
        // Get call details
        const callDetails = await CallService.getCallDetails(Number(callId));
        
        // Get current user profile
        const userProfile = await CallService.getCurrentUser();
        
        setCallData(callDetails);
        setCurrentUser(userProfile);
      } catch (err) {
        console.error('Error fetching call data:', err);
        setError('Failed to load call data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (callId) {
      fetchCallData();
    }
  }, [callId]);

  return { callData, currentUser, loading, error };
};

const CallPage = () => {
  const { callId = '' } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const { callData, currentUser, loading, error } = useCallData(callId);
  
  const {
    isConnected,
    micActive,
    videoActive,
    initializeCall,
    toggleMicrophone,
    toggleVideo,
    endCall
  } = useWebRTC({
    callId,
    localVideoRef,
    remoteVideoRef,
    onCallConnected: () => {
      toast({
        title: "Call Connected",
        description: "You are now connected to the call"
      });
    },
    onCallEnded: () => {
      toast({
        title: "Call Ended",
        description: "The call has ended"
      });
      handleEndCall();
    }
  });
  
  // Handle initial setup
  useEffect(() => {
    if (!loading && callData && currentUser) {
      const isInitiator = callData.initiator === currentUser.id;
      initializeCall(isInitiator);
    }
  }, [loading, callData, currentUser, initializeCall]);
  
  const handleToggleMic = () => {
    toggleMicrophone();
    setIsMuted(!isMuted);
  };
  
  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoOff(!isVideoOff);
  };
  
  const handleEndCall = async () => {
    endCall();
    
    try {
      // Notify the backend that the user has left the call
      if (callId) {
        await CallService.leaveCall(Number(callId));
      }
    } catch (error) {
      console.error('Error ending call:', error);
    } finally {
      // Navigate back to calls page
      navigate('/calls');
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <h2 className="text-xl font-bold text-red-500 mb-4">{error}</h2>
          <Button onClick={() => navigate('/calls')}>Back to Calls</Button>
        </div>
      </Layout>
    );
  }
  
  const callType = callData?.call_type || 'video';
  const callTitle = callData?.title || 'Call';
  const otherParticipant = callData?.participants_details.find((p: any) => 
    p.user !== currentUser?.id
  )?.user_details?.username || 'Participant';
  
  return (
    <Layout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{callTitle}</h1>
          <p className="text-muted-foreground">
            {callType === 'video' ? 'Video' : 'Audio'} call with {otherParticipant}
          </p>
          <p className="text-sm text-muted-foreground">
            Status: {isConnected ? 'Connected' : 'Connecting...'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Remote Video (Large) */}
          <Card className="lg:col-span-2 aspect-video">
            <CardContent className="p-0 h-full flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
              {callType === 'video' ? (
                <video 
                  ref={remoteVideoRef} 
                  className="w-full h-full object-cover"
                  autoPlay 
                  playsInline
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white">
                  <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold mb-4">
                    {otherParticipant[0]?.toUpperCase()}
                  </div>
                  <p className="text-xl">{otherParticipant}</p>
                  <p className="text-sm opacity-70">Audio Call</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Local Video (Small) */}
          <Card className="aspect-video lg:aspect-auto">
            <CardContent className="p-0 h-full flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden">
              {callType === 'video' && !isVideoOff ? (
                <video 
                  ref={localVideoRef} 
                  className="w-full h-full object-cover mirror"
                  autoPlay 
                  playsInline 
                  muted
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white">
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold mb-2">
                    {currentUser?.username?.[0]?.toUpperCase() || 'Y'}
                  </div>
                  <p className="text-sm">You {isVideoOff ? '(Camera Off)' : ''}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Call Controls */}
        <div className="flex items-center justify-center space-x-4 mt-8">
          <Button 
            variant={isMuted ? "outline" : "default"}
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={handleToggleMic}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </Button>
          
          {callType === 'video' && (
            <Button 
              variant={isVideoOff ? "outline" : "default"}
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={handleToggleVideo}
            >
              {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
            </Button>
          )}
          
          <Button 
            variant="destructive"
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={handleEndCall}
          >
            <PhoneOff size={22} />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CallPage;
