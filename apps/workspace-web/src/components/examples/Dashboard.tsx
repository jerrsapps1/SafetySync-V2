import { useEffect } from "react";
import Dashboard from "../../pages/dashboard";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";

function DashboardWithMockAuth() {
  const { login } = useAuth();

  useEffect(() => {
    login({ email: "demo@safetysync.ai", password: "demo" });
  }, []);

  return <Dashboard />;
}

export default function DashboardExample() {
  return (
    <AuthProvider>
      <DashboardWithMockAuth />
    </AuthProvider>
  );
}
