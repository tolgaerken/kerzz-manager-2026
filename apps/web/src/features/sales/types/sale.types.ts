export type SaleStatus =
  | "pending"
  | "collection-waiting"
  | "setup-waiting"
  | "training-waiting"
  | "active"
  | "completed"
  | "cancelled";

export type ApprovalStatus = "none" | "pending" | "approved" | "rejected";

export interface Sale {
  _id: string;
  no: number;
  pipelineRef: string;
  offerId: string;
  leadId: string;
  customerId: string;
  customerName: string;
  saleDate: string;
  implementDate: string;
  sellerId: string;
  sellerName: string;
  totals: Record<string, any>;
  grandTotal?: number;
  hardwareTotal?: number;
  saasTotal?: number;
  softwareTotal?: number;
  total?: number;
  usdRate: number;
  eurRate: number;
  status: SaleStatus | string | string[];
  approved: boolean;
  approvedBy: string;
  approvedByName: string;
  approvedAt: string;
  // Onay akışı alanları
  approvalStatus: ApprovalStatus;
  approvalRequestedBy: string;
  approvalRequestedByName: string;
  approvalRequestedAt: string;
  approvalNote: string;
  rejectionReason: string;
  labels: string[];
  notes: string;
  internalFirm: string;
  stageHistory?: {
    fromStatus: SaleStatus;
    toStatus: SaleStatus;
    changedBy?: string;
    changedAt: string;
    durationInStage: number;
  }[];
  products?: any[];
  licenses?: any[];
  rentals?: any[];
  payments?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SaleStatus | "all";
  customerId?: string;
  sellerId?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  period?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SalesResponse {
  data: Sale[];
  meta: PaginationMeta;
}

export interface SaleStats {
  total: number;
  pending: number;
  collectionWaiting: number;
  setupWaiting: number;
  trainingWaiting: number;
  active: number;
  completed: number;
  cancelled: number;
  totalSalesAmount?: number;
  hardwareSalesAmount?: number;
  licenseSalesAmount?: number;
  saasSalesAmount?: number;
  topSales?: Sale[];
}

export interface CreateSaleInput {
  pipelineRef?: string;
  offerId?: string;
  leadId?: string;
  customerId: string;
  customerName?: string;
  saleDate?: string;
  implementDate?: string;
  sellerId?: string;
  sellerName?: string;
  usdRate?: number;
  eurRate?: number;
  status?: SaleStatus;
  labels?: string[];
  notes?: string;
  internalFirm?: string;
  products?: Partial<import("../../pipeline").PipelineProduct>[];
  licenses?: Partial<import("../../pipeline").PipelineLicense>[];
  rentals?: Partial<import("../../pipeline").PipelineRental>[];
  payments?: Partial<import("../../pipeline").PipelinePayment>[];
}

export interface UpdateSaleInput extends Partial<CreateSaleInput> {}

// Onay akışı tipleri
export interface ApprovalRequestResult {
  success: boolean;
  updatedCount: number;
  saleIds: string[];
  message: string;
  alreadyPending?: { saleId: string; no: number; status: string }[];
}

export interface ApprovalActionResult {
  success: boolean;
  saleId: string;
  action: "approved" | "rejected";
  message: string;
}
