
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneOutgoing, PhoneIncoming, PhoneMissed, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Define call types
type CallType = "incoming" | "outgoing" | "missed";

// Define call data structure
interface Call {
  id: string;
  name: string;
  avatar?: string;
  type: CallType;
  time: string;
  duration?: string;
}

// Mock data
const recentCalls: Call[] = [
  {
    id: "1",
    name: "Sophia Anderson",
    avatar: "",
    type: "incoming",
    time: "Today, 10:30 AM",
    duration: "12m 45s",
  },
  {
    id: "2",
    name: "Michael Johnson",
    avatar: "",
    type: "outgoing",
    time: "Yesterday, 2:15 PM",
    duration: "45m 12s",
  },
  {
    id: "3",
    name: "Emma Thompson",
    avatar: "",
    type: "missed",
    time: "Yesterday, 11:20 AM",
  },
  {
    id: "4",
    name: "James Wilson",
    avatar: "",
    type: "incoming",
    time: "May 20, 3:45 PM",
    duration: "5m 32s",
  },
  {
    id: "5",
    name: "Olivia Davis",
    avatar: "",
    type: "outgoing",
    time: "May 19, 9:10 AM",
    duration: "28m 17s",
  },
];

const CallIcon = ({ type }: { type: CallType }) => {
  switch (type) {
    case "incoming":
      return <PhoneIncoming className="h-4 w-4 text-emerald-500" />;
    case "outgoing":
      return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
    case "missed":
      return <PhoneMissed className="h-4 w-4 text-destructive" />;
    default:
      return null;
  }
};

const RecentCalls = () => {
  return (
    <Card className="glass-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Recent Calls</CardTitle>
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground flex items-center gap-1">
          View all <ArrowUpRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCalls.map((call) => (
            <div key={call.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarImage src={call.avatar} alt={call.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {call.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{call.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CallIcon type={call.type} />
                  <span className="truncate">{call.time}</span>
                </div>
              </div>
              
              {call.duration && (
                <div className="text-sm text-muted-foreground">
                  {call.duration}
                </div>
              )}
              
              <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                <PhoneOutgoing className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentCalls;
