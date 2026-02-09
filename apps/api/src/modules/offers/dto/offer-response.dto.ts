export class OfferConversionInfoDto {
  saleId: string;
  converted: boolean;
  convertedBy: string;
  convertedByName: string;
  convertedAt: Date;
}

export class OfferLossInfoDto {
  reason: string;
  competitor?: string;
  notes?: string;
  lostAt?: Date;
  lostBy?: string;
}

export class OfferStageHistoryDto {
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  changedAt: Date;
  durationInStage: number;
}

export class OfferResponseDto {
  _id: string;
  no: number;
  pipelineRef: string;
  leadId: string;
  customerId: string;
  customerName: string;
  saleDate: Date;
  validUntil: Date;
  sellerId: string;
  sellerName: string;
  totals: Record<string, any>;
  usdRate: number;
  eurRate: number;
  status: string;
  conversionInfo: OfferConversionInfoDto;
  lossInfo: OfferLossInfoDto;
  stageHistory: OfferStageHistoryDto[];
  offerNote: string;
  mailList: { email: string; name: string }[];
  labels: string[];
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

export class PaginatedOffersResponseDto {
  data: OfferResponseDto[];
  meta: PaginationMetaDto;
}
