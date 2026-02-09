export interface LogMention {
  userId: string;
  userName: string;
}

export interface LogReference {
  type: string; // "contract" | "license" | ...
  id: string;
  label: string;
}

export interface LogReminder {
  date: string;
  completed: boolean;
}

export interface Log {
  _id: string;
  id: string;
  customerId: string;
  contextType: string;
  contextId: string;
  pipelineRef?: string;
  message: string;
  mentions: LogMention[];
  references: LogReference[];
  reminder: LogReminder | null;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogQueryParams {
  customerId?: string;
  contextType?: string;
  contextId?: string;
  page?: number;
  limit?: number;
}

export interface LogsResponse {
  data: Log[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateLogInput {
  customerId: string;
  contextType: string;
  contextId: string;
  pipelineRef?: string;
  message: string;
  mentions?: LogMention[];
  references?: LogReference[];
  reminder?: {
    date: string;
    completed?: boolean;
  };
  authorId: string;
  authorName: string;
}

export interface PipelineLogsResponse {
  pipelineRef: string;
  lead: Log[];
  offer: Log[];
  sale: Log[];
}

export interface LogPanelContext {
  customerId: string;
  contextType: string;
  contextId: string;
  title?: string;
}

export interface PipelineLogPanelContext {
  pipelineRef: string;
  customerId?: string;
  title?: string;
  // Hangi entity'den açıldığını belirler
  leadId?: string;
  offerId?: string;
  saleId?: string;
}

// ─── Entity Log Panel Types ─────────────────────────────────────

/** 7 tab tipi - Kontrat, Lisans, Fatura, Ödeme Planı + 3 placeholder */
export type EntityTabType =
  | "contract"
  | "license"
  | "invoice"
  | "payment-plan"
  | "collection" // Tahsilat - sonra yapılacak
  | "e-transform" // E-Dönüşüm - sonra yapılacak
  | "technical"; // Teknik - sonra yapılacak

/** Tab konfigürasyonu */
export interface EntityTabConfig {
  type: EntityTabType;
  label: string;
  icon: string; // lucide icon adı
  enabled: boolean; // false ise placeholder gösterilir
}

/** Entity Log Panel context - tab'lar için gerekli ID'ler */
export interface EntityLogPanelContext {
  customerId: string;
  title?: string;
  // Aktif tab'ı belirleyen entity
  activeTab: EntityTabType;
  // Entity ID'leri
  contractId?: string;
  licenseId?: string;
  invoiceId?: string;
  paymentPlanId?: string;
  // Sonra eklenecek ID'ler (placeholder tab'lar için)
  collectionId?: string;
  eTransformId?: string;
  technicalId?: string;
}
