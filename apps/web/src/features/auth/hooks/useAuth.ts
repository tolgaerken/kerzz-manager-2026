import { useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import * as authApi from "../api/authApi";
import { AUTH_CONSTANTS } from "../constants/auth.constants";
import type { UserInfo } from "../types/auth.types";

const { STORAGE_KEYS } = AUTH_CONSTANTS;

export function useAuth() {
  const {
    userInfo,
    authStatus,
    activeLicance,
    isAdmin,
    isFinance,
    isManager,
    isLoading,
    error,
    setUserInfo,
    setActiveLicance,
    setLoading,
    setError,
    logout,
  } = useAuthStore();

  const getStoredToken = useCallback((): string | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed?.token?.accessToken ?? null;
    } catch {
      return null;
    }
  }, []);

  const autoLogin = useCallback(async (): Promise<boolean> => {
    const token = getStoredToken();
    if (!token) return false;

    setLoading(true);
    setError(null);

    try {
      const userInfo = await authApi.autoLoginWithToken(token);
      validateLicances(userInfo);
      setUserInfo(userInfo);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, [getStoredToken, setLoading, setError, setUserInfo]);

  const requestOtp = useCallback(async (gsm: string): Promise<"ok" | "new"> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.requestOtp({ gsm });
      return response.message;
    } catch (err) {
      const message = err instanceof Error ? err.message : "OTP request failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const verifyOtp = useCallback(async (gsm: string, otpCode: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const userInfo = await authApi.verifyOtp({ gsm, otpCode });
      validateLicances(userInfo);
      setUserInfo(userInfo);
    } catch (err) {
      const message = err instanceof Error ? err.message : "OTP verification failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setUserInfo]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return {
    userInfo,
    authStatus,
    activeLicance,
    isAdmin,
    isFinance,
    isManager,
    isLoading,
    error,
    autoLogin,
    requestOtp,
    verifyOtp,
    logout: handleLogout,
    setActiveLicance,
    setError,
  };
}

function validateLicances(userInfo: UserInfo): void {
  if (!userInfo.licances || userInfo.licances.length === 0) {
    throw new Error("Bu uygulama için lisansınız bulunmamaktadır.");
  }
}
