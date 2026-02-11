export interface UserInfo {
  id: string;
  name: string;
  accessToken: string;
  mail: string;
  phone: string;
  licances: UserLicance[];
}

export interface UserLicance {
  roles: Role[];
  allPermissions: Permission[];
  brand: string;
  id: string;
  licanceId: string;
  active: boolean;
  isSuspend: boolean;
  branchCodes: string[];
}

export interface Role {
  developer: boolean;
  id: string;
  level?: number;
  name: string;
  description?: string;
}

export interface Permission {
  id: string;
  name?: string;
  permission: string;
  group: string;
  description?: string;
}

/**
 * App user info (users assigned to the application)
 */
export interface AppUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

/**
 * User with permissions from backend /auth/me
 */
export interface UserWithPermissions {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  lastLoginDate?: string;
  appId: string;
  roles: Role[];
  permissions: Permission[];
  isAdmin: boolean;
  isFinance: boolean;
  isManager: boolean;
}

/**
 * Response from /auth/me endpoint
 */
export interface AuthMeResponse {
  user: UserWithPermissions;
  appUsers: AppUser[];
}

export interface AuthState {
  userInfo: UserInfo | null;
  authStatus: boolean;
  activeLicance: UserLicance | null;
  isAdmin: boolean;
  isFinance: boolean;
  isManager: boolean;
  isLoading: boolean;
  error: string | null;
  // New fields for backend-synced permissions
  permissions: string[];
  appUsers: AppUser[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OtpRequest {
  gsm: string;
}

export interface OtpVerify {
  gsm: string;
  otpCode: string;
}

export interface LoginResponse {
  token: string;
}
