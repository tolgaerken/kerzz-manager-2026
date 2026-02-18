export const CUSTOMER_SEGMENTS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    CUSTOMER_SEGMENTS: "/customer-segments",
    CUSTOMER_SEGMENTS_MINIMAL: "/customer-segments/minimal"
  },
  QUERY_KEYS: {
    CUSTOMER_SEGMENTS: "customer-segments",
    CUSTOMER_SEGMENT: "customer-segment",
    CUSTOMER_SEGMENTS_MINIMAL: "customer-segments-minimal"
  },
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200]
} as const;
