import { apiGet, apiPost, apiPut, apiDelete } from "../../../lib/apiClient";
import type {
  TApplication,
  ApplicationFormData,
  TRole,
  TRoleWithPermissions,
  RoleFormData,
  TPermission,
  PermissionFormData,
  TRolePermission,
  TUser,
  TUserApp,
  UserAppFormData,
  TAppLicense,
  AppLicenseFormData,
  TLicense,
  TApiKey,
  ApiKeyFormData,
  LicenseSearchParams,
  AddUserFormData,
  AddUserResponse,
  UpdateUserData
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

// ==================== Applications ====================

export const applicationsApi = {
  list: (includeInactive = false) =>
    apiGet<TApplication[]>(
      `${API_BASE_URL}/sso/applications${includeInactive ? "?includeInactive=true" : ""}`
    ),

  getById: (id: string) => apiGet<TApplication>(`${API_BASE_URL}/sso/applications/${encodeURIComponent(id)}`),

  create: (data: ApplicationFormData) =>
    apiPost<TApplication>(`${API_BASE_URL}/sso/applications`, data),

  update: (id: string, data: Partial<ApplicationFormData>) =>
    apiPut<TApplication>(`${API_BASE_URL}/sso/applications/${encodeURIComponent(id)}`, data),

  delete: (id: string) => apiDelete<void>(`${API_BASE_URL}/sso/applications/${encodeURIComponent(id)}`)
};

// ==================== Roles ====================

export interface RolesListParams {
  all?: boolean;
  appId?: string;
  includeInactive?: boolean;
}

export const rolesApi = {
  list: (params?: RolesListParams) => {
    const queryParams = new URLSearchParams();
    if (params?.all) queryParams.set("all", "true");
    if (params?.appId) queryParams.set("appId", params.appId);
    if (params?.includeInactive) queryParams.set("includeInactive", "true");

    const queryString = queryParams.toString();
    return apiGet<TRole[]>(`${API_BASE_URL}/sso/roles${queryString ? `?${queryString}` : ""}`);
  },

  getById: (id: string) => apiGet<TRoleWithPermissions>(`${API_BASE_URL}/sso/roles/${encodeURIComponent(id)}`),

  create: (data: RoleFormData) => apiPost<TRole>(`${API_BASE_URL}/sso/roles`, data),

  update: (id: string, data: Partial<RoleFormData>) =>
    apiPut<TRole>(`${API_BASE_URL}/sso/roles/${encodeURIComponent(id)}`, data),

  delete: (id: string) => apiDelete<void>(`${API_BASE_URL}/sso/roles/${encodeURIComponent(id)}`),

  setPermissions: (roleId: string, permissions: string[]) =>
    apiPut<{ success: boolean }>(`${API_BASE_URL}/sso/roles/${encodeURIComponent(roleId)}/permissions`, {
      permissions
    })
};

// ==================== Permissions ====================

export interface PermissionsListParams {
  all?: boolean;
  appId?: string;
  includeInactive?: boolean;
}

export const permissionsApi = {
  list: (params?: PermissionsListParams) => {
    const queryParams = new URLSearchParams();
    if (params?.all) queryParams.set("all", "true");
    if (params?.appId) queryParams.set("appId", params.appId);
    if (params?.includeInactive) queryParams.set("includeInactive", "true");

    const queryString = queryParams.toString();
    return apiGet<TPermission[]>(
      `${API_BASE_URL}/sso/permissions${queryString ? `?${queryString}` : ""}`
    );
  },

  getById: (id: string) => apiGet<TPermission>(`${API_BASE_URL}/sso/permissions/${encodeURIComponent(id)}`),

  getGrouped: (all = false, includeInactive = false) => {
    const queryParams = new URLSearchParams();
    if (all) queryParams.set("all", "true");
    if (includeInactive) queryParams.set("includeInactive", "true");

    const queryString = queryParams.toString();
    return apiGet<{ group: string; permissions: TPermission[] }[]>(
      `${API_BASE_URL}/sso/permissions/grouped${queryString ? `?${queryString}` : ""}`
    );
  },

  getGroups: (all = false, includeInactive = false) => {
    const queryParams = new URLSearchParams();
    if (all) queryParams.set("all", "true");
    if (includeInactive) queryParams.set("includeInactive", "true");

    const queryString = queryParams.toString();
    return apiGet<string[]>(
      `${API_BASE_URL}/sso/permissions/groups${queryString ? `?${queryString}` : ""}`
    );
  },

  create: (data: PermissionFormData) =>
    apiPost<TPermission>(`${API_BASE_URL}/sso/permissions`, data),

  update: (id: string, data: Partial<PermissionFormData>) =>
    apiPut<TPermission>(`${API_BASE_URL}/sso/permissions/${encodeURIComponent(id)}`, data),

  delete: (id: string) => apiDelete<void>(`${API_BASE_URL}/sso/permissions/${encodeURIComponent(id)}`)
};

// ==================== Role Permissions ====================

export const rolePermissionsApi = {
  getByRole: (roleId: string) =>
    apiGet<TRolePermission[]>(`${API_BASE_URL}/sso/role-permissions?role_id=${encodeURIComponent(roleId)}`)
};

// ==================== Users ====================

export interface UsersListParams {
  appId?: string;
  all?: boolean;
}

export const usersApi = {
  list: (params?: UsersListParams) => {
    const queryParams = new URLSearchParams();
    if (params?.appId) queryParams.set("appId", params.appId);
    if (params?.all) queryParams.set("all", "true");
    const queryString = queryParams.toString();
    return apiGet<TUser[]>(`${API_BASE_URL}/sso/users${queryString ? `?${queryString}` : ""}`);
  },

  search: (query: string, limit = 20) =>
    apiGet<TUser[]>(`${API_BASE_URL}/sso/users/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  getById: (id: string) => apiGet<TUser>(`${API_BASE_URL}/sso/users/${encodeURIComponent(id)}`),

  getRoles: (userId: string) => apiGet<string[]>(`${API_BASE_URL}/sso/users/${encodeURIComponent(userId)}/roles`),

  updateRoles: (userId: string, roles: string[]) =>
    apiPut<void>(`${API_BASE_URL}/sso/users/${encodeURIComponent(userId)}/roles`, { roles }),

  assign: (data: { userId: string; userName: string; roles?: string[] }) =>
    apiPost<TUserApp>(`${API_BASE_URL}/sso/users/assign`, data),

  remove: (userId: string) => apiDelete<void>(`${API_BASE_URL}/sso/users/${encodeURIComponent(userId)}`),

  update: (userId: string, data: UpdateUserData) =>
    apiPut<TUser>(`${API_BASE_URL}/sso/users/${encodeURIComponent(userId)}`, data),

  addUser: (data: AddUserFormData) =>
    apiPost<AddUserResponse>(`${API_BASE_URL}/sso/users/add`, data)
};

// ==================== User Apps ====================

export const userAppsApi = {
  list: () => apiGet<TUserApp[]>(`${API_BASE_URL}/sso/user-apps`),

  getByUser: (userId: string) =>
    apiGet<TUserApp[]>(`${API_BASE_URL}/sso/user-apps/by-user/${encodeURIComponent(userId)}`),

  getByApp: (appId: string) => apiGet<TUserApp[]>(`${API_BASE_URL}/sso/user-apps/by-app/${encodeURIComponent(appId)}`),

  getById: (id: string) => apiGet<TUserApp>(`${API_BASE_URL}/sso/user-apps/${encodeURIComponent(id)}`),

  create: (data: UserAppFormData) => apiPost<TUserApp>(`${API_BASE_URL}/sso/user-apps`, data),

  update: (id: string, data: Partial<UserAppFormData & { isActive?: boolean }>) =>
    apiPut<TUserApp>(`${API_BASE_URL}/sso/user-apps/${encodeURIComponent(id)}`, data),

  delete: (id: string) => apiDelete<void>(`${API_BASE_URL}/sso/user-apps/${encodeURIComponent(id)}`)
};

// ==================== App Licenses ====================

export const appLicensesApi = {
  list: () => apiGet<TAppLicense[]>(`${API_BASE_URL}/sso/app-licenses`),

  getByUser: (userId: string) =>
    apiGet<TAppLicense[]>(`${API_BASE_URL}/sso/app-licenses/by-user/${encodeURIComponent(userId)}`),

  getByApp: (appId: string) =>
    apiGet<TAppLicense[]>(`${API_BASE_URL}/sso/app-licenses/by-app/${encodeURIComponent(appId)}`),

  getById: (id: string) => apiGet<TAppLicense>(`${API_BASE_URL}/sso/app-licenses/${encodeURIComponent(id)}`),

  create: (data: AppLicenseFormData) =>
    apiPost<TAppLicense>(`${API_BASE_URL}/sso/app-licenses`, data),

  update: (id: string, data: Partial<AppLicenseFormData & { is_active?: boolean }>) =>
    apiPut<TAppLicense>(`${API_BASE_URL}/sso/app-licenses/${encodeURIComponent(id)}`, data),

  delete: (id: string) => apiDelete<void>(`${API_BASE_URL}/sso/app-licenses/${encodeURIComponent(id)}`),

  updateUserRoles: (appId: string, userId: string, roles: string[]) =>
    apiPut<TAppLicense>(`${API_BASE_URL}/sso/app-licenses/user-roles/${encodeURIComponent(appId)}/${encodeURIComponent(userId)}`, { roles })
};

// ==================== Licenses (kerzz-contract) ====================

export const licensesApi = {
  list: (params?: LicenseSearchParams) => {
    const queryParams = new URLSearchParams();
    if (params?.brand) queryParams.set("brand", params.brand);
    if (params?.isActive !== undefined) queryParams.set("isActive", String(params.isActive));
    if (params?.search) queryParams.set("search", params.search);
    if (params?.limit) queryParams.set("limit", String(params.limit));
    if (params?.skip) queryParams.set("skip", String(params.skip));

    const queryString = queryParams.toString();
    return apiGet<TLicense[]>(
      `${API_BASE_URL}/sso/licenses${queryString ? `?${queryString}` : ""}`
    );
  },

  search: (query: string, limit = 20) =>
    apiGet<TLicense[]>(
      `${API_BASE_URL}/sso/licenses/search?q=${encodeURIComponent(query)}&limit=${limit}`
    ),

  getById: (id: string) => apiGet<TLicense>(`${API_BASE_URL}/sso/licenses/${encodeURIComponent(id)}`)
};

// ==================== API Keys ====================

export const apiKeysApi = {
  list: () => apiGet<TApiKey[]>(`${API_BASE_URL}/sso/api-keys`),

  getByApp: (appId: string) => apiGet<TApiKey[]>(`${API_BASE_URL}/sso/api-keys/by-app/${encodeURIComponent(appId)}`),

  getById: (id: string) => apiGet<TApiKey>(`${API_BASE_URL}/sso/api-keys/${encodeURIComponent(id)}`),

  create: (data: ApiKeyFormData) => apiPost<TApiKey>(`${API_BASE_URL}/sso/api-keys`, data),

  update: (id: string, data: Partial<ApiKeyFormData & { isActive?: boolean }>) =>
    apiPut<TApiKey>(`${API_BASE_URL}/sso/api-keys/${encodeURIComponent(id)}`, data),

  delete: (id: string) => apiDelete<void>(`${API_BASE_URL}/sso/api-keys/${encodeURIComponent(id)}`),

  regenerate: (id: string) => apiPost<TApiKey>(`${API_BASE_URL}/sso/api-keys/${encodeURIComponent(id)}/regenerate`, {})
};

// Export all APIs as a single object
export const ssoApi = {
  applications: applicationsApi,
  roles: rolesApi,
  permissions: permissionsApi,
  rolePermissions: rolePermissionsApi,
  users: usersApi,
  userApps: userAppsApi,
  appLicenses: appLicensesApi,
  licenses: licensesApi,
  apiKeys: apiKeysApi
};

export default ssoApi;
