export const AUTH_CONSTANTS = {
  SSO_BASE_URL: "https://sso-service.kerzz.com:4500",
  SSO_API_KEY: "8df68169-kerzz-d318-d4b1-dda0d9ae4823!?@998f!840c**d97f",
  
  ENDPOINTS: {
    LOGIN: "/api/user/login",
    RESET_PASSWORD: "/api/user/resetpwd",
    REQUEST_OTP: "/api/login/requestOtpSms",
    VERIFY_OTP: "/api/login/verifyOtpSms",
    AUTO_LOGIN: "/api/login/autoLogin",
  },

  STORAGE_KEYS: {
    USER_INFO: "userInfo",
    ACTIVE_LICANCE: "active-licance",
    REMEMBER: "remember",
    EMAIL: "email",
    PASSWORD: "password",
  },
} as const;
