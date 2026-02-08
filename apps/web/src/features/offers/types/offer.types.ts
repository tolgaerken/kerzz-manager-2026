export type OfferStatus = "draft" | "sent" | "revised" | "waiting" | "approved" | "rejected" | "won" | "lost" | "converted";

export interface OfferConversionInfo {
  saleId: string;
  converted: boolean;
  convertedBy: string;
  convertedByName: string;
  convertedAt: string;
}

export interface Offer {
  _id: string;
  no: number;
  pipelineRef: string;
  leadId: string;
  customerId: string;
  customerName: string;
  saleDate: string;
  validUntil: string;
  sellerId: string;
  sellerName: string;
  totals: Record<string, any>;
  usdRate: number;
  eurRate: number;
  status: OfferStatus;
  conversionInfo: OfferConversionInfo;
  offerNote: string;
  mailList: { email: string; name: string }[];
  labels: string[];
  internalFirm: string;
  products?: any[];
  licenses?: any[];
  rentals?: any[];
  payments?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface OfferQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OfferStatus | "all";
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

export interface OffersResponse {
  data: Offer[];
  meta: PaginationMeta;
}

export interface CreateOfferInput {
  pipelineRef?: string;
  leadId?: string;
  customerId: string;
  customerName?: string;
  saleDate?: string;
  validUntil?: string;
  sellerId?: string;
  sellerName?: string;
  usdRate?: number;
  eurRate?: number;
  status?: OfferStatus;
  offerNote?: string;
  mailList?: { email: string; name: string }[];
  labels?: string[];
  internalFirm?: string;
  products?: Partial<import("../../pipeline").PipelineProduct>[];
  licenses?: Partial<import("../../pipeline").PipelineLicense>[];
  rentals?: Partial<import("../../pipeline").PipelineRental>[];
  payments?: Partial<import("../../pipeline").PipelinePayment>[];
}

export interface UpdateOfferInput extends Partial<CreateOfferInput> {}
