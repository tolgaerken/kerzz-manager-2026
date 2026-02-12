import { AUTH_CONSTANTS } from "../features/auth/constants/auth.constants";

const { STORAGE_KEYS } = AUTH_CONSTANTS;

// Login sonrası grace period - bu süre içinde 401'lerde logout yapma
const AUTH_GRACE_PERIOD_MS = 5000;
let lastLoginTimestamp: number | null = null;

/**
 * Login timestamp'ini güncelle - login başarılı olduğunda çağrılmalı
 */
export function setLoginTimestamp(): void {
  lastLoginTimestamp = Date.now();
}

/**
 * Grace period içinde miyiz kontrol et
 */
function isWithinGracePeriod(): boolean {
  if (!lastLoginTimestamp) return false;
  return Date.now() - lastLoginTimestamp < AUTH_GRACE_PERIOD_MS;
}

export interface ApiClientOptions extends RequestInit {
  skipAuth?: boolean;
}

export interface ApiError extends Error {
  status: number;
  statusText: string;
}

/**
 * Get authentication headers from stored user info
 */
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    console.log("[apiClient] Stored data:", storedData ? "exists" : "null");
    
    if (storedData) {
      const parsed = JSON.parse(storedData);
      const token = parsed?.token;
      
      console.log("[apiClient] Token exists:", !!token);
      console.log("[apiClient] AccessToken exists:", !!token?.accessToken);

      if (token?.accessToken) {
        headers["Authorization"] = `Bearer ${token.accessToken}`;
        console.log("[apiClient] Authorization header set");
      }
      if (token?.id) {
        headers["x-user-id"] = token.id;
      }
      if (token?.name) {
        // HTTP header'ları ISO-8859-1 karakter setini destekler
        // Türkçe karakterler için encodeURIComponent kullanıyoruz
        headers["x-user-name"] = encodeURIComponent(token.name);
      }
    }
  } catch (err) {
    console.error("[apiClient] Error getting auth headers:", err);
  }

  return headers;
}

/**
 * Handle 401 Unauthorized response - logout and redirect
 * Grace period içindeyse logout yapmaz (login sonrası geçici 401'leri önlemek için)
 */
function handleUnauthorized(): void {
  // Grace period içindeyse logout yapma
  if (isWithinGracePeriod()) {
    console.warn("[apiClient] 401 received but within grace period, skipping logout");
    return;
  }

  // Clear auth data
  localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_LICANCE);

  // Redirect to login
  if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
}

/**
 * Create an API error from response
 */
async function createApiError(response: Response): Promise<ApiError> {
  let message = "Sunucu Hatası";

  try {
    const data = await response.json();
    message = data.message || data.error || message;
  } catch {
    // Use default message
  }

  const error = new Error(message) as ApiError;
  error.status = response.status;
  error.statusText = response.statusText;
  return error;
}

/**
 * Centralized API client with authentication
 *
 * Features:
 * - Automatically adds Authorization header with Bearer token
 * - Adds x-user-id and x-user-name headers for audit logging
 * - Handles 401 responses by logging out and redirecting to login
 * - Provides consistent error handling
 */
export async function apiClient<T>(url: string, options: ApiClientOptions = {}): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...restOptions } = options;

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(!skipAuth ? getAuthHeaders() : {}),
    ...(customHeaders as Record<string, string>)
  };

  // Make request
  const response = await fetch(url, {
    ...restOptions,
    headers
  });

  // Handle 401 Unauthorized
  if (response.status === 401 && !skipAuth) {
    handleUnauthorized();
    throw await createApiError(response);
  }

  // Handle other errors
  if (!response.ok) {
    throw await createApiError(response);
  }

  // Handle empty responses
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return {} as T;
  }

  return response.json();
}

/**
 * GET request helper
 */
export async function apiGet<T>(url: string, options: ApiClientOptions = {}): Promise<T> {
  return apiClient<T>(url, { ...options, method: "GET" });
}

/**
 * POST request helper
 */
export async function apiPost<T>(
  url: string,
  data?: unknown,
  options: ApiClientOptions = {}
): Promise<T> {
  return apiClient<T>(url, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T>(
  url: string,
  data?: unknown,
  options: ApiClientOptions = {}
): Promise<T> {
  return apiClient<T>(url, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined
  });
}

/**
 * PATCH request helper
 */
export async function apiPatch<T>(
  url: string,
  data?: unknown,
  options: ApiClientOptions = {}
): Promise<T> {
  return apiClient<T>(url, {
    ...options,
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(url: string, options: ApiClientOptions = {}): Promise<T> {
  return apiClient<T>(url, { ...options, method: "DELETE" });
}

export default apiClient;
