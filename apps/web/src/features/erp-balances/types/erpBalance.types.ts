export interface ErpBalance {
  _id: string;
  CariKodu: string;
  CariUnvan: string;
  CariBakiye: number;
  CariVade: number;
  Bugun: number;
  ToplamGecikme: number;
  VadesiGelmemis: number;
  Limiti: number;
  GECIKMEGUN: number;
  GrupKodu: string;
  TcKimlik: string;
  VergiN: string;
  EkAcik1: string;
  internalFirm: string;
  fetchedAt: string;
}

export interface ErpBalanceQueryParams {
  internalFirm?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ErpBalancesResponse {
  data: ErpBalance[];
  meta: PaginationMeta;
}

export interface ErpBalanceStatus {
  lastFetchedAt: string | null;
  totalRecords: number;
  companyCounts: { internalFirm: string; count: number }[];
}

export interface ErpBalanceRefreshResult {
  success: number;
  failed: number;
}
