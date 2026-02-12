import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Audit() {
  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="page-audit">
      <h1 className="text-2xl font-semibold" data-testid="text-audit-title">
        Audit Log
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground" data-testid="text-audit-placeholder">
            Audit log coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
