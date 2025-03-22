
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CallContact } from "@/hooks/useCallsPage";
import ContactListItem from "./ContactListItem";

interface ContactsListProps {
  title: string;
  contacts: CallContact[];
  loading: boolean;
  searchQuery?: string;
  onStartCall: (contactId: string, callType: "video" | "audio") => void;
}

const ContactsList: React.FC<ContactsListProps> = ({ 
  title, 
  contacts, 
  loading, 
  searchQuery, 
  onStartCall 
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="divide-y">
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <ContactListItem 
                  key={contact.id} 
                  contact={contact} 
                  onStartCall={onStartCall}
                />
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery 
                  ? `No contacts found matching "${searchQuery}"`
                  : "No contacts found"}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactsList;
