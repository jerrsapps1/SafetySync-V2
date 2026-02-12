import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { listSupportTickets, updateTicketStatus, addTicketNote } from '@/mock/api';
import { type MockSupportTicket, db } from '@/mock/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Headphones, MessageSquare, Plus } from 'lucide-react';

export default function OwnerSupport() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<MockSupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<MockSupportTicket | null>(null);
  const [noteText, setNoteText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadTickets = () => {
    listSupportTickets().then(setTickets);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const translateCategory = (cat: string) => {
    const map: Record<string, string> = {
      'Login / account issues': t('owner.catLogin'),
      'Training records': t('owner.catTraining'),
      'Certificate generation': t('owner.catCertificate'),
      'AI ingestion problems': t('owner.catAI'),
      'Billing questions': t('owner.catBilling'),
      'Data corrections': t('owner.catData'),
      'Feature requests': t('owner.catFeature'),
    };
    return map[cat] || cat;
  };

  const getOrgName = (orgId: string) => {
    return db.organizations.find(o => o.id === orgId)?.name ?? orgId;
  };

  const statusColor = (status: string) => {
    if (status === 'Open') return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    await updateTicketStatus(ticketId, newStatus as MockSupportTicket['status']);
    loadTickets();
  };

  const handleAddNote = async () => {
    if (!selectedTicket || !noteText.trim()) return;
    const updated = await addTicketNote(selectedTicket.id, noteText.trim());
    setSelectedTicket(updated);
    setNoteText('');
    loadTickets();
    toast({ title: t('owner.addNote'), description: selectedTicket.subject });
  };

  const openNotesDialog = (ticket: MockSupportTicket) => {
    setSelectedTicket(ticket);
    setNoteText('');
    setDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6" data-testid="owner-support-page">
      <div className="flex items-center gap-2">
        <Headphones className="h-6 w-6" />
        <h1 className="text-2xl font-bold" data-testid="text-owner-support-title">
          {t('owner.support')}
        </h1>
      </div>

      <Card data-testid="card-ticket-table">
        <CardHeader>
          <CardTitle>{t('owner.ticketTable')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-tickets">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4 font-medium" data-testid="th-subject">{t('owner.ticketTable')}</th>
                  <th className="pb-2 pr-4 font-medium" data-testid="th-category">{t('owner.category')}</th>
                  <th className="pb-2 pr-4 font-medium" data-testid="th-organization">{t('owner.organization')}</th>
                  <th className="pb-2 pr-4 font-medium" data-testid="th-status">{t('owner.status')}</th>
                  <th className="pb-2 pr-4 font-medium" data-testid="th-created-date">{t('owner.createdDate')}</th>
                  <th className="pb-2 font-medium" data-testid="th-actions">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="border-b last:border-b-0" data-testid={`row-ticket-${ticket.id}`}>
                    <td className="py-3 pr-4" data-testid={`text-subject-${ticket.id}`}>{ticket.subject}</td>
                    <td className="py-3 pr-4" data-testid={`text-category-${ticket.id}`}>{translateCategory(ticket.category)}</td>
                    <td className="py-3 pr-4" data-testid={`text-org-${ticket.id}`}>{getOrgName(ticket.orgId)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Badge className={statusColor(ticket.status)} data-testid={`badge-status-${ticket.id}`}>
                          {ticket.status === 'Open' && t('owner.statusOpen')}
                          {ticket.status === 'In Progress' && t('owner.statusInProgress')}
                          {ticket.status === 'Resolved' && t('owner.statusResolved')}
                        </Badge>
                        <Select
                          value={ticket.status}
                          onValueChange={(val) => handleStatusChange(ticket.id, val)}
                        >
                          <SelectTrigger className="w-[140px]" data-testid={`select-status-${ticket.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open" data-testid={`option-open-${ticket.id}`}>{t('owner.statusOpen')}</SelectItem>
                            <SelectItem value="In Progress" data-testid={`option-inprogress-${ticket.id}`}>{t('owner.statusInProgress')}</SelectItem>
                            <SelectItem value="Resolved" data-testid={`option-resolved-${ticket.id}`}>{t('owner.statusResolved')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="py-3 pr-4" data-testid={`text-date-${ticket.id}`}>{ticket.createdDate}</td>
                    <td className="py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openNotesDialog(ticket)}
                        data-testid={`button-notes-${ticket.id}`}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {t('owner.internalNotes')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="dialog-notes">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {selectedTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3 max-h-60 overflow-y-auto" data-testid="list-notes">
              {selectedTicket?.notes.map((note, idx) => (
                <div key={idx} className="border rounded-md p-3" data-testid={`note-${idx}`}>
                  <p className="text-sm" data-testid={`text-note-content-${idx}`}>{note.text}</p>
                  <p className="text-xs text-muted-foreground mt-1" data-testid={`text-note-date-${idx}`}>{note.date}</p>
                </div>
              ))}
            </div>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t('owner.addNote')}
              data-testid="textarea-new-note"
            />
            <Button onClick={handleAddNote} data-testid="button-add-note">
              <Plus className="h-4 w-4 mr-1" />
              {t('owner.addNote')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
