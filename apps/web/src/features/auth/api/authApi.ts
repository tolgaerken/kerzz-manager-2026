import { apiGet } from "../../../lib/apiClient";
import { AUTH_CONSTANTS } from "../constants/auth.constants";
import type {
  LoginCredentials,
  LoginResponse,
  OtpRequest,
  OtpVerify,
  UserInfo,
  AuthMeResponse
} from "../types/auth.types";

const { SSO_BASE_URL, SSO_API_KEY, ENDPOINTS, STORAGE_KEYS } = AUTH_CONSTANTS;

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

function getHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    apiKey: SSO_API_KEY
  };

  if (accessToken) {
    headers["x-user-token"] = accessToken;
    headers["x-api-key"] = SSO_API_KEY;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Server Error" }));
    throw new Error(error.message || "Server Error");
  }
  return response.json();
}

export async function loginWithCredentials(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${SSO_BASE_URL}${ENDPOINTS.LOGIN}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(credentials)
  });

  return handleResponse<LoginResponse>(response);
}

export async function requestOtp(data: OtpRequest): Promise<{ message: "ok" | "new" }> {
  const response = await fetch(`${SSO_BASE_URL}${ENDPOINTS.REQUEST_OTP}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  return handleResponse<{ message: "ok" | "new" }>(response);
}

export async function verifyOtp(data: OtpVerify): Promise<UserInfo> {
  const response = await fetch(`${SSO_BASE_URL}${ENDPOINTS.VERIFY_OTP}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  return handleResponse<UserInfo>(response);
}

export async function autoLoginWithToken(token: string): Promise<UserInfo> {
  const response = await fetch(`${SSO_BASE_URL}${ENDPOINTS.AUTO_LOGIN}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ token })
  });

  return handleResponse<UserInfo>(response);
}

export async function resetPassword(email: string): Promise<void> {
  const response = await fetch(`${SSO_BASE_URL}${ENDPOINTS.RESET_PASSWORD}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email })
  });

  await handleResponse<void>(response);
}

/**
 * Get current user profile with permissions from backend
 * This fetches user data and permissions from sso-db via our backend
 * Note: We don't want 401 to trigger logout here since this is called right after login
 * @param accessToken - Optional token to use directly (for immediate post-login calls)
 */
export async function getMe(accessToken?: string): Promise<AuthMeResponse> {
  let token = accessToken;
  
  // If no token provided, try to get from localStorage
  if (!token) {
    const storedData = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      token = parsed?.token?.accessToken;
    }
  }
  
  if (!token) {
    throw new Error("No access token found");
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Server Error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Verify token validity via backend
 */
export async function verifyToken(
  token: string
): Promise<{ valid: boolean; user?: { id: string; name: string; email: string } }> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ token })
  });

  return handleResponse<{ valid: boolean; user?: { id: string; name: string; email: string } }>(
    response
  );
}
