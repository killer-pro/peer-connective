
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import CallPage from "./pages/CallPage";
import CallsPage from "./pages/CallsPage";
import CreateGroupCallPage from "./pages/CreateGroupCallPage";
import ContactsPage from "./pages/ContactsPage";
import SchedulePage from "./pages/SchedulePage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import RecordingsPage from "./pages/RecordingsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import IncomingCallHandler from "./components/calls/IncomingCallHandler";

// Configuration pour gérer les erreurs de requête dans React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Composant pour protéger les routes authentifiées
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? (
    <>
      <IncomingCallHandler />
      {children}
    </>
  ) : <Navigate to="/auth" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Routes publiques */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Routes protégées */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/call/:callId?" element={<ProtectedRoute><CallPage /></ProtectedRoute>} />
            <Route path="/calls" element={<ProtectedRoute><CallsPage /></ProtectedRoute>} />
            <Route path="/group-call" element={<ProtectedRoute><CreateGroupCallPage /></ProtectedRoute>} />
            <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/recordings" element={<ProtectedRoute><RecordingsPage /></ProtectedRoute>} />
            
            {/* Route de secours */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
