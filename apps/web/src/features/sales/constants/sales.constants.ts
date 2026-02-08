const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export const SALES_CONSTANTS = {
  API_BASE_URL,
  ENDPOINTS: {
    SALES: "/sales",
  },
  QUERY_KEYS: {
    SALES: "sales",
    SALE: "sale",
    SALE_STATS: "sale-stats",
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
} as const;
