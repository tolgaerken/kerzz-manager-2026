import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/apiClient";
import type {
  EmployeeProfile,
  EnrichedEmployeeProfile,
  PaginatedEmployeeProfileResponse,
  EmployeeProfileQueryParams,
  CreateEmployeeProfileFormData,
  UpdateEmployeeProfileFormData,
  UpdateSelfProfileFormData,
  EmployeeProfileStats,
  BulkCreateResult,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";
const ENDPOINT = `${API_BASE_URL}/employee-profiles`;

/**
 * Query parametrelerini URL query string'e dönüştür
 */
function buildQueryString(params?: EmployeeProfileQueryParams): string {
  if (!params) return "";

  const queryParams = new URLSearchParams();

  if (params.page) queryParams.set("page", String(params.page));
  if (params.limit) queryParams.set("limit", String(params.limit));
  if (params.search) queryParams.set("search", params.search);
  if (params.departmentCode) queryParams.set("departmentCode", params.departmentCode);
  if (params.titleCode) queryParams.set("titleCode", params.titleCode);
  if (params.managerUserId) queryParams.set("managerUserId", params.managerUserId);
  if (params.location) queryParams.set("location", params.location);
  if (params.employmentStatus) queryParams.set("employmentStatus", params.employmentStatus);
  if (params.workType) queryParams.set("workType", params.workType);
  if (params.contractType) queryParams.set("contractType", params.contractType);
  if (params.sortField) queryParams.set("sortField", params.sortField);
  if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);

  return queryParams.toString();
}

/**
 * Çalışan profilleri API
 */
export const employeeProfileApi = {
  /**
   * Tüm profilleri listele (sayfalanmış)
   */
  list: (params?: EmployeeProfileQueryParams): Promise<PaginatedEmployeeProfileResponse> => {
    const queryString = buildQueryString(params);
    return apiGet<PaginatedEmployeeProfileResponse>(
      `${ENDPOINT}${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * Kullanıcı ID'sine göre profil getir
   */
  getByUserId: (userId: string): Promise<EnrichedEmployeeProfile | null> => {
    return apiGet<EnrichedEmployeeProfile | null>(`${ENDPOINT}/${encodeURIComponent(userId)}`);
  },

  /**
   * Kendi profilimi getir (self-service)
   */
  getMyProfile: (): Promise<EnrichedEmployeeProfile | null> => {
    return apiGet<EnrichedEmployeeProfile | null>(`${ENDPOINT}/me`);
  },

  /**
   * Yeni profil oluştur (Admin/İK)
   */
  create: (data: CreateEmployeeProfileFormData): Promise<EmployeeProfile> => {
    return apiPost<EmployeeProfile>(ENDPOINT, data);
  },

  /**
   * Profil güncelle (Admin/İK - tam yetki)
   */
  update: (userId: string, data: UpdateEmployeeProfileFormData): Promise<EmployeeProfile> => {
    return apiPatch<EmployeeProfile>(`${ENDPOINT}/${encodeURIComponent(userId)}`, data);
  },

  /**
   * Kendi profilimi güncelle (Self-Service - sınırlı alanlar)
   */
  updateMyProfile: (data: UpdateSelfProfileFormData): Promise<EmployeeProfile> => {
    return apiPatch<EmployeeProfile>(`${ENDPOINT}/me`, data);
  },

  /**
   * Profili soft-delete (terminated durumuna geçir)
   */
  softDelete: (userId: string, terminationReason: string): Promise<EmployeeProfile> => {
    return apiDelete<EmployeeProfile>(`${ENDPOINT}/${encodeURIComponent(userId)}`, {
      body: JSON.stringify({ terminationReason }),
    });
  },

  /**
   * Departmana göre çalışanları getir
   */
  getByDepartment: (departmentCode: string): Promise<EmployeeProfile[]> => {
    return apiGet<EmployeeProfile[]>(
      `${ENDPOINT}/by-department/${encodeURIComponent(departmentCode)}`
    );
  },

  /**
   * Yöneticiye bağlı çalışanları getir
   */
  getByManager: (managerUserId: string): Promise<EmployeeProfile[]> => {
    return apiGet<EmployeeProfile[]>(
      `${ENDPOINT}/by-manager/${encodeURIComponent(managerUserId)}`
    );
  },

  /**
   * İstatistikleri getir
   */
  getStats: (): Promise<EmployeeProfileStats> => {
    return apiGet<EmployeeProfileStats>(`${ENDPOINT}/stats`);
  },

  /**
   * Toplu profil oluştur (backfill için)
   */
  bulkCreate: (userIds: string[]): Promise<BulkCreateResult> => {
    return apiPost<BulkCreateResult>(`${ENDPOINT}/bulk-create`, { userIds });
  },
};

export default employeeProfileApi;
