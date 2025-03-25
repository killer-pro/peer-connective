
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video, Phone, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ScheduledCallDisplay } from '@/components/schedule/types';

// Mock calls data for the dashboard, to be replaced with API calls
const mockUpcomingCalls: ScheduledCallDisplay[] = [
  {
    id: "1",
    title: "Weekly Team Meeting",
    callType: "video",
    date: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    startTime: "14:00",
    endTime: "15:00",
    duration: "1h",
    participants: [
      { id: "1", name: "Alex Morgan", avatar: "" },
      { id: "2", name: "Taylor Swift", avatar: "" },
      { id: "3", name: "Chris Evans", avatar: "" },
    ],
    isGroup: true,
    scheduled_time: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  },
  {
    id: "2",
    title: "Project Review",
    callType: "audio",
    date: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    startTime: "16:00",
    endTime: "16:30",
    duration: "30m",
    participants: [
      { id: "2", name: "Taylor Swift", avatar: "" },
    ],
    isGroup: false,
    scheduled_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
  }
];

interface ScheduledCallsProps {
  limit?: number;
}

export const ScheduledCalls: React.FC<ScheduledCallsProps> = ({ limit = 3 }) => {
  const navigate = useNavigate();
  
  // In a real app, you'd fetch data from an API
  const upcomingCalls = mockUpcomingCalls.slice(0, limit);
  
  const handleViewAll = () => {
    navigate('/schedule');
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Scheduled Calls</CardTitle>
        <Button variant="link" className="px-0" onClick={handleViewAll}>View All</Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {upcomingCalls.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No upcoming calls scheduled
          </div>
        ) : (
          upcomingCalls.map((call) => (
            <ScheduledCallItem key={call.id} call={call} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

const ScheduledCallItem: React.FC<{ call: ScheduledCallDisplay }> = ({ call }) => {
  const navigate = useNavigate();

  const callTypeIcon = call.callType === "video" ? 
    <Video className="h-4 w-4 text-blue-500" /> : 
    <Phone className="h-4 w-4 text-green-500" />;
  
  const timeUntil = call.scheduled_time ? 
    formatDistanceToNow(new Date(call.scheduled_time), { addSuffix: true }) : 
    "Time not specified";
  
  const handleJoinCall = () => {
    navigate(`/call?id=${call.id}`);
  };
  
  return (
    <div className="flex items-center gap-4 border rounded-lg p-3">
      <div className="flex-shrink-0">
        {callTypeIcon}
      </div>
      <div className="flex-grow min-w-0">
        <h4 className="font-medium truncate">{call.title}</h4>
        <div className="flex items-center text-sm text-muted-foreground gap-1">
          <CalendarClock className="h-3 w-3" />
          <span>{timeUntil}</span>
        </div>
        <div className="flex items-center mt-1 -space-x-2">
          {call.participants.slice(0, 3).map((participant) => (
            <Avatar key={participant.id} className="h-6 w-6 border border-background">
              <AvatarImage src={participant.avatar} alt={participant.name} />
              <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {call.participants.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
              +{call.participants.length - 3}
            </div>
          )}
        </div>
      </div>
      <Button size="sm" onClick={handleJoinCall}>
        Join
      </Button>
    </div>
  );
};

export default ScheduledCalls;
