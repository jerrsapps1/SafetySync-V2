import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AccessBlocked() {
  const { logout } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-background" data-testid="access-blocked-page">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <ShieldAlert className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold" data-testid="text-access-blocked-title">
            Access Not Enabled
          </h1>
          <p className="text-muted-foreground text-sm" data-testid="text-access-blocked-message">
            SafetySync is not currently enabled for your organization.
            Please contact your administrator or our support team to get access.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="outline" asChild data-testid="link-contact-support">
              <a href="mailto:support@safetysync.ai">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </a>
            </Button>
            <Button variant="ghost" onClick={logout} data-testid="button-sign-out">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
