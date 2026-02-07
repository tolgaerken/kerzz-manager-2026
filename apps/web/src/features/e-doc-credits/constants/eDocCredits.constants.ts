export const E_DOC_CREDITS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    LIST: "/e-doc-credits",
    CREATE: "/e-doc-credits",
    UPDATE: (id: string) => `/e-doc-credits/${id}`,
    DELETE: (id: string) => `/e-doc-credits/${id}`,
    GET_ONE: (id: string) => `/e-doc-credits/${id}`,
    CREATE_INVOICE: (id: string) => `/e-doc-credits/${id}/create-invoice`,
  },
};

export const CURRENCY_OPTIONS = [
  { id: "tl", name: "TL" },
  { id: "usd", name: "USD" },
  { id: "eur", name: "EUR" },
] as const;

export const INTERNAL_FIRM_OPTIONS = [
  { id: "kerzz", name: "Kerzz" },
  { id: "propratik", name: "Propratik" },
] as const;
