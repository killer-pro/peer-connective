
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CallTypeSelectorProps {
  value: "open" | "private";
  onChange: (value: "open" | "private") => void;
}

const CallTypeSelector = ({ value, onChange }: CallTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Type d'accès</Label>
      <RadioGroup value={value} onValueChange={(value) => onChange(value as "open" | "private")}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="open" id="access-open" />
          <Label htmlFor="access-open" className="cursor-pointer">Ouvert (toute personne avec le lien peut rejoindre)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="private" id="access-private" />
          <Label htmlFor="access-private" className="cursor-pointer">Privé (seuls les participants invités peuvent rejoindre)</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default CallTypeSelector;
