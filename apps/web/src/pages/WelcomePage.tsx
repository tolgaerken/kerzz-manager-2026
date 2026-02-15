import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../features/auth";
import { PERMISSIONS } from "../features/auth/constants/permissions";
import {
  LayoutDashboard,
  FileText,
  Users,
  Key,
  Wallet,
  TrendingUp,
  FileCheck,
  ScrollText,
  Bell,
  Shield,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface QuickLink {
  icon: LucideIcon;
  label: string;
  path: string;
  permission: string;
}

const QUICK_LINKS: QuickLink[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", permission: PERMISSIONS.DASHBOARD_VIEW },
  { icon: FileText, label: "Kontratlar", path: "/contracts", permission: PERMISSIONS.CONTRACT_MENU },
  { icon: Users, label: "Müşteriler", path: "/customers", permission: PERMISSIONS.CUSTOMER_MENU },
  { icon: Key, label: "Lisanslar", path: "/licenses", permission: PERMISSIONS.LICENSE_MENU },
  { icon: Wallet, label: "Finans", path: "/finance/invoices", permission: PERMISSIONS.FINANCE_MENU },
  { icon: TrendingUp, label: "Satış Yönetimi", path: "/sales", permission: PERMISSIONS.SALES_MENU },
  { icon: FileCheck, label: "E-Belge", path: "/e-documents/statuses", permission: PERMISSIONS.EDOC_MENU },
  { icon: ScrollText, label: "Sistem", path: "/system/logs", permission: PERMISSIONS.SYSTEM_MENU },
  { icon: Bell, label: "Bildirimler", path: "/system/notifications", permission: PERMISSIONS.NOTIFICATION_MENU },
  { icon: Shield, label: "SSO Yönetimi", path: "/sso-management", permission: PERMISSIONS.SSO_MANAGEMENT_MENU },
];

export function WelcomePage() {
  const { userInfo, activeLicance, hasPermission } = useAuth();
  const navigate = useNavigate();

  const availableLinks = useMemo(
    () => QUICK_LINKS.filter((link) => hasPermission(link.permission)),
    [hasPermission]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-start py-8 md:py-12 px-4">
      {/* Greeting */}
      <div className="w-full max-w-2xl text-center mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] mb-2">
          Hoş geldiniz{userInfo?.name ? `, ${userInfo.name}` : ""}
        </h1>
        <p className="text-sm md:text-base text-[var(--color-muted-foreground)]">
          {activeLicance?.brand ?? "Kerzz Manager"} 
        </p>
      </div>

      {/* Quick Links */}
      {availableLinks.length > 0 ? (
        <div className="w-full max-w-2xl">
          <h2 className="text-sm font-medium text-[var(--color-muted-foreground)] mb-4 uppercase tracking-wider">
            Hızlı Erişim
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate({ to: link.path })}
                className="group flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition-colors hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]/40"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <link.icon size={20} />
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--color-foreground)]">
                  {link.label}
                </span>
                <ArrowRight
                  size={16}
                  className="text-[var(--color-muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100"
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md text-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Henüz erişebileceğiniz bir modül bulunmuyor. Lütfen yöneticinizle iletişime geçin.
          </p>
        </div>
      )}
    </div>
  );
}
