
import { User } from '@/types/user';

export interface ScheduleContact {
  id: string;
  name: string;
  avatar?: string;
}

export const mockScheduleContacts: ScheduleContact[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'Alice Johnson',
    avatar: '/placeholder.svg'
  },
  {
    id: '4',
    name: 'Bob Brown',
    avatar: '/placeholder.svg'
  },
  {
    id: '5',
    name: 'Charlie Davis',
    avatar: '/placeholder.svg'
  }
];

// Add the ScheduledCallDisplay interface that was missing
export interface ScheduledCallDisplay {
  id: string | number;
  title: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  duration: string;
  participants: {
    id: string | number;
    name: string;
    avatar?: string;
  }[];
  description?: string;
  isGroup: boolean;
  callType: 'audio' | 'video';
}

// Add mock scheduled calls
export const mockScheduledCalls: ScheduledCallDisplay[] = [
  {
    id: '1',
    title: 'Weekly Team Meeting',
    date: new Date(),
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    duration: '1h',
    participants: mockScheduleContacts,
    description: 'Weekly team sync to discuss progress and blockers',
    isGroup: true,
    callType: 'video'
  },
  {
    id: '2',
    title: 'One-on-one with Jane',
    date: new Date(),
    startTime: '2:00 PM',
    endTime: '2:30 PM',
    duration: '30m',
    participants: [mockScheduleContacts[1]],
    description: 'Performance review',
    isGroup: false,
    callType: 'video'
  }
];
