import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminSettings() {
  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="page-admin-settings">
      <h1 className="text-2xl font-semibold" data-testid="text-admin-settings-title">
        Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground" data-testid="text-admin-settings-placeholder">
            Admin settings coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
