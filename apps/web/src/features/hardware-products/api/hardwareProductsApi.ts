import { HARDWARE_PRODUCTS_CONSTANTS } from "../constants/hardware-products.constants";
import type {
  HardwareProductQueryParams,
  HardwareProductsResponse,
  HardwareProduct,
  CreateHardwareProductInput,
  UpdateHardwareProductInput
} from "../types";

const { API_BASE_URL, ENDPOINTS } = HARDWARE_PRODUCTS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

function buildQueryString(params: HardwareProductQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.saleActive !== undefined) searchParams.set("saleActive", params.saleActive.toString());
  if (params.currency) searchParams.set("currency", params.currency);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

// Donanım ürünlerini getir
export async function fetchHardwareProducts(params: HardwareProductQueryParams = {}): Promise<HardwareProductsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.HARDWARE_PRODUCTS}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  return handleResponse<HardwareProductsResponse>(response);
}

// Tek donanım ürünü getir
export async function fetchHardwareProductById(id: string): Promise<HardwareProduct> {
  const url = `${API_BASE_URL}${ENDPOINTS.HARDWARE_PRODUCTS}/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  return handleResponse<HardwareProduct>(response);
}

// Yeni donanım ürünü oluştur
export async function createHardwareProduct(data: CreateHardwareProductInput): Promise<HardwareProduct> {
  const url = `${API_BASE_URL}${ENDPOINTS.HARDWARE_PRODUCTS}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(data)
  });

  return handleResponse<HardwareProduct>(response);
}

// Donanım ürünü güncelle
export async function updateHardwareProduct(id: string, data: UpdateHardwareProductInput): Promise<HardwareProduct> {
  const url = `${API_BASE_URL}${ENDPOINTS.HARDWARE_PRODUCTS}/${id}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(data)
  });

  return handleResponse<HardwareProduct>(response);
}

// Donanım ürünü sil
export async function deleteHardwareProduct(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.HARDWARE_PRODUCTS}/${id}`;

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
