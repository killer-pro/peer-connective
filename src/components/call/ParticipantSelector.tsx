
import React, { useState } from "react";
import { Check, ChevronDown, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Contact, getStatusColor, mockContacts } from "@/types/contact";

interface ParticipantSelectorProps {
  selectedParticipants: string[];
  onParticipantToggle: (contactId: string) => void;
}

const ParticipantSelector = ({ selectedParticipants, onParticipantToggle }: ParticipantSelectorProps) => {
  const [showParticipants, setShowParticipants] = useState(false);

  return (
    <div className="space-y-2">
      <Label>Participants ({selectedParticipants.length} sélectionnés)</Label>
      <div className="border rounded-md">
        <div 
          className="p-3 flex items-center justify-between cursor-pointer"
          onClick={() => setShowParticipants(!showParticipants)}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {selectedParticipants.length 
                ? `${selectedParticipants.length} participants sélectionnés` 
                : "Sélectionner des participants"}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${showParticipants ? "rotate-180" : ""}`} />
        </div>
        
        {showParticipants && (
          <div className="border-t divide-y max-h-60 overflow-y-auto">
            {mockContacts.map((contact) => (
              <div 
                key={contact.id} 
                className="flex items-center justify-between p-3 hover:bg-accent/50 cursor-pointer"
                onClick={() => onParticipantToggle(contact.id)}
              >
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
                  <span className="font-medium">{contact.name}</span>
                </div>
                {selectedParticipants.includes(contact.id) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantSelector;
