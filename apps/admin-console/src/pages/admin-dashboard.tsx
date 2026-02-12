import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, Users, DollarSign, Headphones } from "lucide-react";

const statCards = [
  {
    label: "Total Organizations",
    value: "24",
    icon: Building2,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    testId: "stat-total-orgs",
  },
  {
    label: "Active Users",
    value: "1,247",
    icon: Users,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    testId: "stat-active-users",
  },
  {
    label: "Monthly Revenue",
    value: "$48,750",
    icon: DollarSign,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    testId: "stat-monthly-revenue",
  },
  {
    label: "Support Tickets",
    value: "12",
    icon: Headphones,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    testId: "stat-support-tickets",
  },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="page-admin-dashboard">
      <h1 className="text-2xl font-semibold" data-testid="text-admin-dashboard-title">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.testId} data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`rounded-md p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold" data-testid={`${stat.testId}-value`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
