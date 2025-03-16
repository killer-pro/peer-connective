
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ScheduledCall } from "@/types/call";

// Fallback empty state component
const EmptyScheduledCalls = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
    <h3 className="text-lg font-medium mb-1">No scheduled calls</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Your upcoming calls will appear here.
    </p>
    <Button
      variant="outline"
      onClick={() => {
        window.location.href = "/schedule";
      }}
    >
      Schedule a call
    </Button>
  </div>
);

interface ScheduledCallsProps {
  calls?: ScheduledCall[];
}

export function ScheduledCalls({ calls }: ScheduledCallsProps) {
  const navigate = useNavigate();
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>(
    calls || []
  );

  // Format the date for display
  const formatDate = (dateStr: Date | string) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return format(date, "d MMM");
  };

  // If there are no scheduled calls, display the empty state
  if (!scheduledCalls || scheduledCalls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyScheduledCalls />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Scheduled Calls</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => navigate("/schedule")}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scheduledCalls.slice(0, 3).map((call) => {
            // For safety, ensure participants is always an array
            const participants = Array.isArray(call.participants) 
              ? call.participants 
              : [];
            
            return (
              <div
                key={call.id}
                className="flex items-start gap-3 p-2 rounded-lg bg-card/50 hover:bg-card/75 transition-colors cursor-pointer"
                onClick={() => navigate(`/call/${call.id}`)}
              >
                <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                  <Video className="h-4 w-4 text-primary" />
                </div>
  
                <div className="flex-grow min-w-0">
                  <h4 className="font-medium text-sm mb-1 truncate">
                    {call.title}
                  </h4>
                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {call.startTime}{call.endTime ? ` - ${call.endTime}` : ''}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {call.date && formatDate(call.date)}
                    </span>
                  </div>
                </div>
  
                <div className="flex -space-x-2">
                  {participants.slice(0, 3).map((participant, i) => {
                    const name = typeof participant === 'object' ? participant.username : '';
                    const avatar = typeof participant === 'object' ? participant.profile_image : '';
                    
                    return (
                      <Avatar
                        key={i}
                        className={cn("h-6 w-6 border border-background")}
                      >
                        <AvatarImage
                          src={avatar || ""}
                          alt={name || "Participant"}
                        />
                        <AvatarFallback className="text-[10px]">
                          {name ? name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {participants.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] border border-background">
                      +{participants.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
