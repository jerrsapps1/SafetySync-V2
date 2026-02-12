import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface EntitlementEntry {
  enabled: boolean;
  plan: string;
}

interface EntitlementData {
  orgId: string;
  entitlements: Record<string, EntitlementEntry>;
  billingStatus: string;
  trialEndsAt: string | null;
}

interface EntitlementContextType {
  data: EntitlementData | null;
  isLoading: boolean;
  isEntitled: (productSlug: string) => boolean;
  getPlan: (productSlug: string) => string | null;
  refetch: () => void;
}

const EntitlementContext = createContext<EntitlementContextType | undefined>(undefined);

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState<EntitlementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntitlements = async () => {
    if (!isAuthenticated || !token) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/workspace/entitlements", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setData(null);
        return;
      }

      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntitlements();
  }, [isAuthenticated, token]);

  const isEntitled = (productSlug: string): boolean => {
    if (!data) return false;
    const entry = data.entitlements[productSlug];
    return entry?.enabled === true;
  };

  const getPlan = (productSlug: string): string | null => {
    if (!data) return null;
    const entry = data.entitlements[productSlug];
    return entry?.plan || null;
  };

  return (
    <EntitlementContext.Provider value={{ data, isLoading, isEntitled, getPlan, refetch: fetchEntitlements }}>
      {children}
    </EntitlementContext.Provider>
  );
}

export function useEntitlements() {
  const context = useContext(EntitlementContext);
  if (context === undefined) {
    throw new Error("useEntitlements must be used within an EntitlementProvider");
  }
  return context;
}
