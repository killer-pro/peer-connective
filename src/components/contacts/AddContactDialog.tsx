
import React from 'react';
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContactCreate } from "@/services/contactsService";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddContact: () => void;
  newContact: ContactCreate & { email: string; name: string; };
  setNewContact: React.Dispatch<React.SetStateAction<ContactCreate & { email: string; name: string; }>>;
  availableUsers: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    profile_image: string | null;
    online_status: boolean;
    last_seen: string | null;
  }[];
  isLoading: boolean;
}

const AddContactDialog = ({ 
  open, 
  onOpenChange, 
  onAddContact, 
  newContact, 
  setNewContact, 
  availableUsers,
  isLoading 
}: AddContactDialogProps) => {
  // Handle user selection and update email/name fields
  const handleUserChange = (userId: string) => {
    const user = availableUsers.find(u => u.id.toString() === userId);
    
    setNewContact({
      ...newContact,
      contact_user: parseInt(userId),
      email: user?.email || '',
      name: user ? `${user.first_name} ${user.last_name}`.trim() || user.username : ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Enter the details of your new contact below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user" className="text-right">
              User
            </Label>
            <Select
              value={newContact.contact_user?.toString() || ""}
              onValueChange={handleUserChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.first_name} {user.last_name} ({user.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nickname" className="text-right">
              Nickname
            </Label>
            <Input
              id="nickname"
              placeholder="Add a nickname (optional)"
              className="col-span-3"
              value={newContact.nickname}
              onChange={(e) => setNewContact({...newContact, nickname: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              placeholder="+1 (555) 123-4567"
              className="col-span-3"
              value={newContact.phone}
              onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Input
              id="notes"
              placeholder="Add notes (optional)"
              className="col-span-3"
              value={newContact.notes}
              onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAddContact} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactDialog;
