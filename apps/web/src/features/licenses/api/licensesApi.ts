import { LICENSES_CONSTANTS } from "../constants/licenses.constants";
import type {
  LicenseQueryParams,
  LicensesResponse,
  License,
  CreateLicenseInput,
  UpdateLicenseInput
} from "../types";

const { API_BASE_URL, ENDPOINTS } = LICENSES_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

function buildQueryString(params: LicenseQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.type) searchParams.set("type", params.type);
  if (params.companyType) searchParams.set("companyType", params.companyType);
  if (params.category) searchParams.set("category", params.category);
  if (params.active !== undefined) searchParams.set("active", params.active.toString());
  if (params.block !== undefined) searchParams.set("block", params.block.toString());
  if (params.haveContract !== undefined) searchParams.set("haveContract", params.haveContract.toString());
  if (params.customerId) searchParams.set("customerId", params.customerId);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.fields && params.fields.length > 0) searchParams.set("fields", params.fields.join(","));

  return searchParams.toString();
}

// Lisansları getir
export async function fetchLicenses(params: LicenseQueryParams = {}): Promise<LicensesResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.LICENSES}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  return handleResponse<LicensesResponse>(response);
}

// Tek lisans getir
export async function fetchLicenseById(id: string): Promise<License> {
  const url = `${API_BASE_URL}${ENDPOINTS.LICENSES}/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  return handleResponse<License>(response);
}

// Yeni lisans oluştur
export async function createLicense(data: CreateLicenseInput): Promise<License> {
  const url = `${API_BASE_URL}${ENDPOINTS.LICENSES}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(data)
  });

  return handleResponse<License>(response);
}

// Lisans güncelle
export async function updateLicense(id: string, data: UpdateLicenseInput): Promise<License> {
  const url = `${API_BASE_URL}${ENDPOINTS.LICENSES}/${id}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(data)
  });

  return handleResponse<License>(response);
}

// Lisans sil
export async function deleteLicense(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.LICENSES}/${id}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
}
