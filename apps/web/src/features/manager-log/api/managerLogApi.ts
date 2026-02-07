import { MANAGER_LOG_CONSTANTS } from "../constants/manager-log.constants";
import type {
  LogQueryParams,
  LogsResponse,
  Log,
  CreateLogInput,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = MANAGER_LOG_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

function buildQueryString(params: LogQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.customerId) searchParams.set("customerId", params.customerId);
  if (params.contextType) searchParams.set("contextType", params.contextType);
  if (params.contextId) searchParams.set("contextId", params.contextId);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return searchParams.toString();
}

// Query key factory
export const managerLogKeys = {
  all: ["manager-logs"] as const,
  lists: () => [...managerLogKeys.all, "list"] as const,
  list: (params: LogQueryParams) => [...managerLogKeys.lists(), params] as const,
  details: () => [...managerLogKeys.all, "detail"] as const,
  detail: (id: string) => [...managerLogKeys.details(), id] as const,
};

// Logları getir
export async function fetchManagerLogs(params: LogQueryParams = {}): Promise<LogsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.LOGS}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<LogsResponse>(response);
}

// Tek log getir
export async function fetchManagerLogById(id: string): Promise<Log> {
  const url = `${API_BASE_URL}${ENDPOINTS.LOGS}/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<Log>(response);
}

// Yeni log oluştur
export async function createManagerLog(data: CreateLogInput): Promise<Log> {
  const url = `${API_BASE_URL}${ENDPOINTS.LOGS}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<Log>(response);
}

// Hatırlatmayı tamamlandı olarak işaretle
export async function markManagerLogReminderCompleted(id: string): Promise<Log> {
  const url = `${API_BASE_URL}${ENDPOINTS.LOGS}/${id}/reminder/complete`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<Log>(response);
}
