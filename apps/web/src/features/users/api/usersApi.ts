import { apiGet, apiPost, apiPut, apiDelete } from "../../../lib/apiClient";
import { USERS_CONSTANTS } from "../constants/users.constants";
import type {
  SsoUser,
  AppUser,
  Role,
  Permission,
  PermissionGroup,
  RoleWithPermissions,
  AssignUserRequest
} from "../types/user.types";

const { API_BASE_URL, ENDPOINTS } = USERS_CONSTANTS;

function normalizeArrayResponse<T>(response: T[] | { data?: T[] }): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

// ==================== USERS ====================

/**
 * Get all users assigned to this application
 */
export async function fetchAppUsers(): Promise<AppUser[]> {
  const response = await apiGet<AppUser[] | { data?: AppUser[] }>(
    `${API_BASE_URL}${ENDPOINTS.APP_USERS}`
  );
  return normalizeArrayResponse(response);
}

/**
 * Search users in SSO database
 */
export async function searchUsers(query: string, limit = 20): Promise<SsoUser[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.SEARCH_USERS}?q=${encodeURIComponent(query)}&limit=${limit}`;
  const response = await apiGet<SsoUser[] | { data?: SsoUser[] }>(url);
  return normalizeArrayResponse(response);
}

/**
 * Get a user by ID
 */
export async function fetchUserById(userId: string): Promise<SsoUser> {
  return apiGet<SsoUser>(`${API_BASE_URL}${ENDPOINTS.USER_BY_ID(userId)}`);
}

/**
 * Assign a user to this application
 */
export async function assignUser(data: AssignUserRequest): Promise<void> {
  return apiPost<void>(`${API_BASE_URL}${ENDPOINTS.ASSIGN_USER}`, data);
}

/**
 * Remove a user from this application
 */
export async function removeUser(userId: string): Promise<void> {
  return apiDelete<void>(`${API_BASE_URL}${ENDPOINTS.REMOVE_USER(userId)}`);
}

/**
 * Get user's roles
 */
export async function fetchUserRoles(userId: string): Promise<string[]> {
  const response = await apiGet<string[] | { data?: string[] }>(
    `${API_BASE_URL}${ENDPOINTS.USER_ROLES(userId)}`
  );
  return normalizeArrayResponse(response);
}

/**
 * Update user's roles
 */
export async function updateUserRoles(userId: string, roles: string[]): Promise<void> {
  return apiPut<void>(`${API_BASE_URL}${ENDPOINTS.USER_ROLES(userId)}`, { roles });
}

// ==================== ROLES ====================

/**
 * Get all roles for this application
 */
export async function fetchRoles(): Promise<Role[]> {
  const response = await apiGet<Role[] | { data?: Role[] }>(`${API_BASE_URL}${ENDPOINTS.ROLES}`);
  return normalizeArrayResponse(response);
}

/**
 * Get a role by ID with its permissions
 */
export async function fetchRoleById(roleId: string): Promise<RoleWithPermissions> {
  return apiGet<RoleWithPermissions>(`${API_BASE_URL}${ENDPOINTS.ROLE_BY_ID(roleId)}`);
}

/**
 * Create a new role
 */
export async function createRole(data: {
  name: string;
  description?: string;
  developer?: boolean;
}): Promise<Role> {
  return apiPost<Role>(`${API_BASE_URL}${ENDPOINTS.ROLES}`, data);
}

/**
 * Update a role
 */
export async function updateRole(
  roleId: string,
  data: { name?: string; description?: string; developer?: boolean; isActive?: boolean }
): Promise<Role> {
  return apiPut<Role>(`${API_BASE_URL}${ENDPOINTS.ROLE_BY_ID(roleId)}`, data);
}

/**
 * Delete a role
 */
export async function deleteRole(roleId: string): Promise<void> {
  return apiDelete<void>(`${API_BASE_URL}${ENDPOINTS.ROLE_BY_ID(roleId)}`);
}

/**
 * Set permissions for a role
 */
export async function setRolePermissions(roleId: string, permissions: string[]): Promise<void> {
  return apiPut<void>(`${API_BASE_URL}${ENDPOINTS.ROLE_PERMISSIONS(roleId)}`, { permissions });
}

// ==================== PERMISSIONS ====================

/**
 * Get all permissions for this application
 */
export async function fetchPermissions(): Promise<Permission[]> {
  const response = await apiGet<Permission[] | { data?: Permission[] }>(
    `${API_BASE_URL}${ENDPOINTS.PERMISSIONS}`
  );
  return normalizeArrayResponse(response);
}

/**
 * Get permissions grouped by group name
 */
export async function fetchPermissionsGrouped(): Promise<PermissionGroup[]> {
  const response = await apiGet<PermissionGroup[] | { data?: PermissionGroup[] }>(
    `${API_BASE_URL}${ENDPOINTS.PERMISSIONS_GROUPED}`
  );
  return normalizeArrayResponse(response);
}

/**
 * Get all permission groups
 */
export async function fetchPermissionGroups(): Promise<string[]> {
  const response = await apiGet<string[] | { data?: string[] }>(
    `${API_BASE_URL}${ENDPOINTS.PERMISSION_GROUPS}`
  );
  return normalizeArrayResponse(response);
}

/**
 * Create a new permission
 */
export async function createPermission(data: {
  group: string;
  permission: string;
  description?: string;
}): Promise<Permission> {
  return apiPost<Permission>(`${API_BASE_URL}${ENDPOINTS.PERMISSIONS}`, data);
}

/**
 * Update a permission
 */
export async function updatePermission(
  permissionId: string,
  data: { group?: string; permission?: string; description?: string; isActive?: boolean }
): Promise<Permission> {
  return apiPut<Permission>(`${API_BASE_URL}${ENDPOINTS.PERMISSION_BY_ID(permissionId)}`, data);
}

/**
 * Delete a permission
 */
export async function deletePermission(permissionId: string): Promise<void> {
  return apiDelete<void>(`${API_BASE_URL}${ENDPOINTS.PERMISSION_BY_ID(permissionId)}`);
}
