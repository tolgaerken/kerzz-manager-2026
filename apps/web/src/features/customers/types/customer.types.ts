export interface Customer {
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
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
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

export interface CustomersResponse {
  data: Customer[];
  meta: PaginationMeta;
}

export interface CreateCustomerInput {
  taxNo: string;
  name?: string;
  companyName?: string;
  address?: string;
  city?: string;
  district?: string;
  phone?: string;
  email?: string;
  enabled?: boolean;
}

export interface UpdateCustomerInput {
  taxNo?: string;
  name?: string;
  companyName?: string;
  address?: string;
  city?: string;
  district?: string;
  phone?: string;
  email?: string;
  enabled?: boolean;
}
