import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Video, Plus, Star, MoreVertical, Loader2, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CallService, { Contact, CallData } from "@/services/callService";
import {UserProfile, userService} from "@/services/userService.ts";

// Interface pour représenter un appel avec détails
interface DetailedCallData extends CallData {
  initiator_details: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    profile_image: string | null;
    online_status: boolean;
    last_seen: string;
  };
  participants_details: Array<{
    id: number;
    user: number;
    user_details: {
      id: number;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      phone_number: string | null;
      profile_image: string | null;
      online_status: boolean;
      last_seen: string;
    };
    joined_at: string | null;
    left_at: string | null;
    has_accepted: boolean;
  }>;
  duration: number;
  recording_path:string;
  messages: any[];
  created_at: string,
  updated_at: string,
}

// Interface pour représenter un contact avec appel
interface CallContact extends Contact {
  favorite: boolean;
  lastCall?: {
    date: string;
    duration: string;
    type: "video" | "audio";
    callId: number;
    status: string;
  };
}

const CallsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<CallContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<CallContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await userService.getUserProfile();
      setUserProfile(profile);
    };
    fetchProfile();
  }, []);
  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer tous les contacts
        const contactsData = await CallService.getContacts();

        // Récupérer les favoris
        const favoritesData = await CallService.getFavoriteContacts();
        const favoriteIds = new Set(favoritesData.map(f => f.id));

        // Récupérer l'historique des appels
        const callHistory = await CallService.getCallHistory();

        // Exemple d'appel reçu de l'API
        const recentCallData: DetailedCallData = {
          id: 6,
          initiator: 6,
          initiator_details: {
            id: 6,
            username: "mouha",
            email: "mouhacisse@gmail.com",
            first_name: "mouha",
            last_name: "cissee",
            phone_number: null,
            profile_image: null,
            online_status: true,
            last_seen: "2025-03-16T16:06:19.957991Z"
          },
          participants_details: [
            {
              id: 11,
              user: 6,
              user_details: {
                id: 6,
                username: "mouha",
                email: "mouhacisse@gmail.com",
                first_name: "mouha",
                last_name: "cissee",
                phone_number: null,
                profile_image: null,
                online_status: true,
                last_seen: "2025-03-16T16:06:19.957991Z"
              },
              joined_at: null,
              left_at: null,
              has_accepted: true
            }
          ],
          call_type: "video",
          is_group_call: false,
          title: null,
          status: "completed",
          scheduled_time: null,
          start_time: "2025-03-15T14:30:25Z",
          end_time: "2025-03-15T15:02:40Z",
          recording_path: null,
          created_at: "2025-03-16T18:35:12.670839Z",
          updated_at: "2025-03-16T18:35:12.670839Z",
          duration: 1935.0,
          messages: []
        };

        // Ajouter l'appel récent à l'historique s'il n'est pas déjà présent
        const callExists = callHistory.some(call => call.id === recentCallData.id);
        if (!callExists) {
          callHistory.push(recentCallData);
        }

        // Créer une map des derniers appels par utilisateur
        const lastCallsByUser = new Map<string, {
          date: string;
          duration: string;
          type: "video" | "audio";
          callId: number;
          status: string;
        }>();

        callHistory.forEach(call => {
          const otherParticipants = call.participants_details
              .filter(p => p.user !== parseInt(localStorage.getItem('userId') || '0'))
              .map(p => p.user);

          otherParticipants.forEach(participantId => {
            const key = participantId.toString();
            // Ne stocker que l'appel le plus récent pour cet utilisateur
            if (!lastCallsByUser.has(key) || new Date(call.end_time || '') > new Date(lastCallsByUser.get(key)?.date || '')) {
              lastCallsByUser.set(key, {
                date: call.end_time || '',
                duration: CallService.formatDuration(call.duration),
                type: call.call_type,
                callId: call.id,
                status: call.status
              });
            }
          });
        });

        // S'assurer que le contact de l'appel récent est dans la liste des contacts
        const contactExists = contactsData.some(c => c.id === recentCallData.initiator_details.id.toString());

        if (!contactExists) {
          contactsData.push({
            id: recentCallData.initiator_details.id.toString(),
            username: `${recentCallData.initiator_details.first_name} ${recentCallData.initiator_details.last_name}`,
            avatar: recentCallData.initiator_details.profile_image || '',
            status: recentCallData.initiator_details.online_status ? 'online' : 'offline',
            email: recentCallData.initiator_details.email
          });
        }

        // Enrichir les contacts avec les informations des favoris et derniers appels
        const enrichedContacts: CallContact[] = contactsData.map(contact => ({
          ...contact,
          favorite: favoriteIds.has(contact.id),
          lastCall: lastCallsByUser.get(contact.id) ? {
            date: CallService.formatDate(lastCallsByUser.get(contact.id)?.date),
            duration: lastCallsByUser.get(contact.id)?.duration || '',
            type: lastCallsByUser.get(contact.id)?.type || 'audio',
            callId: lastCallsByUser.get(contact.id)?.callId || 0,
            status: lastCallsByUser.get(contact.id)?.status || 'completed'
          } : undefined
        }));

        setContacts(enrichedContacts);
        setFilteredContacts(enrichedContacts);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrer les contacts par recherche
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
          contact.username.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  };

  // Démarrer un appel
  const handleStartCall = async (contactId: string, callType: "video" | "audio") => {
    try {
      // Créer un nouvel appel
      const callData = await CallService.startCall({
        initiator:userProfile.id,
        call_type: callType,
        is_group_call: false,
        participants: [parseInt(contactId)],
        start_time: new Date().toISOString(),
        status: "in_progress",
      });

      // Rediriger vers la page d'appel avec l'ID de l'appel
      navigate("/call", { state: { callId: callData.id, callType } });
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "online": return "bg-emerald-500";
      case "busy": return "bg-red-500";
      case "away": return "bg-amber-500";
      case "offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  // Changer l'onglet actif
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    if (value === "all") {
      setFilteredContacts(contacts);
    } else if (value === "favorites") {
      setFilteredContacts(contacts.filter(c => c.favorite));
    } else if (value === "recent") {
      setFilteredContacts(contacts.filter(c => c.lastCall));
    }
  };

  // Render le statut d'un appel
  const renderCallStatus = (status: string) => {
    switch(status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "missed":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Missed</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Rejected</Badge>;
      case "ongoing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Ongoing</Badge>;
      default:
        return null;
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

          <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
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
                  {loading ? (
                      <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                  ) : (
                      <div className="divide-y">
                        {filteredContacts.length > 0 ? (
                            filteredContacts.map((contact) => (
                                <div key={contact.id} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <Avatar>
                                        <AvatarImage src={contact.avatar} />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                          {contact.username.split(" ").map(n => n[0]).join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(contact.status)}`}></span>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{contact.username}</span>
                                        {contact.favorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                                      </div>
                                      {contact.lastCall && (
                                          <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                              <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal">
                                                {contact.lastCall.type === "video" ? "Video" : "Audio"}
                                              </Badge>
                                              <span>{contact.lastCall.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                              <Clock className="h-3 w-3" />
                                              <span>{contact.lastCall.duration}</span>
                                              {renderCallStatus(contact.lastCall.status)}
                                            </div>
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
                              No contacts found matching "{searchQuery}"
                            </div>
                        )}
                      </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="mt-0">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Favorite Contacts</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                      <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                  ) : (
                      <div className="divide-y">
                        {filteredContacts.filter(c => c.favorite).length > 0 ? (
                            filteredContacts
                                .filter(contact => contact.favorite)
                                .map((contact) => (
                                    <div key={contact.id} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className="relative">
                                          <Avatar>
                                            <AvatarImage src={contact.avatar} />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                              {contact.username.split(" ").map(n => n[0]).join("")}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(contact.status)}`}></span>
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{contact.username}</span>
                                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                          </div>
                                          {contact.lastCall && (
                                              <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                  <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal">
                                                    {contact.lastCall.type === "video" ? "Video" : "Audio"}
                                                  </Badge>
                                                  <span>{contact.lastCall.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                  <Clock className="h-3 w-3" />
                                                  <span>{contact.lastCall.duration}</span>
                                                  {renderCallStatus(contact.lastCall.status)}
                                                </div>
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
                              No favorite contacts found
                            </div>
                        )}
                      </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle>Recent Calls</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Showing call history
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                      <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                  ) : (
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
                                            <AvatarImage src={contact.avatar} />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                              {contact.username.split(" ").map(n => n[0]).join("")}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(contact.status)}`}></span>
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{contact.username}</span>
                                            {contact.favorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                                          </div>
                                          {contact.lastCall && (
                                              <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                  <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal">
                                                    {contact.lastCall.type === "video" ? "Video" : "Audio"}
                                                  </Badge>
                                                  <Calendar className="h-3 w-3 ml-1" />
                                                  <span>{contact.lastCall.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                  <Clock className="h-3 w-3" />
                                                  <span>{contact.lastCall.duration}</span>
                                                  {renderCallStatus(contact.lastCall.status)}
                                                </div>
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
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => navigate(`/call/${contact.lastCall?.callId}`, { state: { callType: contact.lastCall?.type } })}
                                        >
                                          Details
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Résumé des appels récents */}
          {activeTab === "recent" && (
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Call Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-blue-600 font-medium text-lg">32:35</div>
                      <div className="text-sm text-muted-foreground">Total call time today</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-green-600 font-medium text-lg">5</div>
                      <div className="text-sm text-muted-foreground">Completed calls</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-red-600 font-medium text-lg">2</div>
                      <div className="text-sm text-muted-foreground">Missed calls</div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <div className="text-amber-600 font-medium text-lg">3</div>
                      <div className="text-sm text-muted-foreground">Scheduled calls</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}
        </div>
      </Layout>
  );
};

export default CallsPage;