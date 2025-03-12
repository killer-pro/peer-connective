
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneCall, UserPlus, Clock, Video } from "lucide-react";

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  description 
}: { 
  icon: React.ComponentType<any>; 
  title: string; 
  value: string; 
  description: string;
}) => {
  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <StatCard
        icon={PhoneCall}
        title="Total Calls"
        value="124"
        description="+12% from last month"
      />
      <StatCard
        icon={Clock}
        title="Call Duration"
        value="48h 30m"
        description="This month"
      />
      <StatCard
        icon={UserPlus}
        title="New Contacts"
        value="8"
        description="Added this week"
      />
      <StatCard
        icon={Video}
        title="Scheduled Calls"
        value="5"
        description="For this week"
      />
    </div>
  );
};

export default DashboardStats;
