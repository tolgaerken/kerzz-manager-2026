/**
 * Environment configuration
 * Values are loaded from .env files via react-native-config or build-time injection
 */

// For now, using hardcoded values - will be replaced with react-native-config
const ENV = {
  API_URL: __DEV__
    ? "http://localhost:3888/api"
    : "https://io.kerzz.com/api",
  SSO_BASE_URL: "https://sso-service.kerzz.com:4500",
  SSO_API_KEY: "12d8e770-9d68-34f8-b213-42f77dcfa5a2!?@8083!4204**47fd",
};

export const config = {
  apiUrl: ENV.API_URL,
  ssoBaseUrl: ENV.SSO_BASE_URL,
  ssoApiKey: ENV.SSO_API_KEY,
} as const;
