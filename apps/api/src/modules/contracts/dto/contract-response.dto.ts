export interface ContractResponseDto {
  _id: string;
  id: string;
  brand: string;
  company: string;
  contractFlow: string;
  contractId: string;
  description: string;
  startDate: Date;
  endDate: Date;
  yearly: boolean;
  yearlyTotal: number;
  saasTotal: number;
  total: number;
  enabled: boolean;
  blockedLicance: boolean;
  isFree: boolean;
  isActive: boolean;
  no: number;
  customerId: string;
  internalFirm: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedContractsResponseDto {
  data: ContractResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  counts: {
    active: number;
    archive: number;
    future: number;
    free: number;
    yearly: number;
    monthly: number;
  };
}
