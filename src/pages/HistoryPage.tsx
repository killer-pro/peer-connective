
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ArrowDownUp, 
  Download, 
  Video, 
  Phone, 
  Info, 
  Calendar, 
  Clock, 
  Users, 
  Mic 
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Define call history types
interface CallHistoryItem {
  id: string;
  type: "audio" | "video";
  direction: "incoming" | "outgoing" | "missed";
  date: string;
  time: string;
  duration?: string;
  participants: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
  hasRecording: boolean;
}

// Mock data
const mockCallHistory: CallHistoryItem[] = [
  {
    id: "1",
    type: "video",
    direction: "outgoing",
    date: "Today",
    time: "15:30",
    duration: "32:15",
    participants: [
      { id: "1", name: "Emma Johnson" },
      { id: "2", name: "Michael Chen" },
    ],
    hasRecording: true
  },
  {
    id: "2",
    type: "audio",
    direction: "incoming",
    date: "Today",
    time: "12:45",
    duration: "15:20",
    participants: [
      { id: "3", name: "Sophie Williams" }
    ],
    hasRecording: false
  },
  {
    id: "3",
    type: "video",
    direction: "missed",
    date: "Yesterday",
    time: "18:20",
    participants: [
      { id: "4", name: "James Rodriguez" }
    ],
    hasRecording: false
  },
  {
    id: "4",
    type: "audio",
    direction: "outgoing",
    date: "Yesterday",
    time: "10:15",
    duration: "08:45",
    participants: [
      { id: "5", name: "Olivia Smith" }
    ],
    hasRecording: true
  },
  {
    id: "5",
    type: "video",
    direction: "incoming",
    date: "May 15, 2023",
    time: "14:30",
    duration: "48:10",
    participants: [
      { id: "1", name: "Emma Johnson" },
      { id: "2", name: "Michael Chen" },
      { id: "5", name: "Olivia Smith" },
      { id: "6", name: "Ethan Brown" }
    ],
    hasRecording: true
  },
  {
    id: "6",
    type: "audio",
    direction: "missed",
    date: "May 12, 2023",
    time: "09:05",
    participants: [
      { id: "3", name: "Sophie Williams" }
    ],
    hasRecording: false
  },
  {
    id: "7", 
    type: "video",
    direction: "outgoing",
    date: "May 8, 2023",
    time: "16:45",
    duration: "22:30",
    participants: [
      { id: "4", name: "James Rodriguez" }
    ],
    hasRecording: true
  }
];

const HistoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredHistory, setFilteredHistory] = useState<CallHistoryItem[]>(mockCallHistory);
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredHistory(mockCallHistory);
    } else {
      const filtered = mockCallHistory.filter(call => 
        call.participants.some(p => p.name.toLowerCase().includes(query.toLowerCase())) ||
        call.date.toLowerCase().includes(query.toLowerCase()) ||
        call.time.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredHistory(filtered);
    }
  };

  const handleViewRecording = (callId: string) => {
    navigate(`/recordings?callId=${callId}`);
  };

  const getDirectionIcon = (direction: CallHistoryItem["direction"]) => {
    switch (direction) {
      case "incoming": return <ArrowDownUp className="h-4 w-4 rotate-180 text-emerald-500" />;
      case "outgoing": return <ArrowDownUp className="h-4 w-4 text-blue-500" />;
      case "missed": return <ArrowDownUp className="h-4 w-4 rotate-180 text-red-500" />;
    }
  };

  const getDirectionText = (direction: CallHistoryItem["direction"]) => {
    switch (direction) {
      case "incoming": return "Incoming";
      case "outgoing": return "Outgoing";
      case "missed": return "Missed";
    }
  };

  const getDirectionColor = (direction: CallHistoryItem["direction"]) => {
    switch (direction) {
      case "incoming": return "text-emerald-500";
      case "outgoing": return "text-blue-500";
      case "missed": return "text-red-500";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Call History</h1>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => navigate("/recordings")}
          >
            <Mic className="h-4 w-4" />
            <span>View All Recordings</span>
          </Button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search call history..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Calls</TabsTrigger>
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
            <TabsTrigger value="missed">Missed</TabsTrigger>
            <TabsTrigger value="recorded">Recorded</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <CallHistoryList 
              calls={filteredHistory} 
              getDirectionIcon={getDirectionIcon}
              getDirectionText={getDirectionText}
              getDirectionColor={getDirectionColor}
              onViewRecording={handleViewRecording}
            />
          </TabsContent>
          
          <TabsContent value="incoming" className="mt-0">
            <CallHistoryList 
              calls={filteredHistory.filter(call => call.direction === "incoming")} 
              getDirectionIcon={getDirectionIcon}
              getDirectionText={getDirectionText}
              getDirectionColor={getDirectionColor}
              onViewRecording={handleViewRecording}
            />
          </TabsContent>
          
          <TabsContent value="outgoing" className="mt-0">
            <CallHistoryList 
              calls={filteredHistory.filter(call => call.direction === "outgoing")} 
              getDirectionIcon={getDirectionIcon}
              getDirectionText={getDirectionText}
              getDirectionColor={getDirectionColor}
              onViewRecording={handleViewRecording}
            />
          </TabsContent>
          
          <TabsContent value="missed" className="mt-0">
            <CallHistoryList 
              calls={filteredHistory.filter(call => call.direction === "missed")} 
              getDirectionIcon={getDirectionIcon}
              getDirectionText={getDirectionText}
              getDirectionColor={getDirectionColor}
              onViewRecording={handleViewRecording}
            />
          </TabsContent>
          
          <TabsContent value="recorded" className="mt-0">
            <CallHistoryList 
              calls={filteredHistory.filter(call => call.hasRecording)} 
              getDirectionIcon={getDirectionIcon}
              getDirectionText={getDirectionText}
              getDirectionColor={getDirectionColor}
              onViewRecording={handleViewRecording}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

interface CallHistoryListProps {
  calls: CallHistoryItem[];
  getDirectionIcon: (direction: CallHistoryItem["direction"]) => JSX.Element;
  getDirectionText: (direction: CallHistoryItem["direction"]) => string;
  getDirectionColor: (direction: CallHistoryItem["direction"]) => string;
  onViewRecording: (callId: string) => void;
}

const CallHistoryList = ({ 
  calls, 
  getDirectionIcon, 
  getDirectionText, 
  getDirectionColor,
  onViewRecording 
}: CallHistoryListProps) => {
  if (calls.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-background border rounded-lg">
        No calls found matching your criteria
      </div>
    );
  }

  let lastDate = "";
  
  return (
    <div className="space-y-4">
      {calls.map((call) => {
        // Check if we're on a new date group
        const showDateHeader = lastDate !== call.date;
        lastDate = call.date;
        
        return (
          <div key={call.id}>
            {showDateHeader && (
              <div className="flex items-center gap-2 mt-6 mb-2 first:mt-0">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">{call.date}</h3>
              </div>
            )}
            
            <Card className="overflow-hidden">
              <div className="flex justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                    {call.type === "video" ? (
                      <Video className="h-5 w-5 text-accent-foreground" />
                    ) : (
                      <Phone className="h-5 w-5 text-accent-foreground" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {call.participants.length > 1 
                          ? `Group Call (${call.participants.length})` 
                          : call.participants[0]?.name || "Unknown"
                        }
                      </span>
                      <Badge variant="outline" className={`text-xs ${getDirectionColor(call.direction)}`}>
                        {getDirectionText(call.direction)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{call.time}</span>
                      </div>
                      
                      {call.duration && (
                        <>
                          <span>•</span>
                          <span>{call.duration}</span>
                        </>
                      )}
                      
                      {call.participants.length > 1 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{call.participants.length} participants</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {call.hasRecording && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={() => onViewRecording(call.id)}
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span>Recording</span>
                    </Button>
                  )}
                  
                  <div className="flex">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                    {call.direction !== "missed" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryPage;
