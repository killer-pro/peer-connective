
import React from 'react';
import Layout from '@/components/layout/Layout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentCalls } from '@/components/dashboard/RecentCalls';
import { ScheduledCalls } from '@/components/dashboard/ScheduledCalls';
import { ContactsList } from '@/components/dashboard/ContactsList';

const Index = () => {
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardStats />
        </div>
        <div className="lg:row-span-2">
          <ContactsList />
        </div>
        <div className="md:col-span-1">
          <RecentCalls />
        </div>
        <div className="md:col-span-1">
          <ScheduledCalls />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
