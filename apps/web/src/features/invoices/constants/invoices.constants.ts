// API URL'leri
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export const INVOICES_CONSTANTS = {
  API_BASE_URL,
  ENDPOINTS: {
    INVOICES: "/invoices"
  },
  DEFAULT_PAGE_SIZE: 50,
  
  // Fatura tipleri
  INVOICE_TYPES: [
    { id: "contract", name: "Kontrat" },
    { id: "sale", name: "Satış" },
    { id: "eDocuments", name: "E-Belge" }
  ],

  // Ödeme durumları
  PAYMENT_STATUS: [
    { id: "all", name: "Tümü" },
    { id: "paid", name: "Ödendi" },
    { id: "unpaid", name: "Ödenmedi" }
  ],

  // Firmalar
  INTERNAL_FIRMS: [
    { id: "KERZZ", name: "Kerzz" },
    { id: "ORWI", name: "Orwi" }
  ],

  // Preset tarih aralıkları
  DATE_PRESETS: [
    { id: "currentMonth", name: "Bu Ay" },
    { id: "lastMonth", name: "Geçen Ay" },
    { id: "currentQuarter", name: "Bu Çeyrek" },
    { id: "last30Days", name: "Son 30 Gün" },
    { id: "last90Days", name: "Son 90 Gün" }
  ]
} as const;
