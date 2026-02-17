import type { Currency } from "./contract.types";

export type PendingInstallationType = "cash-register" | "saas" | "support";

export interface PendingInstallationItem {
  /** Benzersiz ID (tip_id formatında) */
  id: string;
  /** Orijinal kayıt ID'si */
  originalId: string;
  /** Ürün tipi */
  type: PendingInstallationType;
  /** Kontrat ID */
  contractId: string;
  /** Kontrat numarası */
  contractNo?: number;
  /** Müşteri ID */
  customerId?: string;
  /** Müşteri adı */
  customerName?: string;
  /** Marka */
  brand: string;
  /** Açıklama (SaaS için) */
  description?: string;
  /** Model (Yazarkasa için) */
  model?: string;
  /** Lisans ID */
  licanceId?: string;
  /** Birim fiyat */
  price: number;
  /** Para birimi */
  currency: Currency;
  /** Yıllık mı? */
  yearly: boolean;
  /** Başlangıç tarihi */
  startDate?: string;
  /** Kayıt tarihi */
  editDate?: string;
}

export interface PendingInstallationsResponse {
  data: PendingInstallationItem[];
  total: number;
  counts: {
    cashRegister: number;
    saas: number;
    support: number;
  };
}
