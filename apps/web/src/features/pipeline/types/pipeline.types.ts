// Ortak parent tipi
export type ParentType = "offer" | "sale";

// Pipeline ürün satır kalemi
export interface PipelineProduct {
  _id: string;
  parentId: string;
  parentType: ParentType;
  pipelineRef: string;
  catalogId: string;
  erpId: string;
  name: string;
  description: string;
  qty: number;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  price: number;
  currency: string;
  saleCurrency: string;
  vatRate: number;
  discountRate: number;
  discountTotal: number;
  taxTotal: number;
  subTotal: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

// Pipeline lisans satır kalemi
export interface PipelineLicense {
  _id: string;
  parentId: string;
  parentType: ParentType;
  pipelineRef: string;
  catalogId: string;
  erpId: string;
  pid: string;
  name: string;
  description: string;
  type: string;
  qty: number;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  price: number;
  currency: string;
  vatRate: number;
  discountRate: number;
  discountTotal: number;
  taxTotal: number;
  subTotal: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

// Pipeline kiralama/SaaS satır kalemi
export interface PipelineRental {
  _id: string;
  parentId: string;
  parentType: ParentType;
  pipelineRef: string;
  catalogId: string;
  erpId: string;
  pid: string;
  name: string;
  description: string;
  type: string;
  qty: number;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  price: number;
  currency: string;
  vatRate: number;
  yearly: boolean;
  rentPeriod: number;
  discountRate: number;
  discountTotal: number;
  taxTotal: number;
  subTotal: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

// Pipeline ödeme
export interface PipelinePayment {
  _id: string;
  parentId: string;
  parentType: ParentType;
  pipelineRef: string;
  amount: number;
  currency: string;
  paymentDate: string;
  method: string;
  description: string;
  isPaid: boolean;
  invoiceNo: string;
  createdAt: string;
  updatedAt: string;
}

// Para birimi bazında toplamlar
export interface CurrencyTotals {
  currency: string;
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

// Genel toplamlar
export interface PipelineTotals {
  currencies: CurrencyTotals[];
  overallSubTotal: number;
  overallDiscountTotal: number;
  overallTaxTotal: number;
  overallGrandTotal: number;
}

// Durum tipleri
export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "unqualified"
  | "converted"
  | "lost";

export type OfferStatus =
  | "draft"
  | "sent"
  | "revised"
  | "waiting"
  | "approved"
  | "rejected"
  | "won"
  | "lost"
  | "converted";

export type SaleStatus =
  | "pending"
  | "collection-waiting"
  | "setup-waiting"
  | "training-waiting"
  | "active"
  | "completed"
  | "cancelled";

export type PipelineStatus = LeadStatus | OfferStatus | SaleStatus;

// Durum etiket renkleri
export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  // Lead
  new: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  contacted: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300" },
  qualified: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  unqualified: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-700 dark:text-gray-300" },
  converted: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
  lost: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
  // Offer
  draft: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-700 dark:text-gray-300" },
  sent: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  revised: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  waiting: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300" },
  approved: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  rejected: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
  won: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
  // Sale
  pending: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300" },
  "collection-waiting": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  "setup-waiting": { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300" },
  "training-waiting": { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-300" },
  active: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  completed: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
  cancelled: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
};

// Durum etiketleri (Türkçe)
export const STATUS_LABELS: Record<string, string> = {
  // Lead
  new: "Yeni",
  contacted: "İletişim Kuruldu",
  qualified: "Nitelikli",
  unqualified: "Niteliksiz",
  converted: "Dönüştürüldü",
  lost: "Kaybedildi",
  // Offer
  draft: "Taslak",
  sent: "Gönderildi",
  revised: "Revize Edildi",
  waiting: "Cevap Bekleniyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  won: "Kazanıldı",
  // Sale
  pending: "Beklemede",
  "collection-waiting": "Tahsilat Bekleniyor",
  "setup-waiting": "Kurulum Bekleniyor",
  "training-waiting": "Eğitim Bekleniyor",
  active: "Aktif",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
};
