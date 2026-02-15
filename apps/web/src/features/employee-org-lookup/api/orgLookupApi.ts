import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/apiClient";
import type {
  OrgDepartment,
  OrgTitle,
  OrgLocation,
  PaginatedOrgDepartmentResponse,
  PaginatedOrgTitleResponse,
  PaginatedOrgLocationResponse,
  OrgLookupQueryParams,
  CreateOrgDepartmentDto,
  CreateOrgTitleDto,
  CreateOrgLocationDto,
  UpdateOrgDepartmentDto,
  UpdateOrgTitleDto,
  UpdateOrgLocationDto,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

function buildQueryString(params?: OrgLookupQueryParams): string {
  if (!params) return "";

  const queryParams = new URLSearchParams();

  if (params.page) queryParams.set("page", String(params.page));
  if (params.limit) queryParams.set("limit", String(params.limit));
  if (params.search) queryParams.set("search", params.search);
  if (params.isActive !== undefined) queryParams.set("isActive", String(params.isActive));
  if (params.sortField) queryParams.set("sortField", params.sortField);
  if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);

  return queryParams.toString();
}

// ==================== DEPARTMENTS ====================

const DEPARTMENTS_ENDPOINT = `${API_BASE_URL}/org-lookups/departments`;

export const orgDepartmentApi = {
  list: (params?: OrgLookupQueryParams): Promise<PaginatedOrgDepartmentResponse> => {
    const queryString = buildQueryString(params);
    return apiGet<PaginatedOrgDepartmentResponse>(
      `${DEPARTMENTS_ENDPOINT}${queryString ? `?${queryString}` : ""}`
    );
  },

  listActive: (): Promise<OrgDepartment[]> => {
    return apiGet<OrgDepartment[]>(`${DEPARTMENTS_ENDPOINT}/active`);
  },

  getById: (id: string): Promise<OrgDepartment> => {
    return apiGet<OrgDepartment>(`${DEPARTMENTS_ENDPOINT}/${encodeURIComponent(id)}`);
  },

  create: (data: CreateOrgDepartmentDto): Promise<OrgDepartment> => {
    return apiPost<OrgDepartment>(DEPARTMENTS_ENDPOINT, data);
  },

  update: (id: string, data: UpdateOrgDepartmentDto): Promise<OrgDepartment> => {
    return apiPatch<OrgDepartment>(
      `${DEPARTMENTS_ENDPOINT}/${encodeURIComponent(id)}`,
      data
    );
  },

  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`${DEPARTMENTS_ENDPOINT}/${encodeURIComponent(id)}`);
  },
};

// ==================== TITLES ====================

const TITLES_ENDPOINT = `${API_BASE_URL}/org-lookups/titles`;

export const orgTitleApi = {
  list: (params?: OrgLookupQueryParams): Promise<PaginatedOrgTitleResponse> => {
    const queryString = buildQueryString(params);
    return apiGet<PaginatedOrgTitleResponse>(
      `${TITLES_ENDPOINT}${queryString ? `?${queryString}` : ""}`
    );
  },

  listActive: (): Promise<OrgTitle[]> => {
    return apiGet<OrgTitle[]>(`${TITLES_ENDPOINT}/active`);
  },

  getById: (id: string): Promise<OrgTitle> => {
    return apiGet<OrgTitle>(`${TITLES_ENDPOINT}/${encodeURIComponent(id)}`);
  },

  create: (data: CreateOrgTitleDto): Promise<OrgTitle> => {
    return apiPost<OrgTitle>(TITLES_ENDPOINT, data);
  },

  update: (id: string, data: UpdateOrgTitleDto): Promise<OrgTitle> => {
    return apiPatch<OrgTitle>(`${TITLES_ENDPOINT}/${encodeURIComponent(id)}`, data);
  },

  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`${TITLES_ENDPOINT}/${encodeURIComponent(id)}`);
  },
};

// ==================== LOCATIONS ====================

const LOCATIONS_ENDPOINT = `${API_BASE_URL}/org-lookups/locations`;

export const orgLocationApi = {
  list: (params?: OrgLookupQueryParams): Promise<PaginatedOrgLocationResponse> => {
    const queryString = buildQueryString(params);
    return apiGet<PaginatedOrgLocationResponse>(
      `${LOCATIONS_ENDPOINT}${queryString ? `?${queryString}` : ""}`
    );
  },

  listActive: (): Promise<OrgLocation[]> => {
    return apiGet<OrgLocation[]>(`${LOCATIONS_ENDPOINT}/active`);
  },

  getById: (id: string): Promise<OrgLocation> => {
    return apiGet<OrgLocation>(`${LOCATIONS_ENDPOINT}/${encodeURIComponent(id)}`);
  },

  create: (data: CreateOrgLocationDto): Promise<OrgLocation> => {
    return apiPost<OrgLocation>(LOCATIONS_ENDPOINT, data);
  },

  update: (id: string, data: UpdateOrgLocationDto): Promise<OrgLocation> => {
    return apiPatch<OrgLocation>(`${LOCATIONS_ENDPOINT}/${encodeURIComponent(id)}`, data);
  },

  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`${LOCATIONS_ENDPOINT}/${encodeURIComponent(id)}`);
  },
};
