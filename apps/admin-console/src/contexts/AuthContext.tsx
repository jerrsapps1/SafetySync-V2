import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type UserRole = "owner_admin" | "csr_admin";

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
  isOwnerAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: Record<UserRole, User> = {
  owner_admin: {
    id: "admin-1",
    username: "admin",
    email: "admin@syncai.com",
    companyId: null,
  },
  csr_admin: {
    id: "csr-1",
    username: "csr",
    email: "csr@syncai.com",
    companyId: null,
  },
};

const MOCK_TOKENS: Record<UserRole, string> = {
  owner_admin: "mock-admin-token",
  csr_admin: "mock-csr-token",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("owner_admin");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("admin-console-role") as UserRole | null;
    const storedAuth = localStorage.getItem("admin-console-authed");

    if (storedAuth === "true" && storedRole && (storedRole === "owner_admin" || storedRole === "csr_admin")) {
      setRole(storedRole);
      setUser(MOCK_USERS[storedRole]);
      setToken(MOCK_TOKENS[storedRole]);
      localStorage.setItem("auth_token", MOCK_TOKENS[storedRole]);
    }
    setIsLoading(false);
  }, []);

  const loginAs = (r: UserRole) => {
    setUser(MOCK_USERS[r]);
    setToken(MOCK_TOKENS[r]);
    setRole(r);
    localStorage.setItem("admin-console-role", r);
    localStorage.setItem("admin-console-authed", "true");
    localStorage.setItem("auth_token", MOCK_TOKENS[r]);
  };

  const login = async (_credentials: { email: string; password: string }) => {
    loginAs("owner_admin");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole("owner_admin");
    localStorage.removeItem("admin-console-role");
    localStorage.removeItem("admin-console-authed");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, loginAs, logout, isLoading, isAuthenticated: !!user, isOwnerAdmin: role === "owner_admin" }}>
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
