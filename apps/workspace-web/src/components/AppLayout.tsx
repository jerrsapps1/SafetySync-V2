import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/contexts/I18nContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  Award,
  CreditCard,
  ShieldCheck,
  Settings,
  Sun,
  Moon,
  Languages,
  Building2,
  ChevronDown,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";

const workspaceNavItems = [
  { key: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "nav.employees", href: "/employees", icon: Users },
  { key: "nav.documents", href: "/documents", icon: FileText },
  { key: "nav.certificates", href: "/certificates", icon: Award },
  { key: "nav.walletCards", href: "/wallet-cards", icon: CreditCard },
  { key: "nav.compliance", href: "/compliance", icon: ShieldCheck },
  { key: "nav.settings", href: "/settings", icon: Settings },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, toggleLang } = useI18n();
  const { activeOrg, setActiveOrg, organizations } = useOrganization();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const navItems = workspaceNavItems;

  const style = {
    "--sidebar-width": "15rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500/80 via-sky-500/80 to-emerald-400/80 shadow-md shadow-sky-500/40 flex-shrink-0" />
              <span className="text-base font-semibold tracking-tight">SafetySync.ai</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{t("nav.dashboard")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.href}
                        data-testid={`nav-${item.href.replace(/\//g, '-').slice(1)}`}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{t(item.key)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <div className="text-[10px] text-muted-foreground text-center">
              {t("common.poweredBy")}
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b px-3 py-2 bg-background/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="dropdown-org">
                    <Building2 className="h-4 w-4 mr-1" />
                    <span className="truncate max-w-[160px]">{activeOrg.name}</span>
                    <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {organizations.map((org) => (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => setActiveOrg(org)}
                      data-testid={`org-option-${org.id}`}
                    >
                      {org.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLang}
                data-testid="button-toggle-lang"
                title={lang === "en" ? "Cambiar a Español" : "Switch to English"}
              >
                <Languages className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                data-testid="button-toggle-theme"
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-1" />
                {t("common.logout")}
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
