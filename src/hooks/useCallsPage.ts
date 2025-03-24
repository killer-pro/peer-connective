
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CallService, { Contact, CallData } from "@/services/callService";
import { userService, UserProfile } from "@/services/userService";

// Interface for contact with call history
export interface CallContact extends Contact {
  favorite: boolean;
  lastCall?: {
    date: string;
    duration: string;
    type: "video" | "audio";
    callId: number;
    status: string;
  };
}

export function useCallsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<CallContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<CallContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  // Load user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await userService.getUserProfile();
      setUserProfile(profile);
    };
    fetchProfile();
  }, []);

  // Load contacts and call data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch contacts and favorites
        const contactsData = await CallService.getContacts();
        const favoritesData = await CallService.getFavoriteContacts();
        const favoriteIds = new Set(favoritesData.map(f => f.id));

        // Fetch call history
        const callHistory = await CallService.getCallHistory();

        // Example call data (this would come from the API in a real app)
        const recentCallData = {
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

        // Add example call if not already in history
        const callExists = callHistory.some(call => call.id === recentCallData.id);
        if (!callExists) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          callHistory.push(recentCallData);
        }

        // Create map of last calls by user
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

        // Ensure example contact exists in contacts list
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

        // Enrich contacts with favorite status and call history
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

  // Start a call with a contact
  const handleStartCall = async (contactId: string, callType: "video" | "audio") => {
    try {
      if (!userProfile) return;
      console.log("userprofile id:"+userProfile.id)
      console.log("userprofile calltype:"+callType)
      console.log("userprofile name:"+userProfile.username)
      console.log("userprofile partcipants:"+contactId)
      const callData = await CallService.startCall({
        initiator: userProfile.id,
        call_type: callType,
        is_group_call: false,
        participants: [parseInt(contactId)],
        start_time: new Date().toISOString(),
        status: "in_progress",
      });
      console.log("callData id"+ callData.id) // renvoie bien le bon id de l'appel qu'il devrait transmettre a /call
      console.log("calldata participants : "+callData.participants_details)
      navigate(`/call/${callData.id}`, { state: { callType } });
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  // Filter contacts by search query
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

  // Change active tab
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

  return {
    searchQuery,
    filteredContacts,
    loading,
    activeTab,
    handleSearch,
    handleStartCall,
    handleTabChange
  };
}
