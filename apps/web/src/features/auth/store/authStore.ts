import { create } from "zustand";
import type { AuthState, UserInfo, UserLicance } from "../types/auth.types";
import { AUTH_CONSTANTS } from "../constants/auth.constants";

const { STORAGE_KEYS } = AUTH_CONSTANTS;

interface AuthActions {
  setUserInfo: (userInfo: UserInfo) => void;
  setActiveLicance: (licanceId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
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
};

function determineRoles(licance: UserLicance | undefined) {
  if (!licance) {
    return { isAdmin: false, isFinance: false, isManager: false };
  }

  const roleNames = licance.roles.map((r) => r.name);
  return {
    isAdmin: roleNames.includes("Veri Owner") || roleNames.includes("Yönetim"),
    isFinance: roleNames.includes("Finans"),
    isManager: roleNames.includes("Müdür"),
  };
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  setUserInfo: (userInfo: UserInfo) => {
    const activeLicanceId = localStorage.getItem(STORAGE_KEYS.ACTIVE_LICANCE);
    const activeLicance = userInfo.licances.find(
      (l) => l.licanceId === activeLicanceId
    ) ?? userInfo.licances[0] ?? null;

    const roles = determineRoles(activeLicance);

    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify({
      gsm: userInfo.phone,
      token: userInfo,
    }));

    set({
      userInfo,
      authStatus: true,
      activeLicance,
      ...roles,
      error: null,
    });
  },

  setActiveLicance: (licanceId: string) => {
    const { userInfo } = get();
    if (!userInfo) return;

    const activeLicance = userInfo.licances.find((l) => l.licanceId === licanceId) ?? null;
    const roles = determineRoles(activeLicance ?? undefined);

    localStorage.setItem(STORAGE_KEYS.ACTIVE_LICANCE, licanceId);
    set({ activeLicance, ...roles });
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_LICANCE);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER);
    localStorage.removeItem(STORAGE_KEYS.EMAIL);
    localStorage.removeItem(STORAGE_KEYS.PASSWORD);
    set(initialState);
  },

  reset: () => set(initialState),
}));
