export class ErpBalanceResponseDto {
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
  fetchedAt: Date;
}

export class PaginatedErpBalanceResponseDto {
  data: ErpBalanceResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class ErpBalanceStatusResponseDto {
  lastFetchedAt: Date | null;
  totalRecords: number;
  companyCounts: { internalFirm: string; count: number }[];
}
