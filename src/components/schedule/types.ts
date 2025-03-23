
import { CallType, CallStatus } from '@/types/call';
import { User } from '@/types/user';

export interface ScheduledCallDisplay {
  id: string;
  title: string;
  callType: CallType;
  scheduledTime: Date | string;
  participants: {
    id: string | number;
    name: string;
    avatar?: string;
  }[];
  isGroupCall: boolean;
  status: CallStatus;
  description?: string;
  // Additional properties
  startTime?: string;
  endTime?: string;
  duration?: string;
  date?: Date | string;
}

// Mock contacts for participant selection
export const mockScheduleContacts = [
  { id: '1', name: 'John Doe', avatar: '' },
  { id: '2', name: 'Jane Smith', avatar: '' },
  { id: '3', name: 'Mike Johnson', avatar: '' },
  { id: '4', name: 'Sarah Williams', avatar: '' },
  { id: '5', name: 'David Brown', avatar: '' },
];

// Mock scheduled calls for testing
export const mockScheduledCalls: ScheduledCallDisplay[] = [
  {
    id: "1",
    title: "Weekly Team Meeting",
    callType: "video",
    scheduledTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    date: new Date(Date.now() + 60 * 60 * 1000),
    startTime: "14:00",
    endTime: "15:00",
    duration: "60 minutes",
    participants: [
      { id: "1", name: "Alex Morgan", avatar: "" },
      { id: "2", name: "Taylor Swift", avatar: "" },
      { id: "3", name: "Chris Evans", avatar: "" },
    ],
    isGroupCall: true,
    status: "planned"
  },
  {
    id: "2",
    title: "Project Review",
    callType: "audio",
    scheduledTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    date: new Date(Date.now() + 3 * 60 * 60 * 1000),
    startTime: "16:00",
    endTime: "16:30",
    duration: "30 minutes",
    participants: [
      { id: "2", name: "Taylor Swift", avatar: "" },
    ],
    isGroupCall: false,
    status: "planned"
  }
];
