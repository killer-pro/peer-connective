
import React from 'react';
import { Phone, Mail, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackendContact } from "@/services/contactsService";

interface ContactDetailProps {
  contact: BackendContact | null;
  onClose: () => void;
  onAction: (action: string, contact: BackendContact) => void;
}

const ContactDetail = ({ contact, onClose, onAction }: ContactDetailProps) => {
  if (!contact) return null;

  return (
    <Dialog open={!!contact} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contact Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {contact.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">{contact.name}</h2>
          {contact.nickname && (
            <p className="text-sm text-muted-foreground -mt-3">"{contact.nickname}"</p>
          )}

          <div className="flex items-center gap-2 mt-2">
            {contact.phone && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onAction('phone', contact)}
              >
                <Phone className="h-4 w-4" />
                <span>Call</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onAction('email', contact)}
            >
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onAction('favorite', contact)}
            >
              <Star className={`h-4 w-4 ${contact.favorite ? 'fill-amber-500' : ''}`} />
              <span>{contact.favorite ? 'Unfavorite' : 'Favorite'}</span>
            </Button>
          </div>

          <div className="w-full space-y-4 mt-4">
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground">Email</span>
              <span className="col-span-2">{contact.email}</span>
            </div>
            {contact.phone && (
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="text-muted-foreground">Phone</span>
                <span className="col-span-2">{contact.phone}</span>
              </div>
            )}
            {contact.lastContact && (
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="text-muted-foreground">Last Contact</span>
                <span className="col-span-2">{new Date(contact.lastContact).toLocaleDateString()}</span>
              </div>
            )}
            {contact.notes && (
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="text-muted-foreground">Notes</span>
                <span className="col-span-2">{contact.notes}</span>
              </div>
            )}
            {contact.groups && contact.groups.length > 0 && (
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="text-muted-foreground">Groups</span>
                <div className="col-span-2 flex flex-wrap gap-2">
                  {contact.groups.map(group => (
                    <Badge key={group.id} variant="secondary">{group.name}</Badge>
                  ))}
                </div>
              </div>
            )}
            {contact.tags && contact.tags.length > 0 && (
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="text-muted-foreground">Tags</span>
                <div className="col-span-2 flex flex-wrap gap-2">
                  {contact.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              onAction('delete', contact);
              onClose();
            }}
            className="mr-auto"
          >
            Delete Contact
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetail;
