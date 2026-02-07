const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export const MANAGER_NOTIFICATION_CONSTANTS = {
  API_BASE_URL,
  ENDPOINTS: {
    NOTIFICATIONS: "/manager-notifications",
    NOTIFICATIONS_UNREAD_COUNT: "/manager-notifications/unread-count",
    NOTIFICATIONS_READ_ALL: "/manager-notifications/read-all",
  },
};
