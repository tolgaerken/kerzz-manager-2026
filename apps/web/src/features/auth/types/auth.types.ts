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
  level: number;
  name: string;
}

export interface Permission {
  id: string;
  name: string;
  permission: string;
  group: string;
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
