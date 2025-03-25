
import { useState, useCallback } from 'react';
import { startOfWeek, eachDayOfInterval, addDays, format, isSameDay } from 'date-fns';
import { ScheduledCallDisplay, ScheduleFormValues } from '@/components/schedule/types';
import { toast } from 'sonner';

export const useSchedule = (initialCalls: ScheduledCallDisplay[] = []) => {
  const [date, setDate] = useState(new Date());
  const [calls, setCalls] = useState<ScheduledCallDisplay[]>(initialCalls);

  // Get the current week's days
  const currentWeek = eachDayOfInterval({
    start: startOfWeek(date),
    end: addDays(startOfWeek(date), 6)
  });

  // Filter calls for the currently selected date
  const callsForSelectedDate = calls.filter((call) => {
    const callDate = new Date(call.date);
    return isSameDay(callDate, date);
  });

  // Handle scheduling a new call
  const handleScheduleCall = useCallback((values: ScheduleFormValues) => {
    try {
      const newId = String(calls.length + 1);
      
      // Extract hours and minutes from time string
      const [hours, minutes] = values.time.split(':').map(Number);
      
      // Create a scheduled_time by combining date and time
      const scheduledTime = new Date(values.date);
      scheduledTime.setHours(hours);
      scheduledTime.setMinutes(minutes);
      
      // Create the new call
      const newCall: ScheduledCallDisplay = {
        id: newId,
        title: values.title,
        date: values.date,
        startTime: values.time,
        endTime: `${(hours + 1).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        duration: '1h',
        participants: values.participantIds.map(id => ({ id, name: `Participant ${id}` })),
        description: 'Scheduled via app',
        isGroup: values.participantIds.length > 1,
        callType: values.callType,
        scheduled_time: scheduledTime.toISOString()
      };

      // Update the calls state
      setCalls(prev => [...prev, newCall]);
      
      // Show success notification
      toast.success('Call scheduled successfully');
      
      // Navigate to the date of the scheduled call
      setDate(values.date);
      
      return true;
    } catch (error) {
      console.error('Error scheduling call:', error);
      toast.error('Failed to schedule call');
      return false;
    }
  }, [calls]);

  return {
    date,
    setDate,
    currentWeek,
    calls,
    callsForSelectedDate,
    handleScheduleCall
  };
};
