/**
 * Auth store using Zustand
 * Manages authentication state for the mobile app
 */

import { create } from "zustand";
import type {
  UserInfo,
  UserLicance,
  AppUser,
  LoginCredentials,
  OtpRequest,
  OtpVerify,
} from "@kerzz/shared";
import { authStorage } from "../lib/secureStorage";
import { ssoClient } from "../lib/ssoClient";
import { apiClient } from "../lib/apiClient";
import { AUTH_ENDPOINTS } from "@kerzz/shared";

interface AuthState {
  // State
  userInfo: UserInfo | null;
  activeLicance: UserLicance | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Backend-synced data
  permissions: string[];
  appUsers: AppUser[];
  isAdmin: boolean;
  isFinance: boolean;
  isManager: boolean;
}

interface AuthActions {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithOtp: (request: OtpVerify) => Promise<void>;
  requestOtp: (request: OtpRequest) => Promise<void>;
  logout: () => Promise<void>;
  setActiveLicance: (licance: UserLicance) => Promise<void>;
  restoreSession: () => Promise<void>;
  syncPermissions: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  userInfo: null,
  activeLicance: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  permissions: [],
  appUsers: [],
  isAdmin: false,
  isFinance: false,
  isManager: false,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const userInfo = await ssoClient.login(credentials);
      await authStorage.setUserInfo(userInfo);

      // Auto-select first active licance
      const activeLicance =
        userInfo.licances.find((l) => l.active && !l.isSuspend) || null;
      if (activeLicance) {
        await authStorage.setActiveLicance(activeLicance);
      }

      set({
        userInfo,
        activeLicance,
        isAuthenticated: true,
        isLoading: false,
      });

      // Sync permissions from backend
      await get().syncPermissions();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Giriş başarısız";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  loginWithOtp: async (request: OtpVerify) => {
    set({ isLoading: true, error: null });
    try {
      const userInfo = await ssoClient.verifyOtp(request);
      await authStorage.setUserInfo(userInfo);

      const activeLicance =
        userInfo.licances.find((l) => l.active && !l.isSuspend) || null;
      if (activeLicance) {
        await authStorage.setActiveLicance(activeLicance);
      }

      set({
        userInfo,
        activeLicance,
        isAuthenticated: true,
        isLoading: false,
      });

      await get().syncPermissions();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "OTP doğrulama başarısız";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  requestOtp: async (request: OtpRequest) => {
    set({ isLoading: true, error: null });
    try {
      await ssoClient.requestOtp(request);
      set({ isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "OTP gönderimi başarısız";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authStorage.removeUserInfo();
      await authStorage.removeActiveLicance();
      set({ ...initialState });
    } catch (error) {
      console.error("Logout error:", error);
      set({ ...initialState });
    }
  },

  setActiveLicance: async (licance: UserLicance) => {
    await authStorage.setActiveLicance(licance);
    set({ activeLicance: licance });
    // Re-sync permissions for new licance
    await get().syncPermissions();
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const [userInfo, activeLicance] = await Promise.all([
        authStorage.getUserInfo(),
        authStorage.getActiveLicance(),
      ]);

      if (userInfo) {
        set({
          userInfo,
          activeLicance,
          isAuthenticated: true,
          isLoading: false,
        });
        // Sync permissions silently
        get().syncPermissions().catch(console.error);
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Session restore error:", error);
      set({ isLoading: false });
    }
  },

  syncPermissions: async () => {
    try {
      const response = await apiClient.get<{
        user: {
          permissions: Array<{ permission: string }>;
          isAdmin: boolean;
          isFinance: boolean;
          isManager: boolean;
        };
        appUsers: AppUser[];
      }>(AUTH_ENDPOINTS.AUTH_ME);

      set({
        permissions: response.user.permissions.map((p) => p.permission),
        appUsers: response.appUsers,
        isAdmin: response.user.isAdmin,
        isFinance: response.user.isFinance,
        isManager: response.user.isManager,
      });
    } catch (error) {
      console.error("Permission sync error:", error);
    }
  },

  clearError: () => set({ error: null }),
}));

// Selectors
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectUserInfo = (state: AuthStore) => state.userInfo;
export const selectActiveLicance = (state: AuthStore) => state.activeLicance;
export const selectPermissions = (state: AuthStore) => state.permissions;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectError = (state: AuthStore) => state.error;
