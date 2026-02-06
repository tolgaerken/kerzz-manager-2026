export const PAYMENTS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    LINKS: "/payments/links",
    LINK_INFO: (linkId: string) => `/payments/links/${linkId}/info`,
    LINK_NOTIFY: (linkId: string) => `/payments/links/${linkId}/notify`
  },
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100],
  DATE_RANGE_DAYS: [7, 30, 90] as const,
  STATUS_OPTIONS: [
    { id: "success", name: "Başarılı" },
    { id: "pending", name: "Beklemede" },
    { id: "failed", name: "Başarısız" }
  ] as const,
  COMPANY_OPTIONS: [
    { id: "veri", name: "Veri" },
    { id: "cloud", name: "Cloud" },
    { id: "btt", name: "BTT" },
    { id: "etya", name: "Etya" },
    { id: "markamutfagi", name: "Marka Mutfağı" }
  ] as const
};
