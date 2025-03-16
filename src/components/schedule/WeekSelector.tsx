
import React from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WeekSelectorProps {
  currentWeek: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ 
  currentWeek, 
  selectedDate, 
  onSelectDate 
}) => {
  return (
    <div className="flex gap-2 overflow-auto pb-2">
      {currentWeek.map((day) => (
        <Button
          key={day.toString()}
          variant={isSameDay(day, selectedDate) ? "default" : "outline"}
          className="flex-shrink-0 h-auto py-2 flex flex-col"
          onClick={() => onSelectDate(day)}
        >
          <span className="text-xs">{format(day, "E")}</span>
          <span className="text-lg">{format(day, "d")}</span>
        </Button>
      ))}
    </div>
  );
};

export default WeekSelector;
