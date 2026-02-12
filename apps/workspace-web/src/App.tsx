import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { EntitlementProvider, useEntitlements } from "@/contexts/EntitlementContext";
import AppLayout from "@/components/AppLayout";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import EmployeeProfile from "@/pages/employee-profile";
import Documents from "@/pages/documents";
import Certificates from "@/pages/certificates";
import WalletCards from "@/pages/wallet-cards";
import Compliance from "@/pages/compliance";
import SettingsPage from "@/pages/settings";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import Demo from "@/pages/demo";
import Security from "@/pages/security";
import NotFound from "@/pages/not-found";
import AccessBlocked from "@/pages/access-blocked";

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const { isLoading: entitlementLoading, isEntitled } = useEntitlements();

  if (!isAuthenticated) {
    return null;
  }

  if (entitlementLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  if (!isEntitled("safetysync")) {
    return <AccessBlocked />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/employees/:id" component={EmployeeProfile} />
        <Route path="/employees" component={Employees} />
        <Route path="/documents" component={Documents} />
        <Route path="/certificates" component={Certificates} />
        <Route path="/wallet-cards" component={WalletCards} />
        <Route path="/compliance" component={Compliance} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  const publicPaths = ["/", "/login", "/features", "/pricing", "/demo", "/security"];
  const isPublicPath = publicPaths.includes(location);

  if (isPublicPath) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/features" component={Features} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/demo" component={Demo} />
        <Route path="/security" component={Security} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <AppRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <EntitlementProvider>
              <OrganizationProvider>
                <TooltipProvider>
                  <Toaster />
                  <Router />
                </TooltipProvider>
              </OrganizationProvider>
            </EntitlementProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
