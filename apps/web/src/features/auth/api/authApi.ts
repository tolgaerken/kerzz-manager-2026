import { AUTH_CONSTANTS } from "../constants/auth.constants";
import type { LoginCredentials, LoginResponse, OtpRequest, OtpVerify, UserInfo } from "../types/auth.types";

const { SSO_BASE_URL, SSO_API_KEY, ENDPOINTS } = AUTH_CONSTANTS;

function getHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    apiKey: SSO_API_KEY,
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
    body: JSON.stringify(credentials),
  });

  return handleResponse<LoginResponse>(response);
}

export async function requestOtp(data: OtpRequest): Promise<{ message: "ok" | "new" }> {
  const response = await fetch(`${SSO_BASE_URL}${ENDPOINTS.REQUEST_OTP}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<{ message: "ok" | "new" }>(response);
}

export async function verifyOtp(data: OtpVerify): Promise<UserInfo> {
  const response = await fetch(`${SSO_BASE_URL}${ENDPOINTS.VERIFY_OTP}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<UserInfo>(response);
}

export async function autoLoginWithToken(token: string): Promise<UserInfo> {
  const response = await fetch(`${SSO_BASE_URL}${ENDPOINTS.AUTO_LOGIN}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ token }),
  });

  return handleResponse<UserInfo>(response);
}

export async function resetPassword(email: string): Promise<void> {
  const response = await fetch(`${SSO_BASE_URL}${ENDPOINTS.RESET_PASSWORD}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });

  await handleResponse<void>(response);
}
