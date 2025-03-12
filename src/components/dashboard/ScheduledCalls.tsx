
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Users, Video, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define scheduled call data structure
interface ScheduledCall {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  isGroup: boolean;
}

// Mock data
const scheduledCalls: ScheduledCall[] = [
  {
    id: "1",
    title: "Weekly Team Meeting",
    date: "Today",
    time: "2:00 PM",
    duration: "1 hour",
    participants: [
      { id: "1", name: "Alex Morgan", avatar: "" },
      { id: "2", name: "Taylor Swift", avatar: "" },
      { id: "3", name: "Chris Evans", avatar: "" },
      { id: "4", name: "Jessica Chen", avatar: "" },
    ],
    isGroup: true,
  },
  {
    id: "2",
    title: "Project Discussion",
    date: "Tomorrow",
    time: "10:30 AM",
    duration: "45 minutes",
    participants: [
      { id: "2", name: "Taylor Swift", avatar: "" },
      { id: "5", name: "Marcus Johnson", avatar: "" },
    ],
    isGroup: true,
  },
  {
    id: "3",
    title: "1:1 with Alex",
    date: "May 24",
    time: "3:15 PM",
    duration: "30 minutes",
    participants: [
      { id: "1", name: "Alex Morgan", avatar: "" },
    ],
    isGroup: false,
  },
];

const ScheduledCalls = () => {
  return (
    <Card className="glass-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Upcoming Calls</CardTitle>
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground flex items-center gap-1">
          View all <ArrowUpRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scheduledCalls.map((call) => (
            <div key={call.id} className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{call.title}</h4>
                <Button variant="outline" size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 border-none">
                  Join
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{call.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{call.time}</span>
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduledCalls;
