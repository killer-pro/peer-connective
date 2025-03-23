
import React from 'react';
import { Clock, Users, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScheduledCallDisplay } from './types';

interface CallCardProps {
  call: ScheduledCallDisplay;
}

const CallCard: React.FC<CallCardProps> = ({ call }) => {
  return (
    <div className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium">{call.title}</h4>
        <Button variant="outline" size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 border-none">
          Join
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {call.startTime && call.endTime 
              ? `${call.startTime} - ${call.endTime}`
              : "Time not specified"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Video className="h-3.5 w-3.5" />
          <span>{call.duration || "Duration not specified"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground col-span-2">
          <Users className="h-3.5 w-3.5" />
          <span>{call.participants.length} participants</span>
        </div>
      </div>
      
      {call.description && (
        <p className="text-sm text-muted-foreground mb-3 border-t border-border pt-2">
          {call.description}
        </p>
      )}
      
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
  );
};

export default CallCard;
