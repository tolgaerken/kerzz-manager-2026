import { useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import * as authApi from "../api/authApi";
import {
  performAutoLogin,
  validateLicances,
  syncPermissionsFromBackend
} from "../services/authInitService";

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
    permissions,
    appUsers,
    setUserInfo,
    setActiveLicance,
    setLoading,
    setError,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    logout
  } = useAuthStore();

  const autoLogin = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await performAutoLogin();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const requestOtp = useCallback(
    async (gsm: string): Promise<"ok" | "new"> => {
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
    },
    [setLoading, setError]
  );

  const verifyOtp = useCallback(
    async (gsm: string, otpCode: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const userInfo = await authApi.verifyOtp({ gsm, otpCode });
        validateLicances(userInfo);
        setUserInfo(userInfo);

        await syncPermissionsFromBackend(userInfo.accessToken);
      } catch (err) {
        const message = err instanceof Error ? err.message : "OTP verification failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setUserInfo]
  );

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
    permissions,
    appUsers,
    autoLogin,
    requestOtp,
    verifyOtp,
    logout: handleLogout,
    setActiveLicance,
    setError,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    syncPermissionsFromBackend
  };
}
