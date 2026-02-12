import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Billing() {
  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="page-billing">
      <h1 className="text-2xl font-semibold" data-testid="text-billing-title">
        Billing
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Billing Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground" data-testid="text-billing-placeholder">
            Billing management coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
