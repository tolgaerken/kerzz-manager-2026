import { create } from "zustand";
import type { AuthState, UserInfo, UserLicance, AppUser } from "../types/auth.types";
import { AUTH_CONSTANTS } from "../constants/auth.constants";
import { setLoginTimestamp } from "../../../lib/apiClient";

const { STORAGE_KEYS } = AUTH_CONSTANTS;

interface AuthActions {
  setUserInfo: (userInfo: UserInfo) => void;
  setActiveLicance: (licanceId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setPermissions: (permissions: string[]) => void;
  setAppUsers: (appUsers: AppUser[]) => void;
  setRoleFlags: (flags: { isAdmin: boolean; isFinance: boolean; isManager: boolean }) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (...permissions: string[]) => boolean;
  hasAllPermissions: (...permissions: string[]) => boolean;
  logout: () => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  userInfo: null,
  authStatus: false,
  activeLicance: null,
  isAdmin: false,
  isFinance: false,
  isManager: false,
  isLoading: false,
  error: null,
  permissions: [],
  appUsers: []
};

function determineRoles(licance: UserLicance | undefined) {
  if (!licance) {
    return { isAdmin: false, isFinance: false, isManager: false };
  }

  const roleNames = licance.roles.map((r) => r.name.toLowerCase());
  return {
    isAdmin:
      roleNames.includes("veri owner") ||
      roleNames.includes("yönetim") ||
      roleNames.includes("admin"),
    isFinance: roleNames.includes("finans"),
    isManager: roleNames.includes("müdür")
  };
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  setUserInfo: (userInfo: UserInfo) => {
    const activeLicanceId = localStorage.getItem(STORAGE_KEYS.ACTIVE_LICANCE);
    const activeLicance =
      userInfo.licances.find((l) => l.licanceId === activeLicanceId) ??
      userInfo.licances[0] ??
      null;

    const roles = determineRoles(activeLicance);

    // Extract permissions from active licence
    const permissions = activeLicance?.allPermissions?.map((p) => p.permission) ?? [];

    localStorage.setItem(
      STORAGE_KEYS.USER_INFO,
      JSON.stringify({
        gsm: userInfo.phone,
        token: userInfo
      })
    );

    // Login timestamp'ini güncelle - grace period için
    setLoginTimestamp();

    set({
      userInfo,
      authStatus: true,
      activeLicance,
      permissions,
      ...roles,
      error: null
    });
  },

  setActiveLicance: (licanceId: string) => {
    const { userInfo } = get();
    if (!userInfo) return;

    const activeLicance = userInfo.licances.find((l) => l.licanceId === licanceId) ?? null;
    const roles = determineRoles(activeLicance ?? undefined);
    const permissions = activeLicance?.allPermissions?.map((p) => p.permission) ?? [];

    localStorage.setItem(STORAGE_KEYS.ACTIVE_LICANCE, licanceId);
    set({ activeLicance, permissions, ...roles });
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  setPermissions: (permissions: string[]) => set({ permissions }),

  setAppUsers: (appUsers: AppUser[]) => set({ appUsers }),

  setRoleFlags: (flags: { isAdmin: boolean; isFinance: boolean; isManager: boolean }) => set(flags),

  /**
   * Check if user has a specific permission
   */
  hasPermission: (permission: string): boolean => {
    const { isAdmin, permissions } = get();
    // Admin has all permissions
    if (isAdmin) return true;
    return permissions.includes(permission);
  },

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission: (...requiredPermissions: string[]): boolean => {
    const { isAdmin, permissions } = get();
    if (isAdmin) return true;
    return requiredPermissions.some((p) => permissions.includes(p));
  },

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions: (...requiredPermissions: string[]): boolean => {
    const { isAdmin, permissions } = get();
    if (isAdmin) return true;
    return requiredPermissions.every((p) => permissions.includes(p));
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_LICANCE);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER);
    localStorage.removeItem(STORAGE_KEYS.EMAIL);
    localStorage.removeItem(STORAGE_KEYS.PASSWORD);
    set(initialState);
  },

  reset: () => set(initialState)
}));
