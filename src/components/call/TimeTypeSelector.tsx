
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TimeTypeSelectorProps {
  value: "immediate" | "scheduled";
  onChange: (value: "immediate" | "scheduled") => void;
}

const TimeTypeSelector = ({ value, onChange }: TimeTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Horaire</Label>
      <RadioGroup value={value} onValueChange={(value) => onChange(value as "immediate" | "scheduled")}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="immediate" id="time-immediate" />
          <Label htmlFor="time-immediate" className="cursor-pointer">Immédiat (démarrer l'appel maintenant)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="scheduled" id="time-scheduled" />
          <Label htmlFor="time-scheduled" className="cursor-pointer">Programmé (planifier pour plus tard)</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default TimeTypeSelector;
