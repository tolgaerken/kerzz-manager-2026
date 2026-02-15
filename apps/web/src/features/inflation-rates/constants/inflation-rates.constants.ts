export const INFLATION_RATES_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    LIST: "/inflation-rates",
    CREATE: "/inflation-rates",
    UPDATE: (id: string) => `/inflation-rates/${id}`,
    DELETE: (id: string) => `/inflation-rates/${id}`,
  },
} as const;
