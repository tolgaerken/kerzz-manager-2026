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
    permissions,
    appUsers,
    setUserInfo,
    setActiveLicance,
    setLoading,
    setError,
    setPermissions,
    setAppUsers,
    setRoleFlags,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    logout
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

  /**
   * Fetch user permissions and app users from backend
   * This syncs permissions from sso-db via our backend
   * Note: This is optional - if it fails, we still have permissions from SSO token
   * @param accessToken - Token to use for the request (for immediate post-login calls)
   */
  const syncPermissionsFromBackend = useCallback(async (accessToken?: string): Promise<void> => {
    try {
      const response = await authApi.getMe(accessToken);

      // Update permissions from backend
      const permissionNames = response.user.permissions.map((p) => p.permission);
      setPermissions(permissionNames);

      // Update app users
      setAppUsers(response.appUsers);

      // Update role flags from backend
      setRoleFlags({
        isAdmin: response.user.isAdmin,
        isFinance: response.user.isFinance,
        isManager: response.user.isManager
      });
      
      console.log("[useAuth] Backend permission sync successful");
    } catch (err) {
      // If backend sync fails, we still have permissions from SSO token
      // Don't let this break the login flow
      console.warn("[useAuth] Backend permission sync failed (non-critical):", err);
    }
  }, [setPermissions, setAppUsers, setRoleFlags]);

  const autoLogin = useCallback(async (): Promise<boolean> => {
    const token = getStoredToken();
    if (!token) return false;

    setLoading(true);
    setError(null);

    try {
      const userInfo = await authApi.autoLoginWithToken(token);
      validateLicances(userInfo);
      setUserInfo(userInfo);

      // Sync permissions from backend after successful login
      // Pass the token directly since localStorage might not be updated yet
      await syncPermissionsFromBackend(userInfo.accessToken);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, [getStoredToken, setLoading, setError, setUserInfo, syncPermissionsFromBackend]);

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

        // Sync permissions from backend after successful login
        // Pass the token directly since localStorage might not be updated yet
        await syncPermissionsFromBackend(userInfo.accessToken);
      } catch (err) {
        const message = err instanceof Error ? err.message : "OTP verification failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setUserInfo, syncPermissionsFromBackend]
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

/**
 * Bu uygulama için gerekli lisans ID'si
 * Kullanıcının bu lisansa sahip olması zorunludur
 */
const REQUIRED_LICENCE_ID = "439";

function validateLicances(userInfo: UserInfo): void {
  if (!userInfo.licances || userInfo.licances.length === 0) {
    throw new Error("Bu uygulama için lisansınız bulunmamaktadır.");
  }

  // 439 nolu lisans kontrolü
  const hasRequiredLicence = userInfo.licances.some(
    (l) => l.licanceId === REQUIRED_LICENCE_ID
  );
  if (!hasRequiredLicence) {
    throw new Error("Bu uygulamayı kullanma yetkiniz yok.");
  }
}
