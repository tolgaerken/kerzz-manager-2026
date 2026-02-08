import { SALES_CONSTANTS } from "../constants/sales.constants";
import type {
  Sale,
  SalesResponse,
  SaleQueryParams,
  SaleStats,
  CreateSaleInput,
  UpdateSaleInput,
} from "../types/sale.types";

const { API_BASE_URL, ENDPOINTS } = SALES_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(
      (error as { message?: string }).message || "Sunucu Hatası"
    );
  }
  return response.json();
}

function buildQueryString(params: SaleQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.status && params.status !== "all") searchParams.set("status", params.status);
  if (params.customerId) searchParams.set("customerId", params.customerId);
  if (params.sellerId) searchParams.set("sellerId", params.sellerId);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  if (params.period) searchParams.set("period", params.period);

  return searchParams.toString();
}

export async function fetchSales(
  params: SaleQueryParams = {}
): Promise<SalesResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<SalesResponse>(response);
}

export async function fetchSaleById(id: string): Promise<Sale> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/${encodeURIComponent(id)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<Sale>(response);
}

export async function createSale(input: CreateSaleInput): Promise<Sale> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<Sale>(response);
}

export async function updateSale(
  id: string,
  input: UpdateSaleInput
): Promise<Sale> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/${encodeURIComponent(id)}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<Sale>(response);
}

export async function deleteSale(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/${encodeURIComponent(id)}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok && response.status !== 204) {
    const error = await response
      .json()
      .catch(() => ({ message: "Silme hatası" }));
    throw new Error(
      (error as { message?: string }).message || "Silme hatası"
    );
  }
}

export async function calculateSaleTotals(id: string): Promise<Sale> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/${encodeURIComponent(id)}/calculate`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<Sale>(response);
}

export async function approveSale(
  id: string,
  userId: string,
  userName: string
): Promise<Sale> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/${encodeURIComponent(id)}/approve`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ userId, userName }),
  });

  return handleResponse<Sale>(response);
}

export async function revertSale(id: string): Promise<Sale> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/${encodeURIComponent(id)}/revert`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<Sale>(response);
}

export async function fetchSaleStats(
  params: SaleQueryParams = {}
): Promise<SaleStats> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/stats${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<SaleStats>(response);
}
