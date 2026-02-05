import { create } from "zustand";

interface AppState {
  locale: "tr" | "en";
  setLocale: (locale: "tr" | "en") => void;
}

export const useAppStore = create<AppState>((set) => ({
  locale: "tr",
  setLocale: (locale) => set({ locale })
}));
