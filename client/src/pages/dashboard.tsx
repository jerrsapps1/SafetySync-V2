import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import GlassCard from "@/components/GlassCard";
import type { TrainingRecord, Employee } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const { data: records, isLoading: recordsLoading } = useQuery<(TrainingRecord & { employee: Employee })[]>({
    queryKey: ["/api/training-records"],
    enabled: !!user,
  });

  const { data: expiringRecords } = useQuery<(TrainingRecord & { employee: Employee })[]>({
    queryKey: ["/api/training-records/expiring?days=30"],
    enabled: !!user,
  });

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const totalRecords = records?.length || 0;
  const expiredCount = records?.filter(r => {
    if (!r.expirationDate) return false;
    return new Date(r.expirationDate) < new Date();
  }).length || 0;
  const expiringCount = expiringRecords?.length || 0;
  const compliantPercent = totalRecords > 0 ? Math.round(((totalRecords - expiredCount) / totalRecords) * 100) : 0;

  const getStatusBadge = (record: TrainingRecord) => {
    if (!record.expirationDate) return { text: "No expiration", className: "bg-blue-500/15 text-blue-300 border-blue-500/40" };
    
    const expDate = new Date(record.expirationDate);
    const today = new Date();
    const daysUntilExp = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExp < 0) {
      return { text: "Expired", className: "bg-rose-500/15 text-rose-300 border-rose-500/40" };
    } else if (daysUntilExp <= 14) {
      return { text: `Expires in ${daysUntilExp} days`, className: "bg-amber-500/15 text-amber-300 border-amber-500/40" };
    } else {
      return { text: "Up to date", className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] p-4">
      <div className="mx-auto max-w-7xl pt-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500/80 via-sky-500/80 to-emerald-400/80 shadow-md shadow-sky-500/40" />
            <span className="text-lg font-semibold tracking-tight">
              SafetySync.ai
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/employees")}
              className="rounded-md px-4 py-2 text-sm font-medium text-[color:var(--text-muted)] hover:text-[color:var(--text)] hover-elevate active-elevate-2"
              data-testid="button-employees"
            >
              Employees
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-[color:var(--text)] hover-elevate active-elevate-2"
              data-testid="button-logout"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Training Dashboard</h1>
          <p className="text-sm text-[color:var(--text-muted)]">
            {user?.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-8">
          <GlassCard>
            <div className="text-3xl font-semibold text-emerald-400" data-testid="stat-compliant">{compliantPercent}%</div>
            <div className="mt-1 text-xs text-[color:var(--text-muted)]">Compliant</div>
          </GlassCard>
          <GlassCard>
            <div className="text-3xl font-semibold text-[color:var(--text)]" data-testid="stat-total">{totalRecords}</div>
            <div className="mt-1 text-xs text-[color:var(--text-muted)]">Total Records</div>
          </GlassCard>
          <GlassCard>
            <div className="text-3xl font-semibold text-amber-400" data-testid="stat-expiring">{expiringCount}</div>
            <div className="mt-1 text-xs text-[color:var(--text-muted)]">Expiring Soon</div>
          </GlassCard>
          <GlassCard>
            <div className="text-3xl font-semibold text-rose-400" data-testid="stat-expired">{expiredCount}</div>
            <div className="mt-1 text-xs text-[color:var(--text-muted)]">Overdue</div>
          </GlassCard>
        </div>

        {/* Training Records Table */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Training Records</h2>
          </div>

          {recordsLoading ? (
            <div className="text-center py-8 text-[color:var(--text-muted)]">Loading...</div>
          ) : records && records.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[color:var(--canvas)]/70">
              <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] border-b border-white/5 bg-white/5 px-3 py-2 text-[11px] text-[color:var(--text-muted)]">
                <span>Employee</span>
                <span>Role</span>
                <span>Training / Standard</span>
                <span>Status</span>
                <span className="text-right">Expiration</span>
              </div>
              {records.slice(0, 10).map((record) => {
                const status = getStatusBadge(record);
                return (
                  <div
                    key={record.id}
                    className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] items-center border-t border-white/5 px-3 py-2.5 text-[11px]"
                    data-testid={`training-record-${record.id}`}
                  >
                    <div className="truncate font-medium">
                      {record.employee.firstName} {record.employee.lastName}
                    </div>
                    <div className="truncate text-[color:var(--text-muted)]">
                      {record.employee.role}
                    </div>
                    <div className="truncate text-[color:var(--text-muted)]">
                      {record.trainingType} · {record.oshaStandard}
                    </div>
                    <div className="flex">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${status.className}`}
                      >
                        {status.text}
                      </span>
                    </div>
                    <div className="text-right text-[color:var(--text-muted)]">
                      {record.expirationDate || "N/A"}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[color:var(--text-muted)]">
              No training records found
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
