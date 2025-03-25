
import React from 'react';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ date, onDateChange }) => {
  return (
    <FormItem className="flex flex-col">
      <FormLabel>Date</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className="w-full pl-3 text-left font-normal flex justify-between items-center"
            >
              {date ? (
                format(date, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            disabled={(date) => date < new Date()}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
};

interface TimePickerProps {
  time: string;
  onTimeChange: (time: string) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ time, onTimeChange }) => {
  return (
    <FormItem>
      <FormLabel>Time</FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="pl-10"
          />
          <Clock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
