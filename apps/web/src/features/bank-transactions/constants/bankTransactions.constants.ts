export const BANK_TRANSACTIONS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    BANK_TRANSACTIONS: "/bank-transactions",
    SUMMARY: "/bank-transactions/summary",
    ERP_BANK_MAPS: "/bank-transactions/erp/bank-maps",
    ERP_ACCOUNTS: "/bank-transactions/erp/accounts",
    ERP_GL_ACCOUNTS: "/bank-transactions/erp/gl-accounts",
  },
  QUERY_KEYS: {
    BANK_TRANSACTIONS: "bankTransactions",
    BANK_SUMMARY: "bankSummary",
    ERP_BANK_MAPS: "erpBankMaps",
    ERP_ACCOUNTS: "erpAccounts",
    ERP_GL_ACCOUNTS: "erpGlAccounts",
  },
  STATUS_OPTIONS: [
    { id: "waiting", name: "Bekleyenler" },
    { id: "success", name: "İşlenenler" },
    { id: "error", name: "Hatalılar" },
    { id: "manual", name: "Manuel" },
  ],
  DATE_PRESETS: [
    { id: "today", label: "Bugün" },
    { id: "yesterday", label: "Dün" },
    { id: "thisWeek", label: "Bu Hafta" },
    { id: "lastWeek", label: "Geçen Hafta" },
  ],
  EXCLUDED_BANK_ACC_IDS: ["7505", "8093", "7420", "7507", "7511"],
  DEFAULT_PAGE_SIZE: 500,
} as const;
