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
    { id: "lastMonth", name: "Geçen Ay" }
  ],

  // Ay isimleri
  MONTHS: [
    { id: 0, name: "Ocak" },
    { id: 1, name: "Şubat" },
    { id: 2, name: "Mart" },
    { id: 3, name: "Nisan" },
    { id: 4, name: "Mayıs" },
    { id: 5, name: "Haziran" },
    { id: 6, name: "Temmuz" },
    { id: 7, name: "Ağustos" },
    { id: 8, name: "Eylül" },
    { id: 9, name: "Ekim" },
    { id: 10, name: "Kasım" },
    { id: 11, name: "Aralık" }
  ]
} as const;
