
import { useState, useEffect } from "react";
import {
  Search, Plus, Filter, ChevronDown, Loader2
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { contactsService, BackendContact, ContactCreate } from "@/services/contactsService";
import ContactsList from "@/components/contacts/ContactsList";
import ContactDetail from "@/components/contacts/ContactDetail";
import AddContactDialog from "@/components/contacts/AddContactDialog";

const ContactsPage = () => {
  const [contacts, setContacts] = useState<BackendContact[]>([]);
  const [availableUsers, setAvailableUsers] = useState<BackendContact["contact_user_details"][]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<BackendContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    contact_user: 0,
    nickname: "",
    is_favorite: false,
    notes: "",
    phone: "",
    email: "",
    name: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await contactsService.getContacts();
        setContacts(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    const fetchAvailableUsers = async () => {
      try {
        const users = await contactsService.getAvailableUsers();
        console.log("Available users data:", users);
        setAvailableUsers(Array.isArray(users) ? users : []);
      } catch (error) {
        console.error("Error fetching available users:", error);
        setAvailableUsers([]);
      }
    };

    fetchContacts();
    fetchAvailableUsers();
  }, [toast]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.phone && contact.phone.includes(searchTerm))
  );

  const handleAddContact = async () => {
    if (!newContact.contact_user) {
      toast({
        title: "Error",
        description: "Please select a user to add as a contact.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const createdContact = await contactsService.createContact(newContact);
      setContacts([...contacts, createdContact]);
      setNewContact({
        email: "",
        name: "",
        contact_user: 0,
        nickname: "",
        is_favorite: false,
        notes: "",
        phone: ""
      });
      setIsAddContactOpen(false);

      toast({
        title: "Contact Added",
        description: `${createdContact.name} has been added to your contacts.`
      });
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive"
      });
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

  const handleContactAction = (action: string, contact: BackendContact) => {
    switch (action) {
      case 'email':
        window.location.href = `mailto:${contact.email}`;
        recordContact(contact.id);
        break;
      case 'phone':
        window.location.href = `tel:${contact.phone}`;
        recordContact(contact.id);
        break;
      case 'view':
        setSelectedContact(contact);
        break;
      case 'favorite':
        toggleFavorite(contact.id);
        break;
      case 'delete':
        deleteContact(contact.id);
        break;
      default:
        break;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="sm" variant="outline" className="px-3">
              <Filter className="h-4 w-4 mr-2" />
              <span>Filter</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
            <Button onClick={() => setIsAddContactOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Add Contact</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Contacts</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <ContactsList
              contacts={filteredContacts}
              isLoading={isLoading}
              onContactAction={handleContactAction}
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <ContactsList
              contacts={filteredContacts}
              isLoading={isLoading}
              onContactAction={handleContactAction}
              filter={(contact) => contact.favorite}
            />
          </TabsContent>

          <TabsContent value="online" className="mt-0">
            <ContactsList
              contacts={filteredContacts}
              isLoading={isLoading}
              onContactAction={handleContactAction}
              filter={(contact) => contact.online}
            />
          </TabsContent>
        </Tabs>

        {/* Contact Detail Dialog */}
        <ContactDetail
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onAction={handleContactAction}
        />

        {/* Add Contact Dialog */}
        <AddContactDialog
          open={isAddContactOpen}
          onOpenChange={setIsAddContactOpen}
          onAddContact={handleAddContact}
          newContact={newContact}
          setNewContact={setNewContact}
          availableUsers={availableUsers}
          isLoading={isLoading}
        />
      </div>
    </Layout>
  );
};

export default ContactsPage;
