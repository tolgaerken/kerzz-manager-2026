/**
 * API endpoint constants shared between web and mobile
 */

export const AUTH_ENDPOINTS = {
  LOGIN: "/api/user/login",
  RESET_PASSWORD: "/api/user/resetpwd",
  REQUEST_OTP: "/api/login/requestOtpSms",
  VERIFY_OTP: "/api/login/verifyOtpSms",
  AUTO_LOGIN: "/api/login/autoLogin",
  AUTH_ME: "/api/auth/me",
  VERIFY_TOKEN: "/api/auth/verify-token",
} as const;

export const NOTIFICATION_ENDPOINTS = {
  LIST: "/manager-notifications",
  MARK_READ: "/manager-notifications/:id/read",
  MARK_ALL_READ: "/manager-notifications/read-all",
  UNREAD_COUNT: "/manager-notifications/unread-count",
} as const;

export const STORAGE_KEYS = {
  USER_INFO: "userInfo",
  ACTIVE_LICANCE: "active-licance",
  REMEMBER: "remember",
  EMAIL: "email",
  PASSWORD: "password",
  DEVICE_TOKEN: "deviceToken",
} as const;
