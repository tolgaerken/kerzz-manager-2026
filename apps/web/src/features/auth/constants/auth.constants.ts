export const AUTH_CONSTANTS = {
  SSO_BASE_URL: "https://sso-service.kerzz.com:4500",
  SSO_API_KEY: "e5788b40-ec7e-0fe0-daf8-80c17445ab9d!?@f8a4!e347**11d3",
  
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
