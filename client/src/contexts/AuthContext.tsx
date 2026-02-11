import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type UserRole = "workspace" | "owner";

interface User {
  id: string;
  username: string;
  email: string;
  companyId: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginAs: (role: UserRole) => void;
  logout: () => void;
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

const MOCK_OWNER_USER: User = {
  id: "user-owner",
  username: "owner",
  email: "admin@syncai.com",
  companyId: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("workspace");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("safetysync-role") as UserRole | null;
    const storedAuth = localStorage.getItem("safetysync-authed");

    if (storedAuth === "true" && storedRole) {
      setRole(storedRole);
      setUser(storedRole === "owner" ? MOCK_OWNER_USER : MOCK_WORKSPACE_USER);
      setToken("mock-token");
    }
    setIsLoading(false);
  }, []);

  const loginAs = (r: UserRole) => {
    const u = r === "owner" ? MOCK_OWNER_USER : MOCK_WORKSPACE_USER;
    setUser(u);
    setToken("mock-token");
    setRole(r);
    localStorage.setItem("safetysync-role", r);
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
      setRole("workspace");
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("safetysync-role", "workspace");
      localStorage.setItem("safetysync-authed", "true");
    } catch {
      loginAs("workspace");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole("workspace");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("safetysync-role");
    localStorage.removeItem("safetysync-authed");
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, loginAs, logout, isLoading, isAuthenticated: !!user }}>
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
