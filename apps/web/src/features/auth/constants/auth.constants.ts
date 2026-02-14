const ssoBaseUrl = import.meta.env.VITE_SSO_BASE_URL;
const ssoApiKey = import.meta.env.VITE_SSO_API_KEY;

if (!ssoBaseUrl || !ssoApiKey) {
  throw new Error("VITE_SSO_BASE_URL ve VITE_SSO_API_KEY .env dosyasinda tanimli olmali.");
}

export const AUTH_CONSTANTS = {
  SSO_BASE_URL: ssoBaseUrl,
  SSO_API_KEY: ssoApiKey,

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
