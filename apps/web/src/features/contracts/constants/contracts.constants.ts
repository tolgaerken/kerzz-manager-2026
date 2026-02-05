export const CONTRACTS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    CONTRACTS: "/contracts",
    CONTRACT_USERS: "/contract-users",
    CONTRACT_SUPPORTS: "/contract-supports",
    CONTRACT_SAAS: "/contract-saas",
    CONTRACT_CASH_REGISTERS: "/contract-cash-registers",
    CONTRACT_VERSIONS: "/contract-versions",
    CONTRACT_ITEMS: "/contract-items",
    CONTRACT_DOCUMENTS: "/contract-documents",
    CONTRACT_PAYMENTS: "/contract-payments"
  },
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200]
} as const;
