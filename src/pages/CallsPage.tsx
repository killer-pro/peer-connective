
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Video, Plus, Star, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Define call types and mock data
interface CallContact {
  id: string;
  name: string;
  avatarUrl?: string;
  status: "online" | "offline" | "busy" | "away";
  favorite: boolean;
  lastCall?: {
    date: string;
    duration: string;
    type: "video" | "audio";
  };
}

const mockContacts: CallContact[] = [
  {
    id: "1",
    name: "Emma Johnson",
    status: "online",
    favorite: true,
    lastCall: {
      date: "Today, 13:45",
      duration: "32:15",
      type: "video"
    }
  },
  {
    id: "2",
    name: "Michael Chen",
    status: "busy",
    favorite: true,
    lastCall: {
      date: "Yesterday, 18:20",
      duration: "15:42",
      type: "audio"
    }
  },
  {
    id: "3",
    name: "Sophie Williams",
    status: "offline",
    favorite: false,
    lastCall: {
      date: "May 15, 2023",
      duration: "48:10",
      type: "video"
    }
  },
  {
    id: "4",
    name: "James Rodriguez",
    status: "away",
    favorite: false,
    lastCall: {
      date: "May 10, 2023",
      duration: "10:05",
      type: "audio"
    }
  },
  {
    id: "5",
    name: "Olivia Smith",
    status: "online",
    favorite: true
  },
  {
    id: "6",
    name: "Ethan Brown",
    status: "offline",
    favorite: false,
    lastCall: {
      date: "April 28, 2023",
      duration: "28:33",
      type: "video"
    }
  }
];

const CallsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<CallContact[]>(mockContacts);
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredContacts(mockContacts);
    } else {
      const filtered = mockContacts.filter(contact => 
        contact.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  };

  const handleStartCall = (contactId: string, callType: "video" | "audio") => {
    navigate("/call", { state: { contactId, callType } });
  };

  const getStatusColor = (status: CallContact["status"]) => {
    switch (status) {
      case "online": return "bg-emerald-500";
      case "busy": return "bg-red-500";
      case "away": return "bg-amber-500";
      case "offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Calls</h1>
          <Button className="gap-2" onClick={() => navigate("/call")}>
            <Plus className="h-4 w-4" />
            <span>New Call</span>
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Contacts</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Contacts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={contact.avatarUrl} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {contact.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(contact.status)}`}></span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{contact.name}</span>
                              {contact.favorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                            </div>
                            {contact.lastCall && (
                              <p className="text-xs text-muted-foreground">
                                Last call: {contact.lastCall.date} ({contact.lastCall.duration})
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-emerald-600"
                            onClick={() => handleStartCall(contact.id, "audio")}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600"
                            onClick={() => handleStartCall(contact.id, "video")}
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No contacts found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Favorite Contacts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredContacts.filter(c => c.favorite).length > 0 ? (
                    filteredContacts
                      .filter(contact => contact.favorite)
                      .map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={contact.avatarUrl} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {contact.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(contact.status)}`}></span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{contact.name}</span>
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              </div>
                              {contact.lastCall && (
                                <p className="text-xs text-muted-foreground">
                                  Last call: {contact.lastCall.date} ({contact.lastCall.duration})
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-emerald-600"
                              onClick={() => handleStartCall(contact.id, "audio")}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600"
                              onClick={() => handleStartCall(contact.id, "video")}
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No favorite contacts found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Calls</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredContacts.filter(c => c.lastCall).length > 0 ? (
                    filteredContacts
                      .filter(contact => contact.lastCall)
                      .sort((a, b) => {
                        if (!a.lastCall || !b.lastCall) return 0;
                        return new Date(b.lastCall.date).getTime() - new Date(a.lastCall.date).getTime();
                      })
                      .map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={contact.avatarUrl} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {contact.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(contact.status)}`}></span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{contact.name}</span>
                                {contact.favorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                              </div>
                              {contact.lastCall && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal">
                                    {contact.lastCall.type === "video" ? "Video" : "Audio"}
                                  </Badge>
                                  <span>{contact.lastCall.date}</span>
                                  <span>•</span>
                                  <span>{contact.lastCall.duration}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-emerald-600"
                              onClick={() => handleStartCall(contact.id, "audio")}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600"
                              onClick={() => handleStartCall(contact.id, "video")}
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No recent calls found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CallsPage;
