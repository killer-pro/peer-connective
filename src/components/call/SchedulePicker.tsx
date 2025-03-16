
import React from "react";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SchedulePickerProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
}

const SchedulePicker = ({ 
  selectedDate, 
  setSelectedDate, 
  selectedTime, 
  setSelectedTime 
}: SchedulePickerProps) => {
  return (
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
  );
};

export default SchedulePicker;
