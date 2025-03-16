
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Users, Video, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { callsApi } from "@/services/api";
import { ScheduledCall } from "@/types/call";
import { format } from "date-fns";

const ScheduledCalls = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch scheduled calls using React Query
  const { data: apiScheduledCalls, isLoading, error } = useQuery({
    queryKey: ['scheduledCalls'],
    queryFn: callsApi.getScheduledCalls,
  });

  // Process API data to match our component needs
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);

  useEffect(() => {
    if (apiScheduledCalls) {
      // Transform API data to component format
      const formattedCalls = apiScheduledCalls.map((call: any) => {
        const startTime = call.scheduled_time ? new Date(call.scheduled_time) : new Date();
        // Calculate end time (assuming 1 hour if not specified)
        const endTime = call.end_time ? new Date(call.end_time) : new Date(startTime.getTime() + 60 * 60 * 1000);
        
        // Format the time strings
        const startTimeStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTimeStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Calculate a human-readable duration
        const durationMs = endTime.getTime() - startTime.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const durationStr = hours > 0 
          ? (minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`)
          : `${minutes}min`;
        
        // Format the date for display
        let dateLabel = "Today";
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        if (startTime.getDate() === tomorrow.getDate() && 
            startTime.getMonth() === tomorrow.getMonth() && 
            startTime.getFullYear() === tomorrow.getFullYear()) {
          dateLabel = "Tomorrow";
        } else if (startTime.getDate() !== today.getDate() || 
                   startTime.getMonth() !== today.getMonth() || 
                   startTime.getFullYear() !== today.getFullYear()) {
          dateLabel = format(startTime, "MMM d");
        }
        
        return {
          id: call.id,
          title: call.title || `Call with ${call.participants.length} participants`,
          date: startTime,
          startTime: startTimeStr,
          endTime: endTimeStr,
          duration: durationStr,
          participants: Array.isArray(call.participants) ? call.participants.map((p: any) => ({
            id: typeof p === 'object' ? p.id : p,
            name: typeof p === 'object' ? p.username : 'User',
            avatar: typeof p === 'object' ? p.profile_image : undefined,
          })) : [],
          isGroup: call.is_group_call,
          dateLabel
        };
      });
      
      // Sort by date
      formattedCalls.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Take the next 3 upcoming calls
      setScheduledCalls(formattedCalls.slice(0, 3));
    }
  }, [apiScheduledCalls]);

  // Handle joining a call
  const handleJoinCall = (callId: string | number) => {
    navigate(`/call`, { state: { callId } });
  };

  if (isLoading) {
    return (
      <Card className="glass-card h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold">Upcoming Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors h-32">
                <div className="bg-muted h-4 rounded w-2/3 mb-2"></div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-muted h-3 rounded w-1/2"></div>
                  <div className="bg-muted h-3 rounded w-1/2"></div>
                  <div className="bg-muted h-3 rounded w-1/2"></div>
                  <div className="bg-muted h-3 rounded w-1/2"></div>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-8 w-8 bg-muted rounded-full"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold">Upcoming Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            Failed to load scheduled calls. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Upcoming Calls</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-sm text-muted-foreground flex items-center gap-1"
          onClick={() => navigate('/schedule')}
        >
          View all <ArrowUpRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scheduledCalls.length > 0 ? (
            scheduledCalls.map((call) => (
              <div key={call.id} className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{call.title}</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 border-none"
                    onClick={() => handleJoinCall(call.id)}
                  >
                    Join
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{call.dateLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{call.startTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Video className="h-3.5 w-3.5" />
                    <span>{call.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{call.participants.length} participants</span>
                  </div>
                </div>
                
                <div className="flex -space-x-2">
                  {call.participants.slice(0, 4).map((participant, i) => (
                    <Avatar key={participant.id} className={cn("h-8 w-8 border-2 border-background", i > 0 && "ml-[-8px]")}>
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {participant.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {call.participants.length > 4 && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-background ml-[-8px]">
                      +{call.participants.length - 4}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No upcoming calls. 
              <Button 
                variant="link" 
                className="ml-1 px-1 h-auto" 
                onClick={() => navigate('/schedule')}
              >
                Schedule one now
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduledCalls;
