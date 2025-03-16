
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { Check, ChevronDown, Users, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Définir les types de contacts
interface Contact {
  id: string;
  name: string;
  avatarUrl?: string;
  status: "online" | "offline" | "busy" | "away";
}

// Données de contact fictives
const mockContacts: Contact[] = [
  { id: "1", name: "Emma Dupont", status: "online" },
  { id: "2", name: "Michel Chen", status: "busy" },
  { id: "3", name: "Sophie Martin", status: "offline" },
  { id: "4", name: "Jacques Rodriguez", status: "away" },
  { id: "5", name: "Olivia Durand", status: "online" },
  { id: "6", name: "Ethan Petit", status: "offline" }
];

const CreateGroupCallPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // États pour le formulaire
  const [callName, setCallName] = useState("");
  const [callType, setCallType] = useState<"open" | "private">("open");
  const [timeType, setTimeType] = useState<"immediate" | "scheduled">("immediate");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  
  // Gestion des participants sélectionnés
  const toggleParticipant = (contactId: string) => {
    setSelectedParticipants(current => 
      current.includes(contactId)
        ? current.filter(id => id !== contactId)
        : [...current, contactId]
    );
  };

  // Gestion des fonctions d'état
  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "online": return "bg-emerald-500";
      case "busy": return "bg-red-500";
      case "away": return "bg-amber-500";
      case "offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  // Création de l'appel
  const handleCreateCall = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Logique pour créer un appel - dans une application réelle, ceci enverrait les données à une API
    const callData = {
      name: callName,
      type: callType,
      timeType,
      scheduledTime: timeType === "scheduled" 
        ? `${selectedDate ? format(selectedDate, 'yyyy-MM-dd', { locale: fr }) : ''} ${selectedTime}` 
        : null,
      participants: selectedParticipants.map(id => 
        mockContacts.find(contact => contact.id === id)?.name
      )
    };
    
    console.log("Données d'appel:", callData);
    
    toast({
      title: timeType === "immediate" ? "Appel démarré" : "Appel programmé",
      description: timeType === "immediate" 
        ? "Redirection vers la salle d'appel..." 
        : `Appel programmé pour ${format(selectedDate!, 'PPP', { locale: fr })} à ${selectedTime}`,
    });
    
    // Redirection vers la page d'appel ou le tableau de bord
    if (timeType === "immediate") {
      navigate("/call", { state: { groupCall: callData } });
    } else {
      navigate("/schedule");
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Video className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Créer un appel de groupe</h1>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Paramètres de l'appel</CardTitle>
            <CardDescription>
              Configurez votre appel de groupe selon vos préférences
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateCall}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="call-name">Nom de l'appel</Label>
                <Input 
                  id="call-name" 
                  placeholder="Ex: Réunion d'équipe" 
                  value={callName}
                  onChange={(e) => setCallName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Type d'accès</Label>
                <RadioGroup value={callType} onValueChange={(value) => setCallType(value as "open" | "private")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="open" id="access-open" />
                    <Label htmlFor="access-open" className="cursor-pointer">Ouvert (toute personne avec le lien peut rejoindre)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="access-private" />
                    <Label htmlFor="access-private" className="cursor-pointer">Privé (seuls les participants invités peuvent rejoindre)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {callType === "private" && (
                <div className="space-y-2">
                  <Label>Participants ({selectedParticipants.length} sélectionnés)</Label>
                  <div className="border rounded-md">
                    <div 
                      className="p-3 flex items-center justify-between cursor-pointer"
                      onClick={() => setShowParticipants(!showParticipants)}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {selectedParticipants.length 
                            ? `${selectedParticipants.length} participants sélectionnés` 
                            : "Sélectionner des participants"}
                        </span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showParticipants ? "rotate-180" : ""}`} />
                    </div>
                    
                    {showParticipants && (
                      <div className="border-t divide-y max-h-60 overflow-y-auto">
                        {mockContacts.map((contact) => (
                          <div 
                            key={contact.id} 
                            className="flex items-center justify-between p-3 hover:bg-accent/50 cursor-pointer"
                            onClick={() => toggleParticipant(contact.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar>
                                  <AvatarImage src={contact.avatarUrl} />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {contact.name.split(" ").map(n => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(contact.status)}`}></span>
                              </div>
                              <span className="font-medium">{contact.name}</span>
                            </div>
                            {selectedParticipants.includes(contact.id) && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Horaire</Label>
                <RadioGroup value={timeType} onValueChange={(value) => setTimeType(value as "immediate" | "scheduled")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="time-immediate" />
                    <Label htmlFor="time-immediate" className="cursor-pointer">Immédiat (démarrer l'appel maintenant)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scheduled" id="time-scheduled" />
                    <Label htmlFor="time-scheduled" className="cursor-pointer">Programmé (planifier pour plus tard)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {timeType === "scheduled" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {selectedDate ? (
                            format(selectedDate, 'PPP', { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Heure</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner l'heure" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, hour) => (
                          <React.Fragment key={hour}>
                            <SelectItem value={`${hour.toString().padStart(2, '0')}:00`}>
                              {hour.toString().padStart(2, '0')}:00
                            </SelectItem>
                            <SelectItem value={`${hour.toString().padStart(2, '0')}:30`}>
                              {hour.toString().padStart(2, '0')}:30
                            </SelectItem>
                          </React.Fragment>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                {timeType === "immediate" ? "Démarrer l'appel" : "Programmer l'appel"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateGroupCallPage;
