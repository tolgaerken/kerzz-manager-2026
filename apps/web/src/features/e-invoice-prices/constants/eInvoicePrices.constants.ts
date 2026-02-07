export const E_INVOICE_PRICES_CONSTANTS = {
  API_BASE_URL:
    import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    LIST: "/e-invoice-prices",
    CREATE: "/e-invoice-prices",
    UPDATE: (id: string) =>
      `/e-invoice-prices/${encodeURIComponent(id)}`,
    DELETE: (id: string) =>
      `/e-invoice-prices/${encodeURIComponent(id)}`,
    GET_ONE: (id: string) =>
      `/e-invoice-prices/${encodeURIComponent(id)}`,
    BULK_UPSERT: "/e-invoice-prices/bulk-upsert",
    DELETE_BY_CUSTOMER: (customerErpId: string) =>
      `/e-invoice-prices/by-customer/${encodeURIComponent(customerErpId)}`,
  },
};
