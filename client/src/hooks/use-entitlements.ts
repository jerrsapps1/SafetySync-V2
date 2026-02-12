import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export interface Entitlements {
  plan: string;
  billingStatus: string;
  trialEndsAt: string | null;
  trialActive: boolean;
  isActive: boolean;
  employeeLimit: number;
  canUseAIIngestion: boolean;
  canExportReports: boolean;
}

const mockEntitlements: Entitlements = {
  plan: "trial",
  billingStatus: "trial",
  trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  trialActive: true,
  isActive: true,
  employeeLimit: 25,
  canUseAIIngestion: true,
  canExportReports: true,
};

export function useEntitlements() {
  const { token } = useAuth();
  const isMockAuth = token === "mock-token";

  const { data, isLoading } = useQuery<Entitlements>({
    queryKey: ["/api/workspace/entitlements"],
    enabled: !!token && !isMockAuth,
  });

  return {
    entitlements: isMockAuth ? mockEntitlements : (data || null),
    isLoading: isMockAuth ? false : isLoading,
  };
}
