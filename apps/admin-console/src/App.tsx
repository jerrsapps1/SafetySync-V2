import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/contexts/I18nContext";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import Organizations from "@/pages/organizations";
import AdminSupport from "@/pages/admin-support";
import Billing from "@/pages/billing";
import OrgBillingDetail from "@/pages/org-billing-detail";
import Delinquent from "@/pages/delinquent";
import Products from "@/pages/products";
import Financials from "@/pages/financials";
import Audit from "@/pages/audit";
import AdminSettings from "@/pages/admin-settings";
import NotFound from "@/pages/not-found";

function AppRoutes() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/dashboard" component={AdminDashboard} />
        <Route path="/organizations" component={Organizations} />
        <Route path="/support" component={AdminSupport} />
        <Route path="/billing/delinquent" component={Delinquent} />
        <Route path="/billing/:orgId" component={OrgBillingDetail} />
        <Route path="/products" component={Products} />
        <Route path="/billing" component={Billing} />
        <Route path="/financials" component={Financials} />
        <Route path="/audit" component={Audit} />
        <Route path="/settings" component={AdminSettings} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (location === "/login") {
    return <Login />;
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
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
