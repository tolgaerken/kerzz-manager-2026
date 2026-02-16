import * as authApi from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import { AUTH_CONSTANTS } from "../constants/auth.constants";
import type { UserInfo } from "../types/auth.types";

const REQUIRED_LICENCE_ID = "439";

/**
 * localStorage'dan saklanan accessToken'ı okur
 */
export function getStoredToken(): string | null {
  try {
    const stored = localStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.USER_INFO);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.token?.accessToken ?? null;
  } catch {
    return null;
  }
}

/**
 * Kullanıcının gerekli lisansa (439) sahip olduğunu doğrular
 */
export function validateLicances(userInfo: UserInfo): void {
  if (!userInfo.licances || userInfo.licances.length === 0) {
    throw new Error("Bu uygulama için lisansınız bulunmamaktadır.");
  }

  const hasRequiredLicence = userInfo.licances.some(
    (l) => l.licanceId === REQUIRED_LICENCE_ID
  );
  if (!hasRequiredLicence) {
    throw new Error("Bu uygulamayı kullanma yetkiniz yok.");
  }
}

/**
 * Backend'den güncel yetkileri ve uygulama kullanıcılarını çeker
 * SSO token'dan bağımsız olarak backend permission sync yapar
 */
export async function syncPermissionsFromBackend(accessToken: string): Promise<void> {
  try {
    const response = await authApi.getMe(accessToken);
    const { setPermissions, setAppUsers, setRoleFlags } = useAuthStore.getState();

    const permissionCodes = response.user.permissions.map((p) => p.permission);
    setPermissions(permissionCodes);
    setAppUsers(response.appUsers);
    setRoleFlags({
      isAdmin: response.user.isAdmin,
      isFinance: response.user.isFinance,
      isManager: response.user.isManager,
    });

    console.log("[authInitService] Backend permission sync successful");
  } catch (err) {
    console.warn("[authInitService] Backend permission sync failed (non-critical):", err);
  }
}

/**
 * Sayfa yüklemesinde çalışan autoLogin.
 * Mevcut token'ı SSO ile doğrular, yeni token ve güncel yetkileri yükler.
 * Başarısız olursa hata fırlatır.
 */
export async function performAutoLogin(): Promise<void> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No stored token");
  }

  const userInfo = await authApi.autoLoginWithToken(token);
  validateLicances(userInfo);

  const { setUserInfo } = useAuthStore.getState();
  setUserInfo(userInfo);

  await syncPermissionsFromBackend(userInfo.accessToken);
}
