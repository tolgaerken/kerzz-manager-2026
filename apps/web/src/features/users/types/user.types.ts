/**
 * SSO User from sso-db
 */
export interface SsoUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  lastLoginDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * App User (user assigned to this application)
 */
export interface AppUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  assignedDate?: string;
}

/**
 * Role definition
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  developer: boolean;
  isActive: boolean;
}

/**
 * Permission definition
 */
export interface Permission {
  id: string;
  group: string;
  permission: string;
  description?: string;
  isActive: boolean;
}

/**
 * Permission group with permissions
 */
export interface PermissionGroup {
  group: string;
  permissions: Permission[];
}

/**
 * Role with its permissions
 */
export interface RoleWithPermissions extends Role {
  permissionIds: string[];
}

/**
 * Assign user request
 */
export interface AssignUserRequest {
  userId: string;
  userName: string;
  roles?: string[];
}

/**
 * Update user roles request
 */
export interface UpdateUserRolesRequest {
  roles: string[];
}
