import { useState, useEffect } from "react";
import {
  Search, Plus, MoreVertical,
  User, Phone, Video, Star, Mail,
  Filter, ChevronDown, Loader2
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { contactsService, BackendContact } from "@/services/contactsService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        setAvailableUsers(users);
      } catch (error) {
        console.error("Error fetching available users:", error);
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

  const ContactCard = ({ contact }: { contact: BackendContact }) => (
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
              onClick={() => handleContactAction('favorite', contact)}
          >
            <Star className={`h-4 w-4 ${contact.favorite ? 'fill-amber-500' : ''}`} />
          </Button>
          <Button
              variant="ghost"
              size="icon"
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
              onClick={() => handleContactAction('email', contact)}
          >
            <Mail className="h-4 w-4" />
          </Button>
          {contact.phone && (
              <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                  onClick={() => handleContactAction('phone', contact)}
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
              <DropdownMenuItem onClick={() => handleContactAction('view', contact)}>
                <User className="h-4 w-4 mr-2" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleContactAction('favorite', contact)}>
                <Star className="h-4 w-4 mr-2" />
                <span>{contact.favorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleContactAction('delete', contact)}
              >
                Remove Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
  );

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
              <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    <span>Add Contact</span>
                  </Button>
                </DialogTrigger>
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
                          onValueChange={(value) => setNewContact({...newContact, contact_user: parseInt(value)})}
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
                    <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddContact} disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Contact
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Contacts</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="online">Online</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <Card className="glass-card">
                <div className="divide-y divide-border">
                  {isLoading ? (
                      <div className="py-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Loading contacts...</p>
                      </div>
                  ) : filteredContacts.length > 0 ? (
                      filteredContacts.map((contact) => (
                          <ContactCard key={contact.id} contact={contact} />
                      ))
                  ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">No contacts found.</p>
                      </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="mt-0">
              <Card className="glass-card">
                <div className="divide-y divide-border">
                  {isLoading ? (
                      <div className="py-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Loading contacts...</p>
                      </div>
                  ) : filteredContacts.filter(c => c.favorite).length > 0 ? (
                      filteredContacts
                          .filter(c => c.favorite)
                          .map((contact) => (
                              <ContactCard key={contact.id} contact={contact} />
                          ))
                  ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">No favorite contacts found.</p>
                      </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="online" className="mt-0">
              <Card className="glass-card">
                <div className="divide-y divide-border">
                  {isLoading ? (
                      <div className="py-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Loading contacts...</p>
                      </div>
                  ) : filteredContacts.filter(c => c.online).length > 0 ? (
                      filteredContacts
                          .filter(c => c.online)
                          .map((contact) => (
                              <ContactCard key={contact.id} contact={contact} />
                          ))
                  ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">No online contacts found.</p>
                      </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Contact Detail Dialog */}
          {selectedContact && (
              <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Contact Details</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {selectedContact.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">{selectedContact.name}</h2>
                    {selectedContact.nickname && (
                        <p className="text-sm text-muted-foreground -mt-3">"{selectedContact.nickname}"</p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      {selectedContact.phone && (
                          <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleContactAction('phone', selectedContact)}
                          >
                            <Phone className="h-4 w-4" />
                            <span>Call</span>
                          </Button>
                      )}
                      <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleContactAction('email', selectedContact)}
                      >
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </Button>
                      <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleContactAction('favorite', selectedContact)}
                      >
                        <Star className={`h-4 w-4 ${selectedContact.favorite ? 'fill-amber-500' : ''}`} />
                        <span>{selectedContact.favorite ? 'Unfavorite' : 'Favorite'}</span>
                      </Button>
                    </div>

                    <div className="w-full space-y-4 mt-4">
                      <div className="grid grid-cols-3 border-b pb-2">
                        <span className="text-muted-foreground">Email</span>
                        <span className="col-span-2">{selectedContact.email}</span>
                      </div>
                      {selectedContact.phone && (
                          <div className="grid grid-cols-3 border-b pb-2">
                            <span className="text-muted-foreground">Phone</span>
                            <span className="col-span-2">{selectedContact.phone}</span>
                          </div>
                      )}
                      {selectedContact.lastContact && (
                          <div className="grid grid-cols-3 border-b pb-2">
                            <span className="text-muted-foreground">Last Contact</span>
                            <span className="col-span-2">{new Date(selectedContact.lastContact).toLocaleDateString()}</span>
                          </div>
                      )}
                      {selectedContact.notes && (
                          <div className="grid grid-cols-3 border-b pb-2">
                            <span className="text-muted-foreground">Notes</span>
                            <span className="col-span-2">{selectedContact.notes}</span>
                          </div>
                      )}
                      {selectedContact.groups && selectedContact.groups.length > 0 && (
                          <div className="grid grid-cols-3 border-b pb-2">
                            <span className="text-muted-foreground">Groups</span>
                            <div className="col-span-2 flex flex-wrap gap-2">
                              {selectedContact.groups.map(group => (
                                  <Badge key={group.id} variant="secondary">{group.name}</Badge>
                              ))}
                            </div>
                          </div>
                      )}
                      {selectedContact.tags && selectedContact.tags.length > 0 && (
                          <div className="grid grid-cols-3 border-b pb-2">
                            <span className="text-muted-foreground">Tags</span>
                            <div className="col-span-2 flex flex-wrap gap-2">
                              {selectedContact.tags.map(tag => (
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
                          deleteContact(selectedContact.id);
                          setSelectedContact(null);
                        }}
                        className="mr-auto"
                    >
                      Delete Contact
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedContact(null)}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
          )}
        </div>
      </Layout>
  );
};

export default ContactsPage;
