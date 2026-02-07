export const E_DOC_MEMBERS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    LIST: "/e-doc-members",
    CREATE: "/e-doc-members",
    UPDATE: (id: string) => `/e-doc-members/${encodeURIComponent(id)}`,
    DELETE: (id: string) => `/e-doc-members/${encodeURIComponent(id)}`,
    GET_ONE: (id: string) => `/e-doc-members/${encodeURIComponent(id)}`,
  },
};

export const CONTRACT_TYPE_OPTIONS = [
  { id: "wholesale", name: "Toplu" },
  { id: "pay-as-you-go", name: "Kontör" },
] as const;

export const INTERNAL_FIRM_OPTIONS = [
  { id: "kerzz", name: "Kerzz" },
  { id: "propratik", name: "Propratik" },
] as const;
