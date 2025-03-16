
import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import Layout from "@/components/layout/Layout";
import { ScheduledCallDisplay } from "@/components/schedule/types";
import DateNavigation from "@/components/schedule/DateNavigation";
import WeekSelector from "@/components/schedule/WeekSelector";
import DayCalls from "@/components/schedule/DayCalls";
import ScheduleForm from "@/components/schedule/ScheduleForm";

// Mock data for scheduled calls
const today = new Date();
const mockScheduledCalls: ScheduledCallDisplay[] = [
  {
    id: "1",
    title: "Weekly Team Meeting",
    date: today,
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
    date: addDays(today, 1),
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
    date: addDays(today, 3),
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

const SchedulePage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCallDisplay[]>(mockScheduledCalls);
  const [isScheduleCallOpen, setIsScheduleCallOpen] = useState(false);

  // Generate an array of dates for the week view
  const currentWeek = Array(7)
    .fill(0)
    .map((_, i) => addDays(startOfWeek(date), i));

  // Filter calls for the selected date
  const callsForSelectedDate = scheduledCalls.filter(call => 
    isSameDay(call.date, date)
  );

  const handleScheduleCall = (newCall: ScheduledCallDisplay) => {
    setScheduledCalls([...scheduledCalls, newCall]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Schedule</h1>
          <ScheduleForm 
            onSchedule={handleScheduleCall} 
            onCancel={() => setIsScheduleCallOpen(false)}
          />
        </div>
        
        <DateNavigation 
          selectedDate={date} 
          onDateChange={setDate} 
        />
        
        <WeekSelector 
          currentWeek={currentWeek} 
          selectedDate={date}
          onSelectDate={setDate}
        />
        
        <DayCalls 
          date={date}
          calls={callsForSelectedDate}
          onOpenScheduleForm={() => setIsScheduleCallOpen(true)}
        />
      </div>
    </Layout>
  );
};

export default SchedulePage;
