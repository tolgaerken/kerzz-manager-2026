export type SaleStatus = "pending" | "collection-waiting" | "setup-waiting" | "training-waiting" | "active" | "completed" | "cancelled";

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
  usdRate: number;
  eurRate: number;
  status: SaleStatus;
  approved: boolean;
  approvedBy: string;
  approvedByName: string;
  approvedAt: string;
  labels: string[];
  notes: string;
  internalFirm: string;
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
