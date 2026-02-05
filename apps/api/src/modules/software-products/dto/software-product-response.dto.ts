export interface SoftwareProductResponseDto {
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
  editDate?: Date;
  editUser?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginatedSoftwareProductsResponseDto {
  data: SoftwareProductResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts?: SoftwareProductCountsDto;
}

export interface SoftwareProductCountsDto {
  total: number;
  active: number;
  inactive: number;
  saas: number;
  nonSaas: number;
}
