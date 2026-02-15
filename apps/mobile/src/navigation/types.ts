/**
 * Navigation type definitions
 */

export type AuthStackParamList = {
  Login: undefined;
  OtpRequest: undefined;
  OtpVerify: { phone: string };
};

export type MainTabParamList = {
  Home: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  // Deep link targets
  NotificationDetail: { notificationId: string };
  CustomerDetail: { customerId: string };
  ContractDetail: { contractId: string };
  LicenseDetail: { licenseId: string };
};

// Deep link configuration
export const linking = {
  prefixes: ["kerzzio://", "https://io.kerzz.com"],
  config: {
    screens: {
      Main: "main",
      NotificationDetail: "notification/:notificationId",
      CustomerDetail: "customer/:customerId",
      ContractDetail: "contract/:contractId",
      LicenseDetail: "license/:licenseId",
    },
  },
};
