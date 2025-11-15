import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Employee, Location } from "@shared/schema";

export default function Employees() {
  const [, setPathLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    enabled: !!user,
  });

  const { data: locations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      locationId?: string;
    }) => {
      await apiRequest("POST", "/api/employees", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setIsDialogOpen(false);
      toast({ title: "Employee created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create employee", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
      locationId: formData.get("locationId") as string || undefined,
      status: "active",
    } as any);
  };

  const handleLogout = () => {
    logout();
    setPathLocation("/");
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] p-4">
      <div className="mx-auto max-w-7xl pt-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500/80 via-sky-500/80 to-emerald-400/80 shadow-md shadow-sky-500/40" />
            <span className="text-lg font-semibold tracking-tight">SafetySync.ai</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPathLocation("/dashboard")}
              data-testid="button-dashboard"
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Employees</h1>
            <p className="text-sm text-[color:var(--text-muted)]">
              Manage your workforce
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-employee">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      className="bg-secondary/50 border-white/10"
                      data-testid="input-firstName"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      className="bg-secondary/50 border-white/10"
                      data-testid="input-lastName"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="bg-secondary/50 border-white/10"
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    name="role"
                    required
                    placeholder="e.g. Foreman, Laborer, Electrician"
                    className="bg-secondary/50 border-white/10"
                    data-testid="input-role"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationId">Location (Optional)</Label>
                  <select
                    id="locationId"
                    name="locationId"
                    className="flex h-10 w-full rounded-md border border-white/10 bg-secondary/50 px-3 py-2 text-sm text-foreground"
                    data-testid="select-location"
                  >
                    <option value="">None</option>
                    {locations?.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? "Creating..." : "Create Employee"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <GlassCard>
          {isLoading ? (
            <div className="text-center py-8 text-[color:var(--text-muted)]">Loading...</div>
          ) : employees && employees.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[color:var(--canvas)]/70">
              <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] border-b border-white/5 bg-white/5 px-3 py-2 text-[11px] text-[color:var(--text-muted)]">
                <span>Name</span>
                <span>Role</span>
                <span>Email</span>
                <span>Status</span>
              </div>
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] items-center border-t border-white/5 px-3 py-2.5 text-[11px]"
                  data-testid={`employee-${emp.id}`}
                >
                  <div className="font-medium">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="text-[color:var(--text-muted)]">{emp.role}</div>
                  <div className="text-[color:var(--text-muted)]">{emp.email || "N/A"}</div>
                  <div>
                    <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      {emp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[color:var(--text-muted)]">
              No employees found. Add your first employee to get started.
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
