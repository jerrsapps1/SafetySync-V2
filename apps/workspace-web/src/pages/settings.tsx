import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Package, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlements } from "@/contexts/EntitlementContext";

export default function SettingsPage() {
  const { t, lang, toggleLang } = useI18n();
  const { activeOrg } = useOrganization();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: entitlementData } = useEntitlements();

  const [orgName, setOrgName] = useState(activeOrg.name);
  const [orgAddress, setOrgAddress] = useState("1234 Builder Ave, Houston, TX 77001");
  const [orgPhone, setOrgPhone] = useState("(713) 555-0100");
  const [userName, setUserName] = useState(user?.username || "safetymanager");
  const [userEmail, setUserEmail] = useState(user?.email || "manager@democonstruction.com");

  useEffect(() => {
    setOrgName(activeOrg.name);
  }, [activeOrg.name]);

  const handleSave = () => {
    toast({ title: t("settings.saved") });
  };

  return (
    <div className="space-y-6 p-6" data-testid="settings-page">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-settings-title">
          <SettingsIcon className="inline-block mr-2 h-6 w-6" />
          {t("settings.title")}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle data-testid="text-org-profile-title">{t("settings.orgProfile")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name" data-testid="label-org-name">{t("settings.orgName")}</Label>
            <Input
              id="org-name"
              value={orgName}
              disabled
              data-testid="input-org-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-address" data-testid="label-org-address">{t("settings.orgAddress")}</Label>
            <Input
              id="org-address"
              value={orgAddress}
              onChange={(e) => setOrgAddress(e.target.value)}
              data-testid="input-org-address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-phone" data-testid="label-org-phone">{t("settings.orgPhone")}</Label>
            <Input
              id="org-phone"
              value={orgPhone}
              onChange={(e) => setOrgPhone(e.target.value)}
              data-testid="input-org-phone"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle data-testid="text-user-profile-title">{t("settings.userProfile")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name" data-testid="label-user-name">{t("settings.userName")}</Label>
            <Input
              id="user-name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              data-testid="input-user-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email" data-testid="label-user-email">{t("settings.userEmail")}</Label>
            <Input
              id="user-email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              data-testid="input-user-email"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle data-testid="text-preferences-title">{t("settings.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Label htmlFor="theme-switch" data-testid="label-theme">{t("settings.theme")}</Label>
            <Switch
              id="theme-switch"
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
              data-testid="switch-theme"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Label htmlFor="lang-switch" data-testid="label-language">{t("settings.language")}</Label>
            <Switch
              id="lang-switch"
              checked={lang === "es"}
              onCheckedChange={toggleLang}
              data-testid="switch-language"
            />
          </div>
        </CardContent>
      </Card>

      {entitlementData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2" data-testid="text-suite-title">
              <Package className="h-5 w-5" />
              Product Suite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Products enabled for your organization.
            </p>
            {Object.keys(entitlementData.entitlements).length === 0 ? (
              <p className="text-sm text-muted-foreground" data-testid="text-no-products">
                No products configured yet.
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(entitlementData.entitlements).map(([slug, entry]) => (
                  <div
                    key={slug}
                    className="flex flex-wrap items-center justify-between gap-2 py-2 border-b last:border-b-0"
                    data-testid={`row-product-${slug}`}
                  >
                    <div className="flex items-center gap-2">
                      {entry.enabled ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium capitalize" data-testid={`text-product-name-${slug}`}>
                        {slug}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.enabled ? "default" : "secondary"} data-testid={`badge-product-status-${slug}`}>
                        {entry.enabled ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" data-testid={`badge-product-plan-${slug}`}>
                        {entry.plan}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSave} data-testid="button-save-settings">
        {t("settings.saveChanges")}
      </Button>

      <p className="text-center text-sm text-muted-foreground" data-testid="text-powered-by">
        {t("common.poweredBy")}
      </p>
    </div>
  );
}
