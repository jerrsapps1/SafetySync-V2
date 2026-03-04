import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ExternalLink,
  User,
  Building2,
  Users,
  FileText,
  AlertTriangle,
  Clock,
  XCircle,
  Loader2,
  LogIn,
} from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

type BillingStatus = "active" | "trial" | "past_due" | "canceled";

interface AccountSummary {
  company: {
    id: string;
    name: string;
    phone: string | null;
    country: string | null;
    state: string | null;
    createdAt: string;
    plan: string | null;
    billingStatus: BillingStatus | null;
    trialEndDate: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
  };
  accountHolder: {
    id: string;
    fullName: string | null;
    username: string;
    email: string;
    role: string;
  };
  entitlements: Record<string, unknown>;
  counts: {
    employeesCount: number;
    trainingRecordsCount: number;
    locationsCount: number;
  };
}

interface BillingBannerConfig {
  message: string;
  buttonText: string;
  icon: typeof AlertTriangle;
  variant: "warning" | "destructive";
}

const billingBannerConfig: Record<Exclude<BillingStatus, "active">, BillingBannerConfig> = {
  trial: {
    message: "Your trial ends soon. Add a payment method to avoid interruption.",
    buttonText: "Add Payment Method",
    icon: Clock,
    variant: "warning",
  },
  past_due: {
    message: "Payment failed. Your workspace is temporarily restricted until billing is updated.",
    buttonText: "Fix Billing",
    icon: AlertTriangle,
    variant: "destructive",
  },
  canceled: {
    message: "Your subscription is canceled. Reactivate to restore access.",
    buttonText: "Reactivate",
    icon: XCircle,
    variant: "destructive",
  },
};

function BillingStatusBanner({
  status,
  onAction,
  isLoading,
  error,
}: {
  status: BillingStatus;
  onAction: () => void;
  isLoading: boolean;
  error?: string | null;
}) {
  if (status === "active") return null;

  const config = billingBannerConfig[status];
  const Icon = config.icon;

  const bgClass =
    config.variant === "warning"
      ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-200"
      : "bg-red-500/10 border-red-500/30 text-red-200";

  const buttonVariant = config.variant === "warning" ? "default" : "destructive";

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border p-4 ${bgClass}`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{config.message}</p>
        </div>
        {error && <p className="text-xs text-red-400 ml-8">{error}</p>}
      </div>
      <Button
        variant={buttonVariant}
        size="sm"
        onClick={onAction}
        disabled={isLoading}
        className="shrink-0"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Opening…
          </>
        ) : (
          config.buttonText
        )}
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription and account settings
        </p>
      </div>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading account...</span>
      </div>
    </div>
  );
}

function ErrorMessage({
  message,
  onRetry,
  isAuthError,
  onLogin,
}: {
  message: string;
  onRetry: () => void;
  isAuthError?: boolean;
  onLogin?: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      <div className="flex gap-2">
        {isAuthError && onLogin ? (
          <Button variant="default" size="sm" onClick={onLogin}>
            <LogIn className="h-4 w-4 mr-2" />
            Go to Login
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const [accountData, setAccountData] = useState<AccountSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  const handleGoToLogin = () => {
    logout();
    setLocation("/login");
  };

  const fetchAccountSummary = async () => {
    setIsLoading(true);
    setError(null);
    setIsAuthError(false);
    try {
      const data = await apiRequest<AccountSummary>("/api/account/summary");
      setAccountData(data);
    } catch (err) {
      console.error("[Account] Failed to fetch summary:", err);
      const rawMessage = err instanceof Error ? err.message : "Unknown error";
      const authError =
        rawMessage.toLowerCase().includes("sign in") ||
        rawMessage.toLowerCase().includes("auth") ||
        rawMessage.includes("401");
      setIsAuthError(authError);
      const friendlyMessage = authError
        ? "Please sign in again to view account details."
        : "Unable to load account information. Please try again.";
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountSummary();
  }, []);

  const openBillingPortal = async () => {
    setIsBillingLoading(true);
    setBillingError(null);
    try {
      const data = await apiRequest<{ url: string }>("/api/billing/portal", {
        method: "POST",
        body: JSON.stringify({ returnUrl: window.location.origin + "/account" }),
      });
      if (data.url) {
        window.location.assign(data.url);
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (err) {
      console.error("[Account] Billing portal error:", err);
      const rawMessage = err instanceof Error ? err.message : "Unknown error";
      const authError =
        rawMessage.toLowerCase().includes("sign in") ||
        rawMessage.toLowerCase().includes("auth") ||
        rawMessage.includes("401");
      if (authError) {
        setError("Please sign in again to open the billing portal.");
        setIsAuthError(true);
      } else {
        setBillingError("Unable to open billing portal. Please try again.");
      }
      setIsBillingLoading(false);
    }
  };

  const statusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "active":
        return "default";
      case "past_due":
      case "canceled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const company = accountData?.company;
  const accountHolder = accountData?.accountHolder;
  const counts = accountData?.counts;
  const billingStatus: BillingStatus = (company?.billingStatus as BillingStatus) || "trial";
  const planName = company?.plan || "Free";

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription and account settings
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchAccountSummary}
          isAuthError={isAuthError}
          onLogin={handleGoToLogin}
        />
      )}

      {/* Status Banner - shown when subscription is not active */}
      {billingStatus !== "active" && (
        <BillingStatusBanner
          status={billingStatus}
          onAction={openBillingPortal}
          isLoading={isBillingLoading}
          error={billingError}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subscription Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Subscription</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold capitalize">{planName}</span>
              <Badge variant={statusVariant(billingStatus)}>
                {billingStatus.replace("_", " ")}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Current period start</span>
                <span className="font-medium text-foreground">
                  {formatDate(company?.currentPeriodStart || company?.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current period end</span>
                <span className="font-medium text-foreground">
                  {formatDate(company?.currentPeriodEnd || company?.trialEndDate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Billing</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Manage your payment methods, view invoices, and update billing
              information through the Stripe billing portal.
            </p>
            <Button 
              onClick={openBillingPortal} 
              className="w-full"
              disabled={isBillingLoading}
            >
              {isBillingLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opening…
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Billing
                </>
              )}
            </Button>
            {billingError && (
              <p className="text-xs text-red-400 mt-2">{billingError}</p>
            )}
          </CardContent>
        </Card>

        {/* Account Holder Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Account Holder</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email</span>
              </div>
              <p className="font-medium pl-6">{accountHolder?.email || "—"}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Organization</span>
              </div>
              <p className="font-medium pl-6">{company?.name || "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Usage</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Employees</span>
              </div>
              <span className="font-medium">{counts?.employeesCount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Training records</span>
              </div>
              <span className="font-medium">{counts?.trainingRecordsCount ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
