
import Layout from "@/components/layout/Layout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentCalls from "@/components/dashboard/RecentCalls";
import ContactsList from "@/components/dashboard/ContactsList";
import ScheduledCalls from "@/components/dashboard/ScheduledCalls";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow hover:bg-primary/90 transition-colors">
              New Call
            </button>
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
