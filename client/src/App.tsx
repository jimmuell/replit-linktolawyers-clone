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
import FreeResourcesSpanish from "@/pages/free-resources-spanish";
import Help from "@/pages/help";
import HelpSpanish from "@/pages/help-spanish";
import AttorneyOnboarding from "@/pages/attorney-onboarding";
import AttorneyFeeSchedule from "@/pages/attorney-fee-schedule";
import BlogManagement from "@/pages/blog-management";
import Blog from "@/pages/blog";
import BlogPostPage from "@/pages/blog-post";
import BlogPostEditor from "@/pages/blog-post-editor";
import BlogSpanish from "@/pages/blog-spanish";
import BlogPostSpanish from "@/pages/blog-post-spanish";
import EmailTemplatesPage from "@/pages/email-templates";
import NotFound from "@/pages/not-found";
import HomeSpanish from "@/pages/home-spanish";
import AttorneyDashboard from "@/pages/attorney-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/es" component={HomeSpanish} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/attorney-dashboard" component={AttorneyDashboard} />
      <Route path="/smtp-config" component={SmtpConfigPage} />
      <Route path="/request-management" component={RequestManagementPage} />
      <Route path="/attorney-onboarding" component={AttorneyOnboarding} />
      <Route path="/attorney-fee-schedule" component={AttorneyFeeSchedule} />
      <Route path="/blog-management" component={BlogManagement} />
      <Route path="/blog-management/create" component={BlogPostEditor} />
      <Route path="/blog-management/edit/:id" component={BlogPostEditor} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/es/blog" component={BlogSpanish} />
      <Route path="/es/blog/:slug" component={BlogPostSpanish} />
      <Route path="/email-templates" component={EmailTemplatesPage} />
      <Route path="/free-resources" component={FreeResources} />
      <Route path="/es/recursos-gratuitos" component={FreeResourcesSpanish} />
      <Route path="/help" component={Help} />
      <Route path="/es/ayuda" component={HelpSpanish} />
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
