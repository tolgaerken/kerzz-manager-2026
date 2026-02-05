export type ContractFlow = "active" | "archive" | "future" | "all";

export interface Contract {
  _id: string;
  id: string;
  brand: string;
  company: string;
  contractFlow: string;
  contractId: string;
  description: string;
  startDate: string;
  endDate: string;
  yearly: boolean;
  yearlyTotal: number;
  saasTotal: number;
  total: number;
  enabled: boolean;
  blockedLicance: boolean;
  no: number;
  customerId: string;
  internalFirm: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractQueryParams {
  page?: number;
  limit?: number;
  flow?: ContractFlow;
  yearly?: boolean;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface ContractCounts {
  active: number;
  archive: number;
  future: number;
  yearly: number;
  monthly: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ContractsResponse {
  data: Contract[];
  meta: PaginationMeta;
  counts: ContractCounts;
}
