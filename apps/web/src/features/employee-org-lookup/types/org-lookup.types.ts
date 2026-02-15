/**
 * Organizasyon Departman
 */
export interface OrgDepartment {
  _id: string;
  code: string;
  name: string;
  isActive: boolean;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Organizasyon Ünvan
 */
export interface OrgTitle {
  _id: string;
  code: string;
  name: string;
  isActive: boolean;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Organizasyon Lokasyon
 */
export interface OrgLocation {
  _id: string;
  name: string;
  isActive: boolean;
  address: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagination meta
 */
export interface OrgLookupPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedOrgDepartmentResponse {
  data: OrgDepartment[];
  meta: OrgLookupPaginationMeta;
}

export interface PaginatedOrgTitleResponse {
  data: OrgTitle[];
  meta: OrgLookupPaginationMeta;
}

export interface PaginatedOrgLocationResponse {
  data: OrgLocation[];
  meta: OrgLookupPaginationMeta;
}

/**
 * Query params
 */
export interface OrgLookupQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Create DTOs
 */
export interface CreateOrgDepartmentDto {
  code: string;
  name: string;
  isActive?: boolean;
  description?: string;
  sortOrder?: number;
}

export interface CreateOrgTitleDto {
  code: string;
  name: string;
  isActive?: boolean;
  description?: string;
  sortOrder?: number;
}

export interface CreateOrgLocationDto {
  name: string;
  isActive?: boolean;
  address?: string;
  description?: string;
  sortOrder?: number;
}

/**
 * Update DTOs
 */
export interface UpdateOrgDepartmentDto {
  code?: string;
  name?: string;
  isActive?: boolean;
  description?: string;
  sortOrder?: number;
}

export interface UpdateOrgTitleDto {
  code?: string;
  name?: string;
  isActive?: boolean;
  description?: string;
  sortOrder?: number;
}

export interface UpdateOrgLocationDto {
  name?: string;
  isActive?: boolean;
  address?: string;
  description?: string;
  sortOrder?: number;
}

/**
 * Lookup item type (generic)
 */
export type OrgLookupType = "department" | "title" | "location";

export type OrgLookupItem = OrgDepartment | OrgTitle | OrgLocation;
