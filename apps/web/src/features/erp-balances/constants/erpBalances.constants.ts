export const ERP_BALANCES_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    BALANCES: "/erp/balances",
    BALANCES_STATUS: "/erp/balances/status",
    BALANCES_REFRESH: "/erp/balances/refresh",
    BALANCES_BY_COMPANY: "/erp/balances/company",
  },
  QUERY_KEYS: {
    ERP_BALANCES: "erp-balances",
    ERP_BALANCE_STATUS: "erp-balance-status",
    ERP_BALANCES_BY_COMPANY: "erp-balances-by-company",
  },
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200],
} as const;
