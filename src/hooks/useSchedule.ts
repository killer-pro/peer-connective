
import { useState } from "react";
import { addDays, startOfWeek, isSameDay } from "date-fns";
import { ScheduledCallDisplay } from "@/components/schedule/types";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export function useSchedule(initialCalls: ScheduledCallDisplay[] = []) {
  const [date, setDate] = useState<Date>(new Date());
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCallDisplay[]>(initialCalls);
  const { toast } = useToast();

  // Generate an array of dates for the week view
  const currentWeek = Array(7)
    .fill(0)
    .map((_, i) => addDays(startOfWeek(date), i));

  // Filter calls for the selected date
  const callsForSelectedDate = scheduledCalls.filter(call => 
    call.date && isSameDay(new Date(call.date), date)
  );

  const handleScheduleCall = (values: any) => {
    try {
      const startTime = values.time || "12:00";
      const [hours, minutes] = startTime.split(":").map(Number);
      
      // Calculate end time (assume 30 min duration)
      const endHours = hours + Math.floor((minutes + 30) / 60);
      const endMinutes = (minutes + 30) % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      
      const newCall: ScheduledCallDisplay = {
        id: `call-${Date.now()}`,
        title: values.title || "Untitled Call",
        scheduledTime: values.date || new Date(),
        date: values.date || new Date(),
        startTime: startTime,
        endTime: endTime,
        duration: "30 minutes",
        participants: values.participantIds?.map((id: string) => ({
          id,
          name: `User ${id}`, // This would be replaced with actual user data
          avatar: ""
        })) || [],
        description: "",
        isGroupCall: values.participantIds?.length > 1 || false,
        callType: values.callType || "video",
        status: "planned"
      };
      
      setScheduledCalls([...scheduledCalls, newCall]);
      
      toast({
        title: "Call Scheduled",
        description: `${newCall.title} has been scheduled for ${format(new Date(newCall.scheduledTime), "PPP")} at ${newCall.startTime}`
      });
      
      return true;
    } catch (error) {
      console.error("Error scheduling call:", error);
      toast({
        title: "Error",
        description: "Failed to schedule call. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    date,
    setDate,
    scheduledCalls,
    currentWeek,
    callsForSelectedDate,
    handleScheduleCall
  };
}
