/** ERP mapping için minimal tip */
export interface ErpMappingMinimal {
  companyId: string;
  erpId: string;
  isPrimary?: boolean;
}

/** Müşteri lookup için gereken minimal alanlar */
export interface CustomerLookupItem {
  _id: string;
  id: string;
  name?: string;
  companyName?: string;
  erpId?: string;
  erpMappings?: ErpMappingMinimal[];
  taxNo?: string;
  brand?: string;
  phone?: string;
}

/** Lisans lookup için gereken minimal alanlar */
export interface LicenseLookupItem {
  _id: string;
  id: string;
  brandName?: string;
  SearchItem?: string;
  customerId?: string;
  customerName?: string;
}

/** Lookup API response formatı (backend paginated response ile uyumlu) */
export interface LookupResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
