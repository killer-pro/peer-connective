
import React from 'react';
import { format, addDays } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({ 
  selectedDate, 
  onDateChange 
}) => {
  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onDateChange(new Date())}
      >
        <CalendarIcon className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onDateChange(addDays(selectedDate, -7))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium px-2">{format(selectedDate, "MMMM yyyy")}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onDateChange(addDays(selectedDate, 7))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(selectedDate, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(newDate) => newDate && onDateChange(newDate)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateNavigation;
