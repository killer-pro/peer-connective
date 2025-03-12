
import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  Video,
  Plus
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

// Define scheduled call data structure
interface ScheduledCall {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  description?: string;
  isGroup: boolean;
}

// Mock data for contacts
const contacts = [
  { id: "1", name: "Alex Morgan", avatar: "", online: true },
  { id: "2", name: "Taylor Swift", avatar: "", online: true },
  { id: "3", name: "Chris Evans", avatar: "", online: false },
  { id: "4", name: "Jessica Chen", avatar: "", online: true },
  { id: "5", name: "Marcus Johnson", avatar: "", online: false },
];

// Mock data for scheduled calls
const today = new Date();
const mockScheduledCalls: ScheduledCall[] = [
  {
    id: "1",
    title: "Weekly Team Meeting",
    date: today,
    startTime: "14:00",
    endTime: "15:00",
    duration: "1 hour",
    participants: [
      { id: "1", name: "Alex Morgan", avatar: "" },
      { id: "2", name: "Taylor Swift", avatar: "" },
      { id: "3", name: "Chris Evans", avatar: "" },
      { id: "4", name: "Jessica Chen", avatar: "" },
    ],
    description: "Discuss progress on the current sprint and plan for the next one.",
    isGroup: true,
  },
  {
    id: "2",
    title: "Project Discussion",
    date: addDays(today, 1),
    startTime: "10:30",
    endTime: "11:15",
    duration: "45 minutes",
    participants: [
      { id: "2", name: "Taylor Swift", avatar: "" },
      { id: "5", name: "Marcus Johnson", avatar: "" },
    ],
    description: "Review project requirements and timeline.",
    isGroup: true,
  },
  {
    id: "3",
    title: "1:1 with Alex",
    date: addDays(today, 3),
    startTime: "15:15",
    endTime: "15:45",
    duration: "30 minutes",
    participants: [
      { id: "1", name: "Alex Morgan", avatar: "" },
    ],
    description: "Weekly catch-up meeting.",
    isGroup: false,
  },
];

const SchedulePage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>(mockScheduledCalls);
  const [isScheduleCallOpen, setIsScheduleCallOpen] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [newCall, setNewCall] = useState<Partial<ScheduledCall>>({
    title: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "09:30",
    description: "",
    participants: [],
    isGroup: false,
  });
  const { toast } = useToast();

  // Generate an array of dates for the week view
  const currentWeek = Array(7)
    .fill(0)
    .map((_, i) => addDays(startOfWeek(date), i));

  // Filter calls for the selected date
  const callsForSelectedDate = scheduledCalls.filter(call => 
    isSameDay(call.date, date)
  );

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

    const selectedContacts = contacts.filter(contact => 
      selectedParticipants.includes(contact.id)
    ).map(contact => ({
      id: contact.id,
      name: contact.name,
      avatar: contact.avatar,
    }));

    const newScheduledCall: ScheduledCall = {
      id: `${scheduledCalls.length + 1}`,
      title: newCall.title || "",
      date: newCall.date || new Date(),
      startTime: newCall.startTime || "",
      endTime: newCall.endTime || "",
      duration: durationStr,
      participants: selectedContacts,
      description: newCall.description,
      isGroup: selectedContacts.length > 1,
    };

    setScheduledCalls([...scheduledCalls, newScheduledCall]);
    
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
    setIsScheduleCallOpen(false);
    
    toast({
      title: "Call Scheduled",
      description: `"${newScheduledCall.title}" has been scheduled.`,
    });
  };

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    if (isSameDay(date, today)) {
      return "Today";
    }
    if (isSameDay(date, addDays(today, 1))) {
      return "Tomorrow";
    }
    return format(date, "EEEE, MMMM d");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Schedule</h1>
          <Dialog open={isScheduleCallOpen} onOpenChange={setIsScheduleCallOpen}>
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
                    {contacts.map((contact) => (
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
                <Button variant="outline" onClick={() => setIsScheduleCallOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleCall}>Schedule Call</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setDate(new Date())}>
            <CalendarIcon className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium px-2">{format(date, "MMMM yyyy")}</span>
            <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex gap-2 overflow-auto pb-2">
          {currentWeek.map((day) => (
            <Button
              key={day.toString()}
              variant={isSameDay(day, date) ? "default" : "outline"}
              className="flex-shrink-0 h-auto py-2 flex flex-col"
              onClick={() => setDate(day)}
            >
              <span className="text-xs">{format(day, "E")}</span>
              <span className="text-lg">{format(day, "d")}</span>
            </Button>
          ))}
        </div>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle>{formatDateHeader(date)}</CardTitle>
          </CardHeader>
          <CardContent>
            {callsForSelectedDate.length > 0 ? (
              <div className="space-y-4">
                {callsForSelectedDate.map((call) => (
                  <div key={call.id} className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{call.title}</h4>
                      <Button variant="outline" size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 border-none">
                        Join
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{call.startTime} - {call.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Video className="h-3.5 w-3.5" />
                        <span>{call.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground col-span-2">
                        <Users className="h-3.5 w-3.5" />
                        <span>{call.participants.length} participants</span>
                      </div>
                    </div>
                    
                    {call.description && (
                      <p className="text-sm text-muted-foreground mb-3 border-t border-border pt-2">
                        {call.description}
                      </p>
                    )}
                    
                    <div className="flex -space-x-2">
                      {call.participants.slice(0, 4).map((participant, i) => (
                        <Avatar key={participant.id} className={cn("h-8 w-8 border-2 border-background", i > 0 && "ml-[-8px]")}>
                          <AvatarImage src={participant.avatar} alt={participant.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {participant.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {call.participants.length > 4 && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-background ml-[-8px]">
                          +{call.participants.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No calls scheduled for this day.</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsScheduleCallOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Schedule a Call</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SchedulePage;
