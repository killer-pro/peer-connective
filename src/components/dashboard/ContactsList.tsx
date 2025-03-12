
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Define contact data structure
interface Contact {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
  favorite: boolean;
}

// Mock data
const contacts: Contact[] = [
  {
    id: "1",
    name: "Alex Morgan",
    avatar: "",
    online: true,
    favorite: true,
  },
  {
    id: "2",
    name: "Taylor Swift",
    avatar: "",
    online: true,
    favorite: true,
  },
  {
    id: "3",
    name: "Chris Evans",
    avatar: "",
    online: false,
    favorite: true,
  },
  {
    id: "4",
    name: "Jessica Chen",
    avatar: "",
    online: true,
    favorite: false,
  },
  {
    id: "5",
    name: "Marcus Johnson",
    avatar: "",
    online: false,
    favorite: false,
  },
];

// Filter favorites
const favorites = contacts.filter(contact => contact.favorite);

const ContactsList = () => {
  return (
    <Card className="glass-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Favorite Contacts</CardTitle>
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground flex items-center gap-1">
          View all <ArrowUpRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {favorites.map((contact) => (
            <div key={contact.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
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
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{contact.name}</p>
                  {contact.online && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs px-2">Online</Badge>}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10 h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10 h-8 w-8">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactsList;
