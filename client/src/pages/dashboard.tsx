import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "@/components/GlassCard";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] p-4">
      <div className="mx-auto max-w-4xl pt-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500/80 via-sky-500/80 to-emerald-400/80 shadow-md shadow-sky-500/40" />
            <span className="text-lg font-semibold tracking-tight">
              SafetySync.ai
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-[color:var(--text)] hover-elevate active-elevate-2"
            data-testid="button-logout"
          >
            Logout
          </button>
        </div>

        <GlassCard>
          <h1 className="text-2xl font-semibold mb-4">Welcome to SafetySync.ai</h1>
          <div className="space-y-3">
            <p className="text-[color:var(--text-muted)]">
              You are logged in as: <span className="font-medium text-[color:var(--text)]" data-testid="text-user-email">{user?.email}</span>
            </p>
            <p className="text-[color:var(--text-muted)]">
              Username: <span className="font-medium text-[color:var(--text)]">{user?.username}</span>
            </p>
            <div className="mt-6 p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-sm text-[color:var(--text-muted)]">
                This is a placeholder dashboard. The full application backend and features will be implemented in the next phase.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
