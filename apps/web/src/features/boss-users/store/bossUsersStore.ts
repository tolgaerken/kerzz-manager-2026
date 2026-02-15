import { create } from "zustand";
import type { BossLicenseUser, SsoUser, Branch } from "../types";

interface BossUsersState {
  // Seçili kullanıcı/lisans
  selectedLicense: BossLicenseUser | null;
  selectedUser: SsoUser | null;
  selectedLicenseForBranch: BossLicenseUser | null;

  // Modal durumları
  isEditModalOpen: boolean;
  isBlockDialogOpen: boolean;
  isNotifyDialogOpen: boolean;

  // Form durumları
  isCreatingNew: boolean;

  // Şube yönetimi
  branches: Branch[];
  selectedBranchCodes: string[];
}

interface BossUsersActions {
  // Seçim işlemleri
  setSelectedLicense: (license: BossLicenseUser | null) => void;
  setSelectedUser: (user: SsoUser | null) => void;
  setSelectedLicenseForBranch: (license: BossLicenseUser | null) => void;

  // Modal işlemleri
  openEditModal: (license?: BossLicenseUser) => void;
  closeEditModal: () => void;
  openBlockDialog: (license: BossLicenseUser) => void;
  closeBlockDialog: () => void;
  openNotifyDialog: (license: BossLicenseUser) => void;
  closeNotifyDialog: () => void;

  // Şube işlemleri
  setBranches: (branches: Branch[]) => void;
  setSelectedBranchCodes: (codes: string[]) => void;
  toggleBranch: (branchId: string) => void;
  selectAllBranches: () => void;
  deselectAllBranches: () => void;

  // Reset
  reset: () => void;
}

const initialState: BossUsersState = {
  selectedLicense: null,
  selectedUser: null,
  selectedLicenseForBranch: null,
  isEditModalOpen: false,
  isBlockDialogOpen: false,
  isNotifyDialogOpen: false,
  isCreatingNew: false,
  branches: [],
  selectedBranchCodes: []
};

export const useBossUsersStore = create<BossUsersState & BossUsersActions>((set, get) => ({
  ...initialState,

  // Seçim işlemleri
  setSelectedLicense: (license) => set({ selectedLicense: license }),
  setSelectedUser: (user) => set({ selectedUser: user }),
  setSelectedLicenseForBranch: (license) => set({ selectedLicenseForBranch: license }),

  // Modal işlemleri
  openEditModal: (license) =>
    set({
      isEditModalOpen: true,
      selectedLicense: license || null,
      isCreatingNew: !license,
      selectedUser: null,
      selectedLicenseForBranch: null,
      branches: [],
      selectedBranchCodes: []
    }),

  closeEditModal: () =>
    set({
      isEditModalOpen: false,
      selectedLicense: null,
      selectedUser: null,
      isCreatingNew: false,
      selectedLicenseForBranch: null,
      branches: [],
      selectedBranchCodes: []
    }),

  openBlockDialog: (license) =>
    set({
      isBlockDialogOpen: true,
      selectedLicense: license
    }),

  closeBlockDialog: () =>
    set({
      isBlockDialogOpen: false,
      selectedLicense: null
    }),

  openNotifyDialog: (license) =>
    set({
      isNotifyDialogOpen: true,
      selectedLicense: license
    }),

  closeNotifyDialog: () =>
    set({
      isNotifyDialogOpen: false,
      selectedLicense: null
    }),

  // Şube işlemleri
  setBranches: (branches) => set({ branches }),

  setSelectedBranchCodes: (codes) => set({ selectedBranchCodes: codes }),

  toggleBranch: (branchId) => {
    const { selectedBranchCodes } = get();
    const newCodes = selectedBranchCodes.includes(branchId)
      ? selectedBranchCodes.filter((c) => c !== branchId)
      : [...selectedBranchCodes, branchId];
    set({ selectedBranchCodes: newCodes });
  },

  selectAllBranches: () => {
    const { branches } = get();
    set({ selectedBranchCodes: branches.map((b) => b.id) });
  },

  deselectAllBranches: () => set({ selectedBranchCodes: [] }),

  // Reset
  reset: () => set(initialState)
}));
