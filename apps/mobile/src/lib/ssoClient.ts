/**
 * SSO API client for authentication
 */

import { config } from "../config/env";
import type {
  LoginCredentials,
  OtpRequest,
  OtpVerify,
  UserInfo,
} from "@kerzz/shared";
import { AUTH_ENDPOINTS } from "@kerzz/shared";

interface SsoResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

function normalizeGsm(gsm: string): string {
  const digits = gsm.replace(/\D/g, "");

  // Already in +90XXXXXXXXXX style (digits: 90 + 10)
  if (digits.startsWith("90") && digits.length === 12) {
    return `+${digits}`;
  }

  // Local TR number with leading 0 (0XXXXXXXXXX)
  if (digits.startsWith("0") && digits.length === 11) {
    return `+90${digits.slice(1)}`;
  }

  // Local TR number without leading 0 (XXXXXXXXXX)
  if (digits.length === 10) {
    return `+90${digits}`;
  }

  // Fallback: keep country-like format if provided
  return gsm.startsWith("+") ? gsm : `+${digits}`;
}

async function ssoRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<SsoResponse<T>> {
  const url = `${config.ssoBaseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-api-key": config.ssoApiKey,
    apiKey: config.ssoApiKey,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new SsoError(
      data.message || `SSO error ${response.status}`,
      response.status,
      data
    );
  }

  return data;
}

export class SsoError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "SsoError";
  }
}

export const ssoClient = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<UserInfo> => {
    const response = await ssoRequest<UserInfo>(AUTH_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (!response.data) {
      throw new SsoError("Login failed: No user data returned", 401);
    }

    return response.data;
  },

  /**
   * Request OTP code via SMS
   */
  requestOtp: async (request: OtpRequest): Promise<void> => {
    const normalizedRequest: OtpRequest = {
      gsm: normalizeGsm(request.gsm),
    };

    await ssoRequest(AUTH_ENDPOINTS.REQUEST_OTP, {
      method: "POST",
      body: JSON.stringify(normalizedRequest),
    });
  },

  /**
   * Verify OTP code
   */
  verifyOtp: async (request: OtpVerify): Promise<UserInfo> => {
    const normalizedRequest: OtpVerify = {
      ...request,
      gsm: normalizeGsm(request.gsm),
    };

    const response = await ssoRequest<UserInfo>(AUTH_ENDPOINTS.VERIFY_OTP, {
      method: "POST",
      body: JSON.stringify(normalizedRequest),
    });

    if (!response.data) {
      throw new SsoError("OTP verification failed: No user data returned", 401);
    }

    return response.data;
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string): Promise<void> => {
    await ssoRequest(AUTH_ENDPOINTS.RESET_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
};
