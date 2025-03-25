
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { DatePicker, TimePicker } from './DateTimePicker';
import CallTypeSelection, { FrequencySelection } from './CallTypeSelection';
import ParticipantSelect from './ParticipantSelect';

// Schema for form validation
const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  callType: z.enum(["audio", "video"]),
  isRecurring: z.enum(["one-time", "recurring"]),
  date: z.date({
    required_error: "Please select a date.",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in 24-hour format (HH:MM)."
  }),
  participantIds: z.array(z.string()).min(1, {
    message: "Please select at least one participant."
  })
});

type FormValues = z.infer<typeof formSchema>;

interface ScheduleFormProps {
  onSchedule: (values: FormValues) => void;
  onCancel: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ onSchedule, onCancel }) => {
  const [selectedTime, setSelectedTime] = useState('12:00');
  
  // Form configuration
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      callType: 'video',
      isRecurring: 'one-time',
      date: new Date(),
      time: '12:00',
      participantIds: []
    }
  });
  
  // Function to handle form submission
  const onSubmit = (values: FormValues) => {
    onSchedule(values);
  };
  
  // Function to handle time selection
  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    form.setValue('time', time);
  };
  
  // Function to handle participant selection
  const handleParticipantChange = (selectedIds: string[]) => {
    form.setValue('participantIds', selectedIds);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Call Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter call title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Call Type field */}
        <FormField
          control={form.control}
          name="callType"
          render={({ field }) => (
            <CallTypeSelection 
              value={field.value} 
              onChange={field.onChange} 
            />
          )}
        />
        
        {/* Recurring field */}
        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FrequencySelection 
              value={field.value} 
              onChange={field.onChange} 
            />
          )}
        />
        
        {/* Date field */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <DatePicker 
              date={field.value} 
              onDateChange={field.onChange} 
            />
          )}
        />
        
        {/* Time field */}
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <TimePicker 
              time={field.value} 
              onTimeChange={handleTimeChange}
            />
          )}
        />
        
        {/* Participants field */}
        <FormField
          control={form.control}
          name="participantIds"
          render={({ field }) => (
            <ParticipantSelect 
              value={field.value} 
              onChange={handleParticipantChange}
            />
          )}
        />
        
        {/* Form buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Schedule Call</Button>
        </div>
      </form>
    </Form>
  );
};

export default ScheduleForm;
