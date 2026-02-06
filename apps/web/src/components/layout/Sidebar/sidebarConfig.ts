import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Plug,
  Users,
  Key,
  Package,
  Wallet,
  ScrollText,
  Bell
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
      { label: "Online Ödemeler", path: "/finance/payments" },
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
    icon: ShoppingCart,
    label: "Satış",
    path: "/sales",
  },
  {
    icon: Plug,
    label: "Entegratör",
    path: "/integrator",
  },
  {
    icon: ScrollText,
    label: "Sistem",
    subItems: [
      { label: "Sistem Logları", path: "/system/logs" },
    ],
  },
  {
    icon: Bell,
    label: "Bildirimler",
    path: "/system/notifications",
  },
];
