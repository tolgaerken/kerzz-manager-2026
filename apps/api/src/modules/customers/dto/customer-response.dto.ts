export class CustomerResponseDto {
  _id: string;
  id: string;
  erpId: string;
  taxNo: string;
  name: string;
  companyName: string;
  address: string;
  city: string;
  district: string;
  phone: string;
  email: string;
  taxOffice: string;
  enabled: boolean;
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

export class PaginatedCustomersResponseDto {
  data: CustomerResponseDto[];
  meta: PaginationMetaDto;
}
