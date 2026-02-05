import { SYSTEM_LOGS_CONSTANTS } from "../constants/system-logs.constants";
import type { SystemLogQueryParams, SystemLogsResponse, SystemLog } from "../types";

const { API_BASE_URL, ENDPOINTS } = SYSTEM_LOGS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

function buildQueryString(params: SystemLogQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.category) searchParams.set("category", params.category);
  if (params.action) searchParams.set("action", params.action);
  if (params.module) searchParams.set("module", params.module);
  if (params.userId) searchParams.set("userId", params.userId);
  if (params.status) searchParams.set("status", params.status);
  if (params.search) searchParams.set("search", params.search);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

/** Sistem loglarını getir */
export async function fetchSystemLogs(
  params: SystemLogQueryParams = {}
): Promise<SystemLogsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.SYSTEM_LOGS}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<SystemLogsResponse>(response);
}

/** Tek log getir */
export async function fetchSystemLogById(id: string): Promise<SystemLog> {
  const url = `${API_BASE_URL}${ENDPOINTS.SYSTEM_LOGS}/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<SystemLog>(response);
}
