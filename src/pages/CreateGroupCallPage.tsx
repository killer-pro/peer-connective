
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Video } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import CallTypeSelector from "@/components/call/CallTypeSelector";
import TimeTypeSelector from "@/components/call/TimeTypeSelector";
import ParticipantSelector from "@/components/call/ParticipantSelector";
import SchedulePicker from "@/components/call/SchedulePicker";
import { mockContacts } from "@/components/schedule/types";

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
  
  // Gestion des participants sélectionnés
  const toggleParticipant = (contactId: string) => {
    setSelectedParticipants(current => 
      current.includes(contactId)
        ? current.filter(id => id !== contactId)
        : [...current, contactId]
    );
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
              
              <CallTypeSelector value={callType} onChange={setCallType} />
              
              {callType === "private" && (
                <ParticipantSelector 
                  contacts={mockContacts}
                  selectedIds={selectedParticipants}
                  onChange={toggleParticipant}
                />
              )}
              
              <TimeTypeSelector value={timeType} onChange={setTimeType} />
              
              {timeType === "scheduled" && (
                <SchedulePicker
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                />
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
