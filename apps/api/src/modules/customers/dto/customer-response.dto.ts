export class CustomerAddressDto {
  address: string;
  cityId: number;
  city: string;
  townId: number;
  town: string;
  districtId: number;
  district: string;
  countryId: string;
  country: string;
}

export class CustomerResponseDto {
  _id: string;
  type: string;
  id: string;
  erpId: string;
  taxNo: string;
  name: string;
  companyName: string;
  address: CustomerAddressDto;
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
