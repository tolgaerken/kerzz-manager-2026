export const COMPANIES_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    COMPANIES: "/companies",
  },
  QUERY_KEYS: {
    COMPANIES: "companies",
    COMPANY: "company",
  },
} as const;
