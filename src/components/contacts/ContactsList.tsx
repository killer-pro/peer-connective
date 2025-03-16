
import React from 'react';
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BackendContact } from "@/services/contactsService";
import ContactCard from './ContactCard';

interface ContactsListProps {
  contacts: BackendContact[];
  isLoading: boolean;
  onContactAction: (action: string, contact: BackendContact) => void;
  filter?: (contact: BackendContact) => boolean;
}

const ContactsList = ({ contacts, isLoading, onContactAction, filter }: ContactsListProps) => {
  const filteredContacts = filter ? contacts.filter(filter) : contacts;

  return (
    <Card className="glass-card">
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading contacts...</p>
          </div>
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} onAction={onContactAction} />
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No contacts found.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContactsList;
