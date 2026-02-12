import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockTickets = [
  { id: "TKT-1001", subject: "Unable to upload training documents", org: "Demo Construction Co", status: "Open", priority: "High", created: "2026-02-11" },
  { id: "TKT-1002", subject: "Billing invoice discrepancy", org: "Acme Safety Inc", status: "In Progress", priority: "Medium", created: "2026-02-10" },
  { id: "TKT-1003", subject: "Request for additional user seats", org: "Metro Builders", status: "Open", priority: "Low", created: "2026-02-09" },
  { id: "TKT-1004", subject: "SSO configuration assistance", org: "Pacific Contractors", status: "Resolved", priority: "Medium", created: "2026-02-07" },
];

function statusBadgeClass(status: string) {
  switch (status) {
    case "Open":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 no-default-hover-elevate no-default-active-elevate";
    case "In Progress":
      return "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 no-default-hover-elevate no-default-active-elevate";
    case "Resolved":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 no-default-hover-elevate no-default-active-elevate";
    default:
      return "";
  }
}

export default function AdminSupport() {
  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="page-admin-support">
      <h1 className="text-2xl font-semibold" data-testid="text-admin-support-title">
        Support Tickets
      </h1>

      <div className="space-y-3">
        {mockTickets.map((ticket) => (
          <Card key={ticket.id} data-testid={`card-ticket-${ticket.id}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {ticket.id}: {ticket.subject}
              </CardTitle>
              <Badge className={statusBadgeClass(ticket.status)} data-testid={`badge-ticket-status-${ticket.id}`}>
                {ticket.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span data-testid={`text-ticket-org-${ticket.id}`}>{ticket.org}</span>
                <span data-testid={`text-ticket-priority-${ticket.id}`}>Priority: {ticket.priority}</span>
                <span data-testid={`text-ticket-date-${ticket.id}`}>{ticket.created}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
