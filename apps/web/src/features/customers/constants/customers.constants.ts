export const CUSTOMERS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    CUSTOMERS: "/customers"
  },
  QUERY_KEYS: {
    CUSTOMERS: "customers",
    CUSTOMER: "customer"
  },
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200]
} as const;
