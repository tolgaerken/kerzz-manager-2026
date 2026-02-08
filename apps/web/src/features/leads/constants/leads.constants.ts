const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export const LEADS_CONSTANTS = {
  API_BASE_URL,
  ENDPOINTS: {
    LEADS: "/leads",
  },
  QUERY_KEYS: {
    LEADS: "leads",
    LEAD: "lead",
    LEAD_STATS: "lead-stats",
  },
  DEFAULT_PAGE_SIZE: 50,
} as const;
