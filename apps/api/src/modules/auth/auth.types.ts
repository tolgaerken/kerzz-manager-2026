/**
 * SSO JWT token içindeki userInfo yapısı
 */
export interface SsoTokenUserInfo {
  id: string;
  name: string;
  mail?: string;
  phone?: string;
  accessToken?: string;
  licances?: SsoUserLicence[];
}

/**
 * JWT token payload structure (decoded from SSO token)
 * SSO token yapısı: { userInfo: { id, name, ... }, exp, iat }
 */
export interface JwtPayload {
  sub: string; // user id (extracted from userInfo.id)
  exp?: number;
  iat?: number;
  userInfo?: SsoTokenUserInfo;
}

/**
 * User info from SSO login response
 */
export interface SsoUserInfo {
  id: string;
  name: string;
  accessToken: string;
  mail: string;
  phone?: string;
  licances: SsoUserLicence[];
}

/**
 * User licence from SSO
 */
export interface SsoUserLicence {
  id?: string;
  licanceId?: string;
  brand?: string;
  active?: boolean;
  isSuspend?: boolean;
  branchCodes?: string[];
  roles: SsoRole[];
  allPermissions: SsoPermissionInfo[];
}

/**
 * Role structure from SSO
 */
export interface SsoRole {
  id: string;
  name: string;
  developer?: boolean;
  description?: string;
}

/**
 * Permission structure from SSO
 */
export interface SsoPermissionInfo {
  id: string;
  group: string;
  permission: string;
  description?: string;
}

/**
 * Authenticated user attached to request
 */
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  appId: string;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
  isFinance: boolean;
  isManager: boolean;
}

/**
 * User with full permission details (for /auth/me response)
 */
export interface UserWithPermissions {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  lastLoginDate?: Date;
  appId: string;
  roles: SsoRole[];
  permissions: SsoPermissionInfo[];
  isAdmin: boolean;
  isFinance: boolean;
  isManager: boolean;
}

/**
 * Response from /auth/me endpoint
 */
export interface AuthMeResponse {
  user: UserWithPermissions;
  appUsers: AppUserInfo[];
}

/**
 * App user info (users assigned to the application)
 */
export interface AppUserInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}
