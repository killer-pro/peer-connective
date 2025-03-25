
import React from 'react';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { mockContacts } from "@/types/contact";

interface ParticipantSelectProps {
  value: string[];
  onChange: (selectedIds: string[]) => void;
}

const ParticipantSelect: React.FC<ParticipantSelectProps> = ({ value, onChange }) => {
  return (
    <FormItem>
      <FormLabel>Participants</FormLabel>
      <FormControl>
        <select 
          multiple 
          className="w-full h-32 rounded-md border border-input bg-background px-3 py-2"
          value={value}
          onChange={(e) => {
            const options = Array.from(e.target.selectedOptions, option => option.value);
            onChange(options);
          }}
        >
          {mockContacts.map(contact => (
            <option key={contact.id} value={contact.id}>
              {contact.name}
            </option>
          ))}
        </select>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default ParticipantSelect;
