
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Phone, Video, MoreVertical, Clock } from "lucide-react";
import { CallContact } from "@/hooks/useCallsPage";

interface ContactListItemProps {
  contact: CallContact;
  onStartCall: (contactId: string, callType: "video" | "audio") => void;
}

const ContactListItem: React.FC<ContactListItemProps> = ({ contact, onStartCall }) => {
  // Get color for status indicator
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-emerald-500";
      case "busy": return "bg-red-500";
      case "away": return "bg-amber-500";
      case "offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  // Render call status
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
    <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
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
          onClick={() => onStartCall(contact.id, "audio")}
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-blue-600"
          onClick={() => onStartCall(contact.id, "video")}
        >
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ContactListItem;
