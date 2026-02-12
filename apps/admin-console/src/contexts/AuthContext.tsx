import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type UserRole = "admin";

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

const MOCK_ADMIN_USER: User = {
  id: "admin-1",
  username: "admin",
  email: "admin@syncai.com",
  companyId: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("admin");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("admin-console-role") as UserRole | null;
    const storedAuth = localStorage.getItem("admin-console-authed");

    if (storedAuth === "true" && storedRole) {
      setRole(storedRole);
      setUser(MOCK_ADMIN_USER);
      setToken("mock-admin-token");
      localStorage.setItem("auth_token", "mock-admin-token");
    }
    setIsLoading(false);
  }, []);

  const loginAs = (r: UserRole) => {
    setUser(MOCK_ADMIN_USER);
    setToken("mock-admin-token");
    setRole(r);
    localStorage.setItem("admin-console-role", r);
    localStorage.setItem("admin-console-authed", "true");
    localStorage.setItem("auth_token", "mock-admin-token");
  };

  const login = async (_credentials: { email: string; password: string }) => {
    loginAs("admin");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole("admin");
    localStorage.removeItem("admin-console-role");
    localStorage.removeItem("admin-console-authed");
    localStorage.removeItem("auth_token");
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
