import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin-dashboard";
import SmtpConfigPage from "@/pages/smtp-config";
import RequestManagementPage from "@/pages/request-management";
import FreeResources from "@/pages/free-resources";
import Help from "@/pages/help";
import AttorneyOnboarding from "@/pages/attorney-onboarding";
import AttorneyFeeSchedule from "@/pages/attorney-fee-schedule";
import BlogManagement from "@/pages/blog-management";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/smtp-config" component={SmtpConfigPage} />
      <Route path="/request-management" component={RequestManagementPage} />
      <Route path="/attorney-onboarding" component={AttorneyOnboarding} />
      <Route path="/attorney-fee-schedule" component={AttorneyFeeSchedule} />
      <Route path="/blog-management" component={BlogManagement} />
      <Route path="/free-resources" component={FreeResources} />
      <Route path="/help" component={Help} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
