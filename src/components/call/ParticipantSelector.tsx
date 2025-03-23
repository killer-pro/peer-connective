
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface Contact {
  id: string;
  username: string;
  email: string;
  avatar: string;
  status: string;
}

export interface ParticipantSelectorProps {
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  contacts?: Contact[];
}

// Mock contacts for the ParticipantSelector when contacts are not provided
const mockContacts: Contact[] = [
  {
    id: "1",
    username: "alex.morgan",
    email: "alex.morgan@example.com",
    avatar: "",
    status: "online"
  },
  {
    id: "2",
    username: "taylor.swift",
    email: "taylor.swift@example.com",
    avatar: "",
    status: "offline"
  },
  {
    id: "3",
    username: "chris.evans",
    email: "chris.evans@example.com",
    avatar: "",
    status: "online"
  },
  {
    id: "4",
    username: "jessica.chen",
    email: "jessica.chen@example.com",
    avatar: "",
    status: "busy"
  },
  {
    id: "5",
    username: "marcus.johnson",
    email: "marcus.johnson@example.com",
    avatar: "",
    status: "away"
  }
];

const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({ 
  selectedIds, 
  onChange,
  contacts = mockContacts 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter contacts based on search term
  const filteredContacts = contacts.filter(
    contact => 
      contact.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Toggle selection of a contact
  const toggleContact = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };
  
  // Remove a selected contact
  const removeContact = (id: string) => {
    onChange(selectedIds.filter(selectedId => selectedId !== id));
  };
  
  return (
    <div className="space-y-2">
      {/* Selected contacts */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedIds.map(id => {
            const contact = contacts.find(c => c.id === id);
            if (!contact) return null;
            
            return (
              <div 
                key={id}
                className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-full text-sm"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={contact.avatar} alt={contact.username} />
                  <AvatarFallback className="text-xs">
                    {contact.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{contact.username}</span>
                <button 
                  type="button"
                  onClick={() => removeContact(id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search participants..."
          className="pl-9"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Contact list */}
      <div className="max-h-56 overflow-y-auto border rounded-md">
        {filteredContacts.length > 0 ? (
          <ul className="divide-y">
            {filteredContacts.map(contact => (
              <li key={contact.id}>
                <button
                  type="button"
                  className={`flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-muted transition-colors ${
                    selectedIds.includes(contact.id) ? 'bg-secondary/50' : ''
                  }`}
                  onClick={() => toggleContact(contact.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contact.avatar} alt={contact.username} />
                    <AvatarFallback>
                      {contact.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{contact.username}</div>
                    <div className="text-xs text-muted-foreground">{contact.email}</div>
                  </div>
                  <div className="ml-auto flex items-center">
                    <span 
                      className={`h-2.5 w-2.5 rounded-full ${
                        contact.status === 'online' ? 'bg-green-500' : 
                        contact.status === 'busy' ? 'bg-red-500' : 
                        contact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-20 text-muted-foreground">
            No matching contacts found
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantSelector;
