import type { ApprovalStatus } from "../types/sale.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

interface ApprovalStatusConfig {
  label: string;
  className: string;
}

export const SALES_CONSTANTS = {
  API_BASE_URL,
  ENDPOINTS: {
    SALES: "/sales",
  },
  QUERY_KEYS: {
    SALES: "sales",
    SALE: "sale",
    SALE_STATS: "sale-stats",
    PENDING_APPROVALS: "pending-approvals",
  },
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200],
  SALE_STATUSES: [
    { id: "pending", name: "Beklemede" },
    { id: "collection-waiting", name: "Tahsilat Bekleniyor" },
    { id: "setup-waiting", name: "Kurulum Bekleniyor" },
    { id: "training-waiting", name: "Eğitim Bekleniyor" },
    { id: "active", name: "Aktif" },
    { id: "completed", name: "Tamamlandı" },
    { id: "cancelled", name: "İptal Edildi" },
  ],
  // Onay durumu sabitleri
  APPROVAL_STATUSES: [
    { id: "none", name: "Onay Yok" },
    { id: "pending", name: "Onay Bekliyor" },
    { id: "approved", name: "Onaylandı" },
    { id: "rejected", name: "Reddedildi" },
  ],
  // Onay durumu görsel konfigürasyonu
  APPROVAL_STATUS_CONFIG: {
    none: {
      label: "-",
      className: "bg-[var(--color-surface)] text-[var(--color-muted-foreground)]",
    },
    pending: {
      label: "Bekliyor",
      className: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    },
    approved: {
      label: "Onaylandı",
      className: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    },
    rejected: {
      label: "Reddedildi",
      className: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
    },
  } as Record<ApprovalStatus, ApprovalStatusConfig>,
} as const;
