
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentCalls from "@/components/dashboard/RecentCalls";
import ContactsList from "@/components/dashboard/ContactsList";
import ScheduledCalls from "@/components/dashboard/ScheduledCalls";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  const handleNewCall = () => {
    navigate("/call");
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button className="gap-2" onClick={handleNewCall}>
              <PlusIcon className="h-4 w-4" />
              <span>New Call</span>
            </Button>
          </div>
        </div>
        
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentCalls />
          <ContactsList />
        </div>
        
        <ScheduledCalls />
      </div>
    </Layout>
  );
};

export default Index;
