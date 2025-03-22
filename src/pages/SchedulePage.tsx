
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import DateNavigation from "@/components/schedule/DateNavigation";
import WeekSelector from "@/components/schedule/WeekSelector";
import DayCalls from "@/components/schedule/DayCalls";
import ScheduleCallForm, { ScheduleFormValues } from "@/components/schedule/ScheduleCallForm";
import { useSchedule } from "@/hooks/useSchedule";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Import mock data from the same place as before
import { mockScheduledCalls } from "@/components/schedule/types";

const SchedulePage = () => {
  const {
    date,
    setDate,
    currentWeek,
    callsForSelectedDate,
    handleScheduleCall
  } = useSchedule(mockScheduledCalls);
  const [isScheduleCallOpen, setIsScheduleCallOpen] = useState(false);

  const handleFormSubmit = (values: ScheduleFormValues) => {
    const success = handleScheduleCall(values);
    if (success) {
      setIsScheduleCallOpen(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Schedule</h1>
          <Dialog open={isScheduleCallOpen} onOpenChange={setIsScheduleCallOpen}>
            <DialogTrigger asChild>
              <Button>Schedule Call</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule a New Call</DialogTitle>
              </DialogHeader>
              <ScheduleCallForm 
                onSubmit={handleFormSubmit}
                onCancel={() => setIsScheduleCallOpen(false)}
              />
            </DialogContent>
          </Dialog>
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
