// Donanım ürünü ana tipi
export interface HardwareProduct {
  _id: string;
  id: string;
  name: string;
  friendlyName: string;
  description: string;
  erpId: string;
  purchasePrice: number;
  salePrice: number;
  vatRate: number;
  currency: string;
  purchaseCurrency: string;
  saleCurrency: string;
  saleActive: boolean;
  unit: string;
  editDate?: string;
  editUser?: string;
  updaterId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Query parametreleri
export interface HardwareProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  saleActive?: boolean;
  currency?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

// Sayfa bilgisi
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Sayım bilgisi
export interface HardwareProductCounts {
  total: number;
  active: number;
  inactive: number;
}

// API response
export interface HardwareProductsResponse {
  data: HardwareProduct[];
  pagination: PaginationInfo;
  counts?: HardwareProductCounts;
}

// Form için input tipleri
export interface CreateHardwareProductInput {
  id: string;
  name: string;
  friendlyName?: string;
  description?: string;
  erpId?: string;
  purchasePrice?: number;
  salePrice?: number;
  vatRate?: number;
  currency?: string;
  purchaseCurrency?: string;
  saleCurrency?: string;
  saleActive?: boolean;
  unit?: string;
}

export interface UpdateHardwareProductInput extends Partial<CreateHardwareProductInput> {}
