export interface HardwareProductResponseDto {
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
  editDate?: Date;
  editUser?: string;
  updaterId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginatedHardwareProductsResponseDto {
  data: HardwareProductResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts?: HardwareProductCountsDto;
}

export interface HardwareProductCountsDto {
  total: number;
  active: number;
  inactive: number;
}
