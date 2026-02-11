import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/apiClient";
import { SOFTWARE_PRODUCTS_CONSTANTS } from "../constants/software-products.constants";
import type {
  SoftwareProductQueryParams,
  SoftwareProductsResponse,
  SoftwareProduct,
  CreateSoftwareProductInput,
  UpdateSoftwareProductInput
} from "../types";

const { API_BASE_URL, ENDPOINTS } = SOFTWARE_PRODUCTS_CONSTANTS;

function buildQueryString(params: SoftwareProductQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.saleActive !== undefined) searchParams.set("saleActive", params.saleActive.toString());
  if (params.isSaas !== undefined) searchParams.set("isSaas", params.isSaas.toString());
  if (params.type) searchParams.set("type", params.type);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

// Yazılım ürünlerini getir
export async function fetchSoftwareProducts(params: SoftwareProductQueryParams = {}): Promise<SoftwareProductsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.SOFTWARE_PRODUCTS}${queryString ? `?${queryString}` : ""}`;

  return apiGet<SoftwareProductsResponse>(url);
}

// Tek yazılım ürünü getir
export async function fetchSoftwareProductById(id: string): Promise<SoftwareProduct> {
  const url = `${API_BASE_URL}${ENDPOINTS.SOFTWARE_PRODUCTS}/${id}`;

  return apiGet<SoftwareProduct>(url);
}

// Yeni yazılım ürünü oluştur
export async function createSoftwareProduct(data: CreateSoftwareProductInput): Promise<SoftwareProduct> {
  const url = `${API_BASE_URL}${ENDPOINTS.SOFTWARE_PRODUCTS}`;

  return apiPost<SoftwareProduct>(url, data);
}

// Yazılım ürünü güncelle
export async function updateSoftwareProduct(id: string, data: UpdateSoftwareProductInput): Promise<SoftwareProduct> {
  const url = `${API_BASE_URL}${ENDPOINTS.SOFTWARE_PRODUCTS}/${id}`;

  return apiPatch<SoftwareProduct>(url, data);
}

// Yazılım ürünü sil
export async function deleteSoftwareProduct(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.SOFTWARE_PRODUCTS}/${id}`;

  return apiDelete<void>(url);
}
