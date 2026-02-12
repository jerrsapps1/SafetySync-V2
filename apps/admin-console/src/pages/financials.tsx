import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Financials() {
  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="page-financials">
      <h1 className="text-2xl font-semibold" data-testid="text-financials-title">
        Financials
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Financial Reporting</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground" data-testid="text-financials-placeholder">
            Financial reporting coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
