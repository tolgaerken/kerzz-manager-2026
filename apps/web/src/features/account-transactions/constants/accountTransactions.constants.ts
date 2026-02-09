export const ACCOUNT_TRANSACTIONS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    ACCOUNTS: "/erp/accounts",
    TRANSACTIONS: "/erp/transactions",
    DOCUMENT_DETAIL: "/erp/document-detail",
  },
  QUERY_KEYS: {
    ACCOUNTS: "erp-accounts",
    TRANSACTIONS: "erp-transactions",
    DOCUMENT_DETAIL: "erp-document-detail",
  },
  DEFAULT_YEAR: new Date().getFullYear(),
  DEFAULT_COMPANY: "VERI",
} as const;
