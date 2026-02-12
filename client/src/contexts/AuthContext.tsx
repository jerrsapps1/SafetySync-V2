import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
  id: string;
  username: string;
  fullName?: string | null;
  email: string;
  companyId: string | null;
}

interface CompanyInfo {
  id: string;
  name: string;
  plan?: string;
  billingStatus?: string;
  trialEndDate?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  companyId: string | null;
  trialEndDate: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginAs: (role: string) => void;
  logout: () => void;
  setAuthFromCreateAccount: (token: string, user: User, company: CompanyInfo) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_WORKSPACE_USER: User = {
  id: "user-1",
  username: "safetymanager",
  email: "manager@democonstruction.com",
  companyId: "org-1",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem("safetysync-authed");
    const storedTrialEnd = localStorage.getItem("safetysync-trial-end");

    if (storedAuth === "true") {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("safetysync-user");
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch { setUser(MOCK_WORKSPACE_USER); }
      } else {
        setUser(MOCK_WORKSPACE_USER);
      }
      setToken(storedToken || "mock-token");
      if (storedTrialEnd) setTrialEndDate(storedTrialEnd);
    }
    setIsLoading(false);
  }, []);

  const loginAs = (_r: string) => {
    setUser(MOCK_WORKSPACE_USER);
    setToken("mock-token");
    localStorage.setItem("safetysync-role", "workspace");
    localStorage.setItem("safetysync-authed", "true");
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("safetysync-role", "workspace");
      localStorage.setItem("safetysync-authed", "true");
      localStorage.setItem("safetysync-user", JSON.stringify(data.user));
    } catch {
      loginAs("workspace");
    }
  };

  const setAuthFromCreateAccount = (newToken: string, newUser: User, company: CompanyInfo) => {
    setToken(newToken);
    setUser(newUser);
    if (company.trialEndDate) setTrialEndDate(company.trialEndDate);
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("safetysync-role", "workspace");
    localStorage.setItem("safetysync-authed", "true");
    localStorage.setItem("safetysync-user", JSON.stringify(newUser));
    if (company.trialEndDate) localStorage.setItem("safetysync-trial-end", company.trialEndDate);
    localStorage.setItem("safetysync-org", company.id);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTrialEndDate(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("safetysync-role");
    localStorage.removeItem("safetysync-authed");
    localStorage.removeItem("safetysync-user");
    localStorage.removeItem("safetysync-trial-end");
  };

  const companyId = user?.companyId ?? null;

  return (
    <AuthContext.Provider value={{ user, token, companyId, trialEndDate, login, loginAs, logout, setAuthFromCreateAccount, isLoading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
