export const NOTIFICATION_SETTINGS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    TEMPLATES: "/notification-templates",
    SETTINGS: "/notification-settings",
    LOGS: "/notification-logs",
    QUEUE_INVOICES: "/notification-queue/invoices",
    QUEUE_CONTRACTS: "/notification-queue/contracts",
    QUEUE_STATS: "/notification-queue/stats",
    QUEUE_SEND: "/notification-queue/send",
    QUEUE_PREVIEW: "/notification-queue/preview",
    CRON_DRY_RUN: "/cron-jobs",
  },
} as const;
