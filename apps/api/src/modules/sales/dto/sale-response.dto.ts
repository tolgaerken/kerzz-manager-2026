export class SaleResponseDto {
  _id: string;
  no: number;
  pipelineRef: string;
  offerId: string;
  leadId: string;
  customerId: string;
  customerName: string;
  saleDate: Date;
  implementDate: Date;
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
  status: string;
  approved: boolean;
  approvedBy: string;
  approvedByName: string;
  approvedAt: Date;
  labels: string[];
  notes: string;
  internalFirm: string;
  // Populated alt koleksiyonlar
  products?: any[];
  licenses?: any[];
  rentals?: any[];
  payments?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export class PaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class PaginatedSalesResponseDto {
  data: SaleResponseDto[];
  meta: PaginationMetaDto;
}

export class SaleStatsDto {
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
  topSales?: SaleResponseDto[];
}
