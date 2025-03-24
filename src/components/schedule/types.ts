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
