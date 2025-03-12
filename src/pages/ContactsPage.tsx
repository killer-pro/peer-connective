
import { useState } from "react";
import { 
  Search, Plus, MoreVertical, 
  User, Phone, Video, Star, Mail, 
  Filter, ChevronDown
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

// Define contact data structure
interface Contact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  online: boolean;
  favorite: boolean;
  lastContact?: string;
  tags?: string[];
}

// Mock data
const contactsData: Contact[] = [
  {
    id: "1",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    avatar: "",
    phone: "+1 (555) 123-4567",
    online: true,
    favorite: true,
    lastContact: "Today, 10:30 AM",
    tags: ["Work", "Project Alpha"]
  },
  {
    id: "2",
    name: "Taylor Swift",
    email: "taylor.swift@example.com",
    avatar: "",
    phone: "+1 (555) 987-6543",
    online: true,
    favorite: true,
    lastContact: "Yesterday, 2:15 PM",
    tags: ["Friend"]
  },
  {
    id: "3",
    name: "Chris Evans",
    email: "chris.evans@example.com",
    avatar: "",
    phone: "+1 (555) 246-8101",
    online: false,
    favorite: true,
    lastContact: "May 20, 3:45 PM",
    tags: ["Work"]
  },
  {
    id: "4",
    name: "Jessica Chen",
    email: "jessica.chen@example.com",
    avatar: "",
    phone: "+1 (555) 369-8520",
    online: true,
    favorite: false,
    lastContact: "May 19, 9:10 AM",
    tags: ["Client"]
  },
  {
    id: "5",
    name: "Marcus Johnson",
    email: "marcus.johnson@example.com",
    avatar: "",
    phone: "+1 (555) 741-8529",
    online: false,
    favorite: false,
    lastContact: "May 15, 11:20 AM",
    tags: ["Friend", "Project Beta"]
  },
  {
    id: "6",
    name: "Emma Thompson",
    email: "emma.thompson@example.com",
    avatar: "",
    phone: "+1 (555) 852-9637",
    online: false,
    favorite: false,
    lastContact: "May 12, 4:30 PM",
    tags: ["Client"]
  },
];

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>(contactsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: "",
    email: "",
    phone: "",
    favorite: false,
    online: false,
    tags: []
  });
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const { toast } = useToast();

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.phone && contact.phone.includes(searchTerm))
  );

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) {
      toast({
        title: "Error",
        description: "Name and email are required fields.",
        variant: "destructive"
      });
      return;
    }

    const newContactComplete: Contact = {
      id: `${contacts.length + 1}`,
      name: newContact.name || "",
      email: newContact.email || "",
      phone: newContact.phone,
      avatar: "",
      online: false,
      favorite: newContact.favorite || false,
      tags: newContact.tags || []
    };

    setContacts([...contacts, newContactComplete]);
    setNewContact({
      name: "",
      email: "",
      phone: "",
      favorite: false,
      online: false,
      tags: []
    });
    setIsAddContactOpen(false);
    
    toast({
      title: "Contact Added",
      description: `${newContactComplete.name} has been added to your contacts.`
    });
  };

  const toggleFavorite = (id: string) => {
    setContacts(contacts.map(contact => 
      contact.id === id ? { ...contact, favorite: !contact.favorite } : contact
    ));
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
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="col-span-3"
                      value={newContact.name}
                      onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      placeholder="john.doe@example.com"
                      className="col-span-3"
                      value={newContact.email}
                      onChange={(e) => setNewContact({...newContact, email: e.target.value})}
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddContact}>Add Contact</Button>
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
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
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
                          onClick={() => toggleFavorite(contact.id)}
                        >
                          <Star className={`h-4 w-4 ${contact.favorite ? 'fill-amber-500' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                          <Video className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedContact(contact)}>
                              <User className="h-4 w-4 mr-2" />
                              <span>View Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Star className="h-4 w-4 mr-2" />
                              <span>{contact.favorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Remove Contact
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
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
                {filteredContacts.filter(c => c.favorite).length > 0 ? (
                  filteredContacts
                    .filter(c => c.favorite)
                    .map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
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
                            onClick={() => toggleFavorite(contact.id)}
                          >
                            <Star className="h-4 w-4 fill-amber-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                            <Video className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setSelectedContact(contact)}>
                                <User className="h-4 w-4 mr-2" />
                                <span>View Profile</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="h-4 w-4 mr-2" />
                                <span>Remove from Favorites</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Remove Contact
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
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
                {filteredContacts.filter(c => c.online).length > 0 ? (
                  filteredContacts
                    .filter(c => c.online)
                    .map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={contact.avatar} alt={contact.name} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {contact.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background"></span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{contact.name}</h3>
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs px-2">Online</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{contact.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                            onClick={() => toggleFavorite(contact.id)}
                          >
                            <Star className={`h-4 w-4 ${contact.favorite ? 'fill-amber-500' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                            <Video className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setSelectedContact(contact)}>
                                <User className="h-4 w-4 mr-2" />
                                <span>View Profile</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="h-4 w-4 mr-2" />
                                <span>{contact.favorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Remove Contact
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
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
                
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Video className="h-4 w-4" />
                    <span>Video</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
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
                      <span className="col-span-2">{selectedContact.lastContact}</span>
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
