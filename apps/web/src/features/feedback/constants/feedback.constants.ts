const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export const FEEDBACK_CONSTANTS = {
  API_BASE_URL,
  ENDPOINTS: {
    FEEDBACKS: "/feedbacks",
  },
  QUERY_KEYS: {
    FEEDBACKS: "feedbacks",
    FEEDBACK: "feedback",
  },
  DEFAULT_PAGE_SIZE: 50,
} as const;
