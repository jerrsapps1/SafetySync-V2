import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { listSupportTickets } from '@/mock/api';
import { db, type MockSupportTicket } from '@/mock/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Headphones } from 'lucide-react';

export default function OwnerDashboard() {
  const { t } = useI18n();
  const [tickets, setTickets] = useState<MockSupportTicket[]>([]);

  useEffect(() => {
    listSupportTickets().then(setTickets);
  }, []);

  const openCount = tickets.filter(tk => tk.status === 'Open').length;
  const recentTickets = tickets.slice(0, 5);

  const getOrgName = (orgId: string) => {
    return db.organizations.find(o => o.id === orgId)?.name ?? orgId;
  };

  const statusColor = (status: string) => {
    if (status === 'Open') return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
  };

  return (
    <div className="p-6 space-y-6" data-testid="owner-dashboard-page">
      <h1 className="text-2xl font-bold" data-testid="text-owner-dashboard-title">
        {t('owner.dashboard')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-stat-organizations">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('owner.organizations')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-org-count">{db.organizations.length}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-users">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('owner.users')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-users-count">{db.employees.length}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-open-tickets">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('owner.openTickets')}</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-open-tickets-count">{openCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-recent-tickets">
        <CardHeader>
          <CardTitle>{t('owner.ticketTable')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTickets.map(ticket => (
            <div
              key={ticket.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b last:border-b-0 pb-3 last:pb-0"
              data-testid={`row-ticket-${ticket.id}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" data-testid={`text-ticket-subject-${ticket.id}`}>
                  {ticket.subject}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`text-ticket-org-${ticket.id}`}>
                  {getOrgName(ticket.orgId)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={statusColor(ticket.status)} data-testid={`badge-ticket-status-${ticket.id}`}>
                  {ticket.status}
                </Badge>
                <span className="text-sm text-muted-foreground" data-testid={`text-ticket-date-${ticket.id}`}>
                  {ticket.createdDate}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
