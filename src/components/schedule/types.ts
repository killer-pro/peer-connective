
import { User } from '@/types/user';
import { ScheduledCall as ScheduledCallBase } from '@/types/call';

// Local component type for the schedule page
export interface ScheduledCallDisplay extends Omit<ScheduledCallBase, 'participants'> {
  participants: {
    id: string | number;
    name: string;
    avatar?: string;
  }[];
}

// Mock contact data
export const mockContacts = [
  { id: "1", name: "Alex Morgan", avatar: "", online: true },
  { id: "2", name: "Taylor Swift", avatar: "", online: true },
  { id: "3", name: "Chris Evans", avatar: "", online: false },
  { id: "4", name: "Jessica Chen", avatar: "", online: true },
  { id: "5", name: "Marcus Johnson", avatar: "", online: false },
];
