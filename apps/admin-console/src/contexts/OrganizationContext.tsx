import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface Organization {
  id: string;
  name: string;
}

interface OrganizationContextType {
  activeOrg: Organization;
  setActiveOrg: (org: Organization) => void;
  organizations: Organization[];
}

const STORAGE_KEY = "safetysync-org";

const defaultOrganizations: Organization[] = [
  { id: "org-1", name: "Demo Construction Co." },
  { id: "org-2", name: "Demo Industrial Co." },
];

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organizations] = useState<Organization[]>(defaultOrganizations);

  const [activeOrg, setActiveOrgState] = useState<Organization>(() => {
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (storedId) {
      const found = defaultOrganizations.find((o) => o.id === storedId);
      if (found) return found;
    }
    return defaultOrganizations[0];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeOrg.id);
  }, [activeOrg]);

  const setActiveOrg = (org: Organization) => setActiveOrgState(org);

  return (
    <OrganizationContext.Provider value={{ activeOrg, setActiveOrg, organizations }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
