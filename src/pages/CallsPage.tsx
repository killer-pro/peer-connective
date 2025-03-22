
import React from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ContactsList from "@/components/calls/ContactsList";
import CallSummary from "@/components/calls/CallSummary";
import { useCallsPage } from "@/hooks/useCallsPage";

const CallsPage = () => {
  const navigate = useNavigate();
  const {
    searchQuery,
    filteredContacts,
    loading,
    activeTab,
    handleSearch,
    handleStartCall,
    handleTabChange
  } = useCallsPage();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Calls</h1>
          <Button className="gap-2" onClick={() => navigate("/call")}>
            <Plus className="h-4 w-4" />
            <span>New Call</span>
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Contacts</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <ContactsList
              title="All Contacts"
              contacts={filteredContacts}
              loading={loading}
              searchQuery={searchQuery}
              onStartCall={handleStartCall}
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <ContactsList
              title="Favorite Contacts"
              contacts={filteredContacts.filter(c => c.favorite)}
              loading={loading}
              onStartCall={handleStartCall}
            />
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            <ContactsList
              title="Recent Calls"
              contacts={filteredContacts
                .filter(contact => contact.lastCall)
                .sort((a, b) => {
                  if (!a.lastCall || !b.lastCall) return 0;
                  return new Date(b.lastCall.date).getTime() - new Date(a.lastCall.date).getTime();
                })}
              loading={loading}
              onStartCall={handleStartCall}
            />
          </TabsContent>
        </Tabs>

        {/* Call Summary displayed only in recent tab */}
        {activeTab === "recent" && <CallSummary />}
      </div>
    </Layout>
  );
};

export default CallsPage;
