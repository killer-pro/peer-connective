
import { useState } from "react";
import { Search, Plus, Filter, ChevronDown } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactCreate, ContactData } from "@/services/contactsService";
import ContactsList from "@/components/contacts/ContactsList";
import ContactDetail from "@/components/contacts/ContactDetail";
import AddContactDialog from "@/components/contacts/AddContactDialog";
import { useContacts } from "@/hooks/useContacts";

const ContactsPage = () => {
  const { 
    contacts, 
    availableUsers, 
    isLoading,
    addContact, 
    toggleFavorite, 
    deleteContact, 
    recordContact 
  } = useContacts();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState<ContactCreate & { email: string; name: string; }>({
    contact_user: 0,
    nickname: "",
    is_favorite: false,
    notes: "",
    phone: "",
    email: "",
    name: ""
  });

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.phone && contact.phone.includes(searchTerm))
  );

  const handleAddContact = async () => {
    const contactData: ContactCreate = {
      contact_user: newContact.contact_user,
      nickname: newContact.nickname,
      is_favorite: newContact.is_favorite,
      notes: newContact.notes,
      phone: newContact.phone
    };
    
    const success = await addContact(contactData);
    if (success) {
      setNewContact({
        contact_user: 0,
        nickname: "",
        is_favorite: false,
        notes: "",
        phone: "",
        email: "",
        name: ""
      });
      setIsAddContactOpen(false);
    }
  };

  const handleContactAction = (action: string, contact: ContactData) => {
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
              filter={(contact) => contact.favorite || false}
            />
          </TabsContent>

          <TabsContent value="online" className="mt-0">
            <ContactsList
              contacts={filteredContacts}
              isLoading={isLoading}
              onContactAction={handleContactAction}
              filter={(contact) => contact.online || false}
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
