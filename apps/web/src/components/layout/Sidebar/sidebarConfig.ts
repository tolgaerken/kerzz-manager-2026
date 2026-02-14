import { 
  LayoutDashboard, 
  FileText, 
  Plug,
  Users,
  Key,
  Package,
  Wallet,
  ScrollText,
  Bell,
  FileCheck,
  TrendingUp,
  UserCog,
  Shield,
} from "lucide-react";
import type { MenuItemProps } from "./SidebarMenuItem";

export const sidebarMenuItems: MenuItemProps[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: FileText,
    label: "Kontrat",
    subItems: [
      { label: "Kontratları Göster", path: "/contracts" },
      { label: "Sözleşme Faturaları", path: "/contract-invoices" },
      { label: "Yazarkasalar", path: "/contracts/cash-registers" },
      { label: "Destekler", path: "/contracts/supports" },
      { label: "Versiyonlar", path: "/contracts/versions" },
      { label: "SaaS", path: "/contracts/saas" },
      { label: "Dökümanlar", path: "/contracts/documents" },
    ],
  },
  {
    icon: Users,
    label: "Müşteriler",
    path: "/customers",
  },
  {
    icon: Key,
    label: "Lisanslar",
    path: "/licenses",
  },
  {
    icon: Wallet,
    label: "Finans",
    subItems: [
      { label: "Faturalar", path: "/finance/invoices" },
      { label: "Alacak Listesi", path: "/finance/receivables" },
      { label: "Online Ödemeler", path: "/finance/payments" },
      { label: "Otomatik Ödemeler", path: "/finance/automated-payments" },
      { label: "Banka İşlemleri", path: "/finance/bank-transactions" },
    ],
  },
  {
    icon: Package,
    label: "Ürünler",
    subItems: [
      { label: "Donanım", path: "/products/hardware" },
      { label: "Yazılım", path: "/products/software" },
    ],
  },
  {
    icon: TrendingUp,
    label: "Satış Yönetimi",
    subItems: [
      { label: "Dashboard", path: "/sales" },
      { label: "Potansiyeller", path: "/leads" },
      { label: "Teklifler", path: "/offers" },
      { label: "Satışlar", path: "/pipeline/sales" },
      { label: "Pipeline Kanban", path: "/pipeline/kanban" },
    ],
  },
  {
    icon: Plug,
    label: "Entegratör",
    path: "/integrator",
  },
  {
    icon: FileCheck,
    label: "E-Belge",
    subItems: [
      { label: "E-Belge Durumları", path: "/e-documents/statuses" },
      { label: "Üye Yönetimi", path: "/e-documents/members" },
      { label: "Kontör Yüklemeleri", path: "/e-documents/credits" },
      { label: "Fiyat Tanımları", path: "/e-documents/invoice-prices" },
    ],
  },
  {
    icon: ScrollText,
    label: "Sistem",
    subItems: [
      { label: "Sistem Logları", path: "/system/logs" },
      { label: "Kullanıcı Yönetimi", path: "/system/users" },
    ],
  },
  {
    icon: Bell,
    label: "Bildirimler",
    path: "/system/notifications",
  },
  {
    icon: Shield,
    label: "SSO Yönetimi",
    subItems: [
      { label: "Dashboard", path: "/sso-management" },
      { label: "Uygulamalar", path: "/sso-management/apps" },
      { label: "Roller", path: "/sso-management/roles" },
      { label: "İzinler", path: "/sso-management/perms" },
      { label: "Kullanıcılar", path: "/sso-management/users" },
      { label: "API Anahtarları", path: "/sso-management/api-keys" },
    ],
  },
];
