
// Types pour les appels planifiés
export interface ScheduledCallDisplay {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
  }[];
  description?: string;
  isGroup: boolean;
}

// Mock data for the participant selector
export const mockContacts = [
  {
    id: "1",
    name: "Alex Morgan",
    avatar: "",
    online: true
  },
  {
    id: "2",
    name: "Taylor Swift",
    avatar: "",
    online: false
  },
  {
    id: "3",
    name: "Chris Evans",
    avatar: "",
    online: true
  },
  {
    id: "4",
    name: "Jessica Chen",
    avatar: "",
    online: false
  },
  {
    id: "5",
    name: "Marcus Johnson",
    avatar: "",
    online: true
  }
];

// Mock scheduled calls
export const mockScheduledCalls: ScheduledCallDisplay[] = [
  {
    id: "1",
    title: "Weekly Team Meeting",
    date: new Date(),
    startTime: "14:00",
    endTime: "15:00",
    duration: "1 hour",
    participants: [
      { id: "1", name: "Alex Morgan", avatar: "" },
      { id: "2", name: "Taylor Swift", avatar: "" },
      { id: "3", name: "Chris Evans", avatar: "" },
      { id: "4", name: "Jessica Chen", avatar: "" },
    ],
    description: "Discuss progress on the current sprint and plan for the next one.",
    isGroup: true,
  },
  {
    id: "2",
    title: "Project Discussion",
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    startTime: "10:30",
    endTime: "11:15",
    duration: "45 minutes",
    participants: [
      { id: "2", name: "Taylor Swift", avatar: "" },
      { id: "5", name: "Marcus Johnson", avatar: "" },
    ],
    description: "Review project requirements and timeline.",
    isGroup: true,
  },
  {
    id: "3",
    title: "1:1 with Alex",
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    startTime: "15:15",
    endTime: "15:45",
    duration: "30 minutes",
    participants: [
      { id: "1", name: "Alex Morgan", avatar: "" },
    ],
    description: "Weekly catch-up meeting.",
    isGroup: false,
  },
];
