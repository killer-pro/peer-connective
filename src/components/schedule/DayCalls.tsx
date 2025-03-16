
import React from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScheduledCallDisplay } from './types';
import CallCard from './CallCard';

interface DayCallsProps {
  date: Date;
  calls: ScheduledCallDisplay[];
  onOpenScheduleForm: () => void;
}

const DayCalls: React.FC<DayCallsProps> = ({ date, calls, onOpenScheduleForm }) => {
  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return "Today";
    }
    if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return "Tomorrow";
    }
    return format(date, "EEEE, MMMM d");
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle>{formatDateHeader(date)}</CardTitle>
      </CardHeader>
      <CardContent>
        {calls.length > 0 ? (
          <div className="space-y-4">
            {calls.map((call) => (
              <CallCard key={call.id} call={call} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No calls scheduled for this day.</p>
            <Button variant="outline" className="mt-4" onClick={onOpenScheduleForm}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Schedule a Call</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DayCalls;
