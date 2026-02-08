import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobile: () => void;
  setMobileOpen: (open: boolean) => void;
}

/**
 * Kerzz Cloud Sidebar Store
 * Sidebar collapse ve mobile drawer yönetimi
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: true,
      isMobileOpen: false,

      toggleCollapse: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),

      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),

      toggleMobile: () =>
        set((state) => ({ isMobileOpen: !state.isMobileOpen })),

      setMobileOpen: (open) => set({ isMobileOpen: open }),
    }),
    {
      name: 'kerzz-sidebar-storage',
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
      }),
    },
  ),
);

export default useSidebarStore;






