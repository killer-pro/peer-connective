
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { contactsService, ContactCreate, ContactData } from "@/services/contactsService";

export function useContacts() {
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [availableUsers, setAvailableUsers] = useState<ContactData["contact_user_details"][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
    fetchAvailableUsers();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const data = await contactsService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const users = await contactsService.getAvailableUsers();
      setAvailableUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error("Error fetching available users:", error);
      setAvailableUsers([]);
    }
  };

  const addContact = async (newContact: ContactCreate) => {
    if (!newContact.contact_user) {
      toast({
        title: "Error",
        description: "Please select a user to add as a contact.",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsLoading(true);
      const createdContact = await contactsService.createContact(newContact);
      setContacts(prev => [...prev, createdContact]);
      
      toast({
        title: "Contact Added",
        description: `${createdContact.name} has been added to your contacts.`
      });
      return true;
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (id: number) => {
    try {
      const contactIndex = contacts.findIndex(c => c.id === id);
      if (contactIndex === -1) return;

      const updatedContact = await contactsService.toggleFavorite(id);

      setContacts(contacts.map(contact =>
        contact.id === id ? updatedContact : contact
      ));

      toast({
        title: updatedContact.favorite ? "Added to Favorites" : "Removed from Favorites",
        description: `${updatedContact.name} has been ${updatedContact.favorite ? 'added to' : 'removed from'} your favorites.`
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteContact = async (id: number) => {
    try {
      const contactToDelete = contacts.find(c => c.id === id);
      if (!contactToDelete) return;

      await contactsService.deleteContact(id);
      setContacts(contacts.filter(contact => contact.id !== id));

      toast({
        title: "Contact Deleted",
        description: `${contactToDelete.name} has been removed from your contacts.`
      });
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive"
      });
    }
  };

  const recordContact = async (id: number) => {
    try {
      const updatedContact = await contactsService.recordContact(id);
      setContacts(contacts.map(contact =>
        contact.id === id ? updatedContact : contact
      ));
    } catch (error) {
      console.error("Error recording contact:", error);
    }
  };

  return {
    contacts,
    availableUsers,
    isLoading,
    addContact,
    toggleFavorite,
    deleteContact,
    recordContact,
    fetchContacts
  };
}
