/** Fatura satır kategorisi */
export type UninvoicedItemCategory = "eftpos" | "support" | "version" | "item" | "saas";

/** Faturaya dahil edilmemiş kalem */
export interface UninvoicedItem {
  id: string;
  category: UninvoicedItemCategory;
  description: string;
  contractId: string;
  contractNo?: number;
  company?: string;
}

/** Faturaya dahil edilmemiş kalemlerin özeti */
export interface UninvoicedItemsSummary {
  eftpos: UninvoicedItem[];
  support: UninvoicedItem[];
  version: UninvoicedItem[];
  item: UninvoicedItem[];
  saas: UninvoicedItem[];
  total: number;
}

/** Kategori bilgisi */
export interface CategoryInfo {
  key: UninvoicedItemCategory;
  label: string;
  color: string;
}

/** Tarih aralığı filtresi */
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

/** Kategori haritası */
export const CATEGORY_INFO: Record<UninvoicedItemCategory, CategoryInfo> = {
  eftpos: {
    key: "eftpos",
    label: "Yazarkasa (EFT-POS)",
    color: "var(--color-primary)",
  },
  saas: {
    key: "saas",
    label: "SaaS Ürünleri",
    color: "var(--color-info)",
  },
  support: {
    key: "support",
    label: "Destek Paketleri",
    color: "var(--color-success)",
  },
  item: {
    key: "item",
    label: "Diğer Kalemler",
    color: "var(--color-warning)",
  },
  version: {
    key: "version",
    label: "Sürümler",
    color: "var(--color-muted-foreground)",
  },
};
