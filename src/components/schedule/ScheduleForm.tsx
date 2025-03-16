
import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { mockContacts } from './types';
import { ScheduledCallDisplay } from './types';

interface ScheduleFormProps {
  onScheduleCall: (newCall: ScheduledCallDisplay) => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ onScheduleCall }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [newCall, setNewCall] = useState<Partial<ScheduledCallDisplay>>({
    title: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "09:30",
    description: "",
    participants: [],
    isGroup: false,
  });

  const handleAddParticipant = (contactId: string) => {
    if (selectedParticipants.includes(contactId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== contactId));
    } else {
      setSelectedParticipants([...selectedParticipants, contactId]);
    }
  };

  const handleScheduleCall = () => {
    if (!newCall.title || !newCall.date || !newCall.startTime || !newCall.endTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Calculate duration based on start and end time
    const startParts = newCall.startTime.split(':').map(Number);
    const endParts = newCall.endTime.split(':').map(Number);
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];
    const durationMinutes = endMinutes - startMinutes;
    
    if (durationMinutes <= 0) {
      toast({
        title: "Error",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const durationStr = hours > 0 
      ? (minutes > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min` : `${hours} hour${hours > 1 ? 's' : ''}`)
      : `${minutes} min`;

    const selectedContacts = mockContacts.filter(contact => 
      selectedParticipants.includes(contact.id)
    ).map(contact => ({
      id: contact.id,
      name: contact.name,
      avatar: contact.avatar,
    }));

    const scheduledCall: ScheduledCallDisplay = {
      id: String(Date.now()),
      title: newCall.title || "",
      date: newCall.date || new Date(),
      startTime: newCall.startTime || "",
      endTime: newCall.endTime || "",
      duration: durationStr,
      participants: selectedContacts,
      description: newCall.description,
      isGroup: selectedContacts.length > 1,
    };

    onScheduleCall(scheduledCall);
    
    // Reset form
    setNewCall({
      title: "",
      date: new Date(),
      startTime: "09:00",
      endTime: "09:30",
      description: "",
      participants: [],
      isGroup: false,
    });
    setSelectedParticipants([]);
    setIsOpen(false);
    
    toast({
      title: "Call Scheduled",
      description: `"${scheduledCall.title}" has been scheduled.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          <span>Schedule Call</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Schedule New Call</DialogTitle>
          <DialogDescription>
            Fill in the details below to schedule a new call.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Call Title</Label>
            <Input
              id="title"
              placeholder="Weekly Team Meeting"
              value={newCall.title}
              onChange={(e) => setNewCall({...newCall, title: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newCall.date ? format(newCall.date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newCall.date}
                    onSelect={(date) => date && setNewCall({...newCall, date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Select 
                  value={newCall.startTime} 
                  onValueChange={(value) => setNewCall({...newCall, startTime: value})}
                >
                  <SelectTrigger id="startTime">
                    <SelectValue placeholder="09:00" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Select 
                  value={newCall.endTime} 
                  onValueChange={(value) => setNewCall({...newCall, endTime: value})}
                >
                  <SelectTrigger id="endTime">
                    <SelectValue placeholder="09:30" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <>
                        <SelectItem key={`${hour}-00`} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {`${hour.toString().padStart(2, '0')}:00`}
                        </SelectItem>
                        <SelectItem key={`${hour}-30`} value={`${hour.toString().padStart(2, '0')}:30`}>
                          {`${hour.toString().padStart(2, '0')}:30`}
                        </SelectItem>
                      </>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label>Participants</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
              {mockContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors",
                    selectedParticipants.includes(contact.id) && "bg-primary/10"
                  )}
                  onClick={() => handleAddParticipant(contact.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {contact.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{contact.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter call details or agenda..."
              value={newCall.description}
              onChange={(e) => setNewCall({...newCall, description: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleScheduleCall}>Schedule Call</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleForm;
