// Yazılım ürünü ana tipi
export interface SoftwareProduct {
  _id: string;
  id: string;
  name: string;
  friendlyName: string;
  description: string;
  erpId: string;
  pid: string;
  purchasePrice: number;
  salePrice: number;
  vatRate: number;
  currency: string;
  type: string;
  isSaas: boolean;
  saleActive: boolean;
  unit: string;
  nameWithCode: string;
  editDate?: string;
  editUser?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Query parametreleri
export interface SoftwareProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  saleActive?: boolean;
  isSaas?: boolean;
  type?: string;
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
export interface SoftwareProductCounts {
  total: number;
  active: number;
  inactive: number;
  saas: number;
  nonSaas: number;
}

// API response
export interface SoftwareProductsResponse {
  data: SoftwareProduct[];
  pagination: PaginationInfo;
  counts?: SoftwareProductCounts;
}

// Form için input tipleri
export interface CreateSoftwareProductInput {
  id: string;
  name: string;
  friendlyName?: string;
  description?: string;
  erpId?: string;
  pid?: string;
  purchasePrice?: number;
  salePrice?: number;
  vatRate?: number;
  currency?: string;
  type?: string;
  isSaas?: boolean;
  saleActive?: boolean;
  unit?: string;
}

export interface UpdateSoftwareProductInput extends Partial<CreateSoftwareProductInput> {}
