import type { AddressData } from "../../locations/types";

export type CustomerType = "prospect" | "customer";

export interface Customer {
  _id: string;
  type: CustomerType;
  id: string;
  erpId: string;
  taxNo: string;
  name: string;
  brand: string;
  address: AddressData;
  phone: string;
  email: string;
  taxOffice: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: CustomerType | "all";
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
  type?: CustomerType;
  taxNo?: string;
  name?: string;
  brand?: string;
  address?: AddressData;
  phone?: string;
  email?: string;
  taxOffice?: string;
  enabled?: boolean;
}

export interface UpdateCustomerInput {
  type?: CustomerType;
  taxNo?: string;
  name?: string;
  brand?: string;
  address?: AddressData;
  phone?: string;
  email?: string;
  taxOffice?: string;
  enabled?: boolean;
}
