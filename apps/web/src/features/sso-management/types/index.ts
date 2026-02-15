// ==================== Base Types ====================

export interface BaseModel {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  creatorId?: string;
  updaterId?: string;
}

// ==================== Application ====================

export interface TApplication extends BaseModel {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface ApplicationFormData {
  name: string;
  description?: string;
  isActive?: boolean;
}

// ==================== Role ====================

export interface TRole extends BaseModel {
  name: string;
  app_id: string;
  developer: boolean;
  level?: number;
  description?: string;
  isActive: boolean;
}

export interface TRoleWithPermissions extends TRole {
  permissionIds: string[];
}

export interface RoleFormData {
  name: string;
  app_id?: string;
  developer?: boolean;
  level?: number;
  description?: string;
  isActive?: boolean;
}

// ==================== Permission ====================

export interface TPermission extends BaseModel {
  app_id: string;
  group: string;
  permission: string;
  permissionId?: string;
  parentId?: string;
  description?: string;
  isActive: boolean;
}

export interface PermissionFormData {
  app_id?: string;
  group: string;
  permission: string;
  parentId?: string;
  description?: string;
  isActive?: boolean;
}

// ==================== Role Permission ====================

export interface TRolePermission extends BaseModel {
  role_id: string;
  permission_id: string;
  role_name?: string;
  permission?: string;
  group?: string;
}

// ==================== User ====================

export interface TUser extends BaseModel {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  resetCode?: string;
  isActive: boolean;
  lastLoginDate?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface AddUserFormData {
  name: string;
  email?: string;
  phone?: string;
  appId: string;
}

export interface AddUserResponse {
  user: TUser;
  userApp: TUserApp;
  isNewUser: boolean;
}

// ==================== User App ====================

export interface TUserApp extends BaseModel {
  app_id: string;
  user_id: string;
  user_name: string;
  isActive: boolean;
  assignedDate?: string;
}

export interface UserAppFormData {
  app_id: string;
  user_id: string;
  user_name: string;
}

// ==================== App License ====================

export interface TAppLicense extends BaseModel {
  app_id: string;
  user_id: string;
  user_name?: string;
  app_name?: string;
  licance_id?: string;
  brand?: string;
  roles: string[];
  license_type?: string;
  start_date?: string;
  end_date?: string;
  features?: string[];
  SelectedTagValues?: string[];
  is_active?: boolean;
}

export interface AppLicenseFormData {
  app_id: string;
  user_id: string;
  user_name?: string;
  app_name?: string;
  licance_id?: string;
  brand?: string;
  roles?: string[];
  license_type?: string;
  start_date?: string;
  end_date?: string;
  features?: string[];
  SelectedTagValues?: string[];
}

// ==================== License (kerzz-contract) ====================

export interface TLicense extends BaseModel {
  licanceId?: string;
  brand?: string;
  companyName?: string;
  taxNumber?: string;
  taxOffice?: string;
  address?: string;
  city?: string;
  district?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

// ==================== API Key ====================

export interface TApiKey extends BaseModel {
  api_key: string;
  app_id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface ApiKeyFormData {
  app_id: string;
  name: string;
  description?: string;
  api_key?: string;
}

// ==================== Permission Matrix ====================

export interface TPermissionMatrixRow {
  permission: TPermission;
  rolePermissions: Record<string, boolean>;
}

export interface TPermissionMatrix {
  roles: TRole[];
  permissionRows: TPermissionMatrixRow[];
  groups: string[];
}

// ==================== Tree Node (for permissions) ====================

export interface TreeNode {
  id: string;
  permission: TPermission;
  children: TreeNode[];
  level: number;
  isExpanded?: boolean;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ==================== Query Params ====================

export interface LicenseSearchParams {
  brand?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  skip?: number;
}

// ==================== Store Types ====================

export interface SsoManagementState {
  // Selected items
  selectedApplication: TApplication | null;
  selectedRole: TRole | null;
  selectedPermission: TPermission | null;
  selectedUser: TUser | null;
  selectedLicense: TLicense | null;
  selectedApiKey: TApiKey | null;
  selectedAppIdForLicense: string | null;

  // Form visibility
  isApplicationFormOpen: boolean;
  isRoleFormOpen: boolean;
  isPermissionFormOpen: boolean;
  isUserFormOpen: boolean;
  isAddUserFormOpen: boolean;
  addUserFormAppId: string | null;
  isApiKeyFormOpen: boolean;
  isUserLicenseModalOpen: boolean;
  isPermissionMatrixOpen: boolean;

  // Form data
  applicationFormData: ApplicationFormData | null;
  roleFormData: RoleFormData | null;
  permissionFormData: PermissionFormData | null;
  userFormData: UserFormData | null;
  apiKeyFormData: ApiKeyFormData | null;

  // Permission matrix
  permissionMatrix: TPermissionMatrix | null;
  selectedRoleForMatrix: TRole | null;

  // Filters
  applicationFilter: string;
  roleFilter: string;
  permissionFilter: string;
  userFilter: string;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

export interface SsoManagementActions {
  // Application actions
  setSelectedApplication: (application: TApplication | null) => void;
  openApplicationForm: (data?: ApplicationFormData) => void;
  closeApplicationForm: () => void;

  // Role actions
  setSelectedRole: (role: TRole | null) => void;
  openRoleForm: (data?: RoleFormData) => void;
  closeRoleForm: () => void;

  // Permission actions
  setSelectedPermission: (permission: TPermission | null) => void;
  openPermissionForm: (data?: PermissionFormData) => void;
  closePermissionForm: () => void;

  // User actions
  setSelectedUser: (user: TUser | null) => void;
  openUserForm: (data?: UserFormData) => void;
  closeUserForm: () => void;
  openAddUserForm: (appId: string) => void;
  closeAddUserForm: () => void;
  openUserLicenseModal: (user: TUser, appId: string) => void;
  closeUserLicenseModal: () => void;

  // API Key actions
  setSelectedApiKey: (apiKey: TApiKey | null) => void;
  openApiKeyForm: (data?: ApiKeyFormData) => void;
  closeApiKeyForm: () => void;

  // Permission Matrix actions
  openPermissionMatrix: (role: TRole) => void;
  closePermissionMatrix: () => void;
  setPermissionMatrix: (matrix: TPermissionMatrix | null) => void;

  // Filter actions
  setApplicationFilter: (filter: string) => void;
  setRoleFilter: (filter: string) => void;
  setPermissionFilter: (filter: string) => void;
  setUserFilter: (filter: string) => void;

  // Loading actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Reset
  reset: () => void;
}

export type SsoManagementStore = SsoManagementState & SsoManagementActions;
