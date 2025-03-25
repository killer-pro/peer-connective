
import React from 'react';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CallTypeSelectionProps {
  value: "audio" | "video";
  onChange: (value: "audio" | "video") => void;
}

const CallTypeSelection: React.FC<CallTypeSelectionProps> = ({ value, onChange }) => {
  return (
    <FormItem>
      <FormLabel>Call Type</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={onChange}
          value={value}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="audio" id="audio" />
            <label htmlFor="audio">Audio</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="video" id="video" />
            <label htmlFor="video">Video</label>
          </div>
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

interface FrequencySelectionProps {
  value: "one-time" | "recurring";
  onChange: (value: "one-time" | "recurring") => void;
}

export const FrequencySelection: React.FC<FrequencySelectionProps> = ({ value, onChange }) => {
  return (
    <FormItem>
      <FormLabel>Frequency</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={onChange}
          value={value}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one-time" id="one-time" />
            <label htmlFor="one-time">One-time</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recurring" id="recurring" />
            <label htmlFor="recurring">Recurring</label>
          </div>
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default CallTypeSelection;
