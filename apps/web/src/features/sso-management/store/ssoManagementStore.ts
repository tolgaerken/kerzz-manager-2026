import { create } from "zustand";
import type {
  SsoManagementStore,
  SsoManagementState,
  TApplication,
  TRole,
  TPermission,
  TUser,
  TLicense,
  TApiKey,
  TPermissionMatrix,
  ApplicationFormData,
  RoleFormData,
  PermissionFormData,
  UserFormData,
  ApiKeyFormData
} from "../types";

const initialState: SsoManagementState = {
  // Selected items
  selectedApplication: null,
  selectedRole: null,
  selectedPermission: null,
  selectedUser: null,
  selectedLicense: null,
  selectedApiKey: null,

  // Form visibility
  isApplicationFormOpen: false,
  isRoleFormOpen: false,
  isPermissionFormOpen: false,
  isUserFormOpen: false,
  isApiKeyFormOpen: false,
  isUserLicenseModalOpen: false,
  isPermissionMatrixOpen: false,

  // Form data
  applicationFormData: null,
  roleFormData: null,
  permissionFormData: null,
  userFormData: null,
  apiKeyFormData: null,

  // Permission matrix
  permissionMatrix: null,
  selectedRoleForMatrix: null,

  // Filters
  applicationFilter: "",
  roleFilter: "",
  permissionFilter: "",
  userFilter: "",

  // Loading states
  isLoading: false,
  error: null
};

export const useSsoManagementStore = create<SsoManagementStore>((set) => ({
  ...initialState,

  // Application actions
  setSelectedApplication: (application: TApplication | null) =>
    set({ selectedApplication: application }),

  openApplicationForm: (data?: ApplicationFormData) =>
    set({
      isApplicationFormOpen: true,
      applicationFormData: data || null
    }),

  closeApplicationForm: () =>
    set({
      isApplicationFormOpen: false,
      applicationFormData: null,
      selectedApplication: null
    }),

  // Role actions
  setSelectedRole: (role: TRole | null) => set({ selectedRole: role }),

  openRoleForm: (data?: RoleFormData) =>
    set({
      isRoleFormOpen: true,
      roleFormData: data || null
    }),

  closeRoleForm: () =>
    set({
      isRoleFormOpen: false,
      roleFormData: null,
      selectedRole: null
    }),

  // Permission actions
  setSelectedPermission: (permission: TPermission | null) =>
    set({ selectedPermission: permission }),

  openPermissionForm: (data?: PermissionFormData) =>
    set({
      isPermissionFormOpen: true,
      permissionFormData: data || null
    }),

  closePermissionForm: () =>
    set({
      isPermissionFormOpen: false,
      permissionFormData: null,
      selectedPermission: null
    }),

  // User actions
  setSelectedUser: (user: TUser | null) => set({ selectedUser: user }),

  openUserForm: (data?: UserFormData) =>
    set({
      isUserFormOpen: true,
      userFormData: data || null
    }),

  closeUserForm: () =>
    set({
      isUserFormOpen: false,
      userFormData: null,
      selectedUser: null
    }),

  openUserLicenseModal: (user: TUser) =>
    set({
      isUserLicenseModalOpen: true,
      selectedUser: user
    }),

  closeUserLicenseModal: () =>
    set({
      isUserLicenseModalOpen: false,
      selectedUser: null
    }),

  // API Key actions
  setSelectedApiKey: (apiKey: TApiKey | null) => set({ selectedApiKey: apiKey }),

  openApiKeyForm: (data?: ApiKeyFormData) =>
    set({
      isApiKeyFormOpen: true,
      apiKeyFormData: data || null
    }),

  closeApiKeyForm: () =>
    set({
      isApiKeyFormOpen: false,
      apiKeyFormData: null,
      selectedApiKey: null
    }),

  // Permission Matrix actions
  openPermissionMatrix: (role: TRole) =>
    set({
      isPermissionMatrixOpen: true,
      selectedRoleForMatrix: role
    }),

  closePermissionMatrix: () =>
    set({
      isPermissionMatrixOpen: false,
      selectedRoleForMatrix: null,
      permissionMatrix: null
    }),

  setPermissionMatrix: (matrix: TPermissionMatrix | null) => set({ permissionMatrix: matrix }),

  // Filter actions
  setApplicationFilter: (filter: string) => set({ applicationFilter: filter }),
  setRoleFilter: (filter: string) => set({ roleFilter: filter }),
  setPermissionFilter: (filter: string) => set({ permissionFilter: filter }),
  setUserFilter: (filter: string) => set({ userFilter: filter }),

  // Loading actions
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),

  // Reset
  reset: () => set(initialState)
}));

export default useSsoManagementStore;
