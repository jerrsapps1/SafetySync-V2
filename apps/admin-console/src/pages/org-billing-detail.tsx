import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, ExternalLink, Copy, Trash2, Save, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface OverrideData {
  id: string;
  overrideType: string;
  discountPercent: number | null;
  fixedPriceCents: number | null;
  note: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

interface OrgBillingDetail {
  orgId: string;
  orgName: string;
  plan: string;
  billingStatus: string;
  trialEndsAt: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  invoices: {
    id: string;
    date: string;
    amount: string;
    status: string;
    hostedUrl: string | null;
  }[];
  override: OverrideData | null;
}

interface BillingNote {
  id: string;
  orgId: string;
  note: string;
  authorUserId: string;
  createdAt: string;
}

const planLabels: Record<string, string> = {
  trial: "Trial",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

const statusLabels: Record<string, string> = {
  trial: "Trial",
  active: "Active",
  past_due: "Past Due",
  canceled: "Canceled",
};

function statusVariant(status: string): "secondary" | "default" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "past_due":
    case "canceled":
      return "destructive";
    default:
      return "secondary";
  }
}

function formatDate(d: string | null): string {
  if (!d) return "\u2014";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(d: string | null): string {
  if (!d) return "\u2014";
  return new Date(d).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const overrideTypeLabels: Record<string, string> = {
  comped: "Comped (Free)",
  discount_percent: "Discount %",
  fixed_price: "Fixed Price",
  none: "None",
};

export default function OrgBillingDetail() {
  const [, params] = useRoute("/billing/:orgId");
  const orgId = params?.orgId;
  const { toast } = useToast();

  const { data: billing, isLoading, error } = useQuery<OrgBillingDetail>({
    queryKey: ["/api/admin/organizations", orgId, "billing"],
    enabled: !!orgId,
  });

  const { data: notes, isLoading: notesLoading } = useQuery<BillingNote[]>({
    queryKey: ["/api/admin/organizations", orgId, "billing-notes"],
    enabled: !!orgId,
  });

  const [overrideType, setOverrideType] = useState("comped");
  const [discountPercent, setDiscountPercent] = useState("");
  const [fixedPriceCents, setFixedPriceCents] = useState("");
  const [overrideNote, setOverrideNote] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [newNote, setNewNote] = useState("");

  const createOverrideMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        overrideType,
        note: overrideNote,
      };
      if (overrideType === "discount_percent") {
        body.discountPercent = Number(discountPercent);
      }
      if (overrideType === "fixed_price") {
        body.fixedPriceCents = Number(fixedPriceCents);
      }
      if (endsAt) {
        body.endsAt = endsAt;
      }
      await apiRequest("POST", `/api/admin/organizations/${orgId}/billing-override`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/organizations", orgId, "billing"] });
      setOverrideNote("");
      setDiscountPercent("");
      setFixedPriceCents("");
      setEndsAt("");
      toast({ title: "Override saved" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteOverrideMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/admin/organizations/${orgId}/billing-override`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/organizations", orgId, "billing"] });
      toast({ title: "Override removed" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/admin/organizations/${orgId}/billing-notes`, { note: newNote });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/organizations", orgId, "billing-notes"] });
      setNewNote("");
      toast({ title: "Note added" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const portalLinkMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/organizations/${orgId}/portal-link`);
      return res.json() as Promise<{ url: string }>;
    },
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.url);
      toast({ title: "Portal link copied to clipboard" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center text-muted-foreground" data-testid="billing-detail-error">
        Failed to load billing details
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="page-org-billing-detail">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/billing">
          <Button variant="ghost" size="sm" data-testid="button-back-to-billing">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold" data-testid="text-org-billing-title">
            {billing.orgName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Billing Details</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => portalLinkMutation.mutate()}
          disabled={portalLinkMutation.isPending}
          data-testid="button-generate-portal-link"
        >
          {portalLinkMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Copy className="h-3.5 w-3.5 mr-1" />
          )}
          Generate Portal Link
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-plan">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold" data-testid="text-detail-plan">
              {planLabels[billing.plan] || billing.plan}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-status">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Billing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={statusVariant(billing.billingStatus)} data-testid="badge-detail-status">
              {statusLabels[billing.billingStatus] || billing.billingStatus}
            </Badge>
          </CardContent>
        </Card>

        <Card data-testid="card-trial-end">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trial End</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium" data-testid="text-detail-trial-end">
              {formatDate(billing.trialEndsAt)}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-period-end">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Period End</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium" data-testid="text-detail-period-end">
              {formatDate(billing.currentPeriodEnd)}
            </p>
          </CardContent>
        </Card>
      </div>

      {billing.subscriptionStatus && (
        <Card data-testid="card-subscription">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm">Status:</span>
              <Badge variant={statusVariant(billing.subscriptionStatus)} data-testid="badge-sub-status">
                {statusLabels[billing.subscriptionStatus] || billing.subscriptionStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-billing-override">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Billing Override</CardTitle>
          {billing.override && (
            <Badge variant="secondary" data-testid="badge-override-active">
              {overrideTypeLabels[billing.override.overrideType] || billing.override.overrideType}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {billing.override ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Type: </span>
                  <span className="font-medium" data-testid="text-override-type">
                    {overrideTypeLabels[billing.override.overrideType]}
                  </span>
                </div>
                {billing.override.discountPercent != null && (
                  <div>
                    <span className="text-muted-foreground">Discount: </span>
                    <span className="font-medium" data-testid="text-override-discount">
                      {billing.override.discountPercent}%
                    </span>
                  </div>
                )}
                {billing.override.fixedPriceCents != null && (
                  <div>
                    <span className="text-muted-foreground">Fixed Price: </span>
                    <span className="font-medium" data-testid="text-override-fixed-price">
                      ${(billing.override.fixedPriceCents / 100).toFixed(2)}/mo
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Note: </span>
                  <span className="font-medium" data-testid="text-override-note">{billing.override.note}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Since: </span>
                  <span data-testid="text-override-since">{formatDateTime(billing.override.createdAt)}</span>
                </div>
                {billing.override.endsAt && (
                  <div>
                    <span className="text-muted-foreground">Ends: </span>
                    <span data-testid="text-override-ends">{formatDate(billing.override.endsAt)}</span>
                  </div>
                )}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteOverrideMutation.mutate()}
                disabled={deleteOverrideMutation.isPending}
                data-testid="button-remove-override"
              >
                {deleteOverrideMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                )}
                Remove Override
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground" data-testid="text-no-override">
                No billing override applied
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="overrideType">Override Type</Label>
                  <Select value={overrideType} onValueChange={setOverrideType}>
                    <SelectTrigger data-testid="select-override-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comped">Comped (Free)</SelectItem>
                      <SelectItem value="discount_percent">Discount %</SelectItem>
                      <SelectItem value="fixed_price">Fixed Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {overrideType === "discount_percent" && (
                  <div className="space-y-2">
                    <Label htmlFor="discountPercent">Discount Percent</Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      min={1}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      placeholder="e.g. 25"
                      data-testid="input-discount-percent"
                    />
                  </div>
                )}

                {overrideType === "fixed_price" && (
                  <div className="space-y-2">
                    <Label htmlFor="fixedPriceCents">Fixed Price (cents)</Label>
                    <Input
                      id="fixedPriceCents"
                      type="number"
                      min={0}
                      value={fixedPriceCents}
                      onChange={(e) => setFixedPriceCents(e.target.value)}
                      placeholder="e.g. 4999 for $49.99"
                      data-testid="input-fixed-price"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="endsAt">End Date (optional)</Label>
                  <Input
                    id="endsAt"
                    type="date"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    data-testid="input-override-ends-at"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="overrideNote">Note (required)</Label>
                  <Textarea
                    id="overrideNote"
                    value={overrideNote}
                    onChange={(e) => setOverrideNote(e.target.value)}
                    placeholder="Reason for this override..."
                    className="resize-none"
                    data-testid="input-override-note"
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => createOverrideMutation.mutate()}
                disabled={createOverrideMutation.isPending || !overrideNote.trim()}
                data-testid="button-save-override"
              >
                {createOverrideMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5 mr-1" />
                )}
                Save Override
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-billing-notes">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Internal Billing Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add an internal note..."
              className="resize-none flex-1"
              data-testid="input-billing-note"
            />
            <Button
              size="sm"
              onClick={() => addNoteMutation.mutate()}
              disabled={addNoteMutation.isPending || !newNote.trim()}
              className="self-end"
              data-testid="button-add-note"
            >
              {addNoteMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5 mr-1" />
              )}
              Add
            </Button>
          </div>

          {notesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : notes && notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="border rounded-md p-3 text-sm"
                  data-testid={`note-${n.id}`}
                >
                  <p data-testid={`text-note-content-${n.id}`}>{n.note}</p>
                  <p className="text-xs text-muted-foreground mt-1" data-testid={`text-note-meta-${n.id}`}>
                    {n.authorUserId} &middot; {formatDateTime(n.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2" data-testid="text-no-notes">
              No notes yet
            </p>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-invoices">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Invoices ({billing.invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-invoices">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {billing.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b last:border-b-0" data-testid={`row-invoice-${inv.id}`}>
                    <td className="px-4 py-3" data-testid={`text-invoice-date-${inv.id}`}>
                      {formatDate(inv.date)}
                    </td>
                    <td className="px-4 py-3 font-medium" data-testid={`text-invoice-amount-${inv.id}`}>
                      ${inv.amount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={inv.status === "paid" ? "default" : "secondary"}
                        data-testid={`badge-invoice-status-${inv.id}`}
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {inv.hostedUrl ? (
                        <a href={inv.hostedUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" data-testid={`button-invoice-link-${inv.id}`}>
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">{"\u2014"}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {billing.invoices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
