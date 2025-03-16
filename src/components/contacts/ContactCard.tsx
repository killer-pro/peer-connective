
import React from 'react';
import { Star, Mail, Phone, MoreVertical, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BackendContact } from "@/services/contactsService";

interface ContactCardProps {
  contact: BackendContact;
  onAction: (action: string, contact: BackendContact) => void;
}

const ContactCard = ({ contact, onAction }: ContactCardProps) => (
  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={contact.avatar} alt={contact.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {contact.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        {contact.online && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background"></span>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{contact.name}</h3>
          {contact.online && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs px-2">Online</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{contact.email}</p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
        onClick={() => onAction('favorite', contact)}
      >
        <Star className={`h-4 w-4 ${contact.favorite ? 'fill-amber-500' : ''}`} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary hover:text-primary/80 hover:bg-primary/10"
        onClick={() => onAction('email', contact)}
      >
        <Mail className="h-4 w-4" />
      </Button>
      {contact.phone && (
        <Button
          variant="ghost"
          size="icon"
          className="text-primary hover:text-primary/80 hover:bg-primary/10"
          onClick={() => onAction('phone', contact)}
        >
          <Phone className="h-4 w-4" />
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onAction('view', contact)}>
            <User className="h-4 w-4 mr-2" />
            <span>View Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction('favorite', contact)}>
            <Star className="h-4 w-4 mr-2" />
            <span>{contact.favorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onAction('delete', contact)}
          >
            Remove Contact
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

export default ContactCard;
